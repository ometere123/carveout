"use client";
import {useState} from "react";
import Link from "next/link";
import {write,waitFinal,read} from "@/lib/contract";
import {buildCreateAgreementCall, parseProviderBond} from "@/lib/agreementWrite";
import {buildSlaWindow,isValidProposalStartMinutes} from "@/lib/slaWindow";
import {isMatchingProposedAgreement,NO_RESUBMIT_UNTIL_VERIFIED} from "@/lib/actionVerification";
import {emptyAgreementDraft,sampleAgreementDraft} from "@/lib/agreementForm";
import {useInjectedWallet} from "@/lib/wallet";
import {TxNotice} from "@/components/TxNotice";

export default function Open(){
  const wallet=useInjectedWallet();
  const [form,setForm]=useState(emptyAgreementDraft);
  const [sampleLoaded,setSampleLoaded]=useState(false);
  const [phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState(""),[message,setMessage]=useState("");
  const [validation,setValidation]=useState<string[]>([]);
  const [createdId,setCreatedId]=useState("");
  const update=(key:string,value:string)=>{setForm(current=>({...current,[key]:value}));setSampleLoaded(false)};
  function loadSample(){setForm(sampleAgreementDraft());setSampleLoaded(true);setValidation([]);setError("");setCreatedId("");setPhase("");setHash("")}
  async function submit(){
    const issues:string[]=[];
    const customer=form.customer.trim();
    if(!/^0x[0-9a-fA-F]{40}$/.test(customer))issues.push("Enter a valid customer address.");
    if(wallet.address&&customer.toLowerCase()===wallet.address.toLowerCase())issues.push("Provider and customer must be different addresses.");
    if(!form.service.trim())issues.push("Enter the service name.");
    if(!form.metric.trim())issues.push("Enter the SLA metric.");
    let serviceHost="";
    try{const u=new URL(form.url);serviceHost=u.hostname.toLowerCase();if(u.protocol!=="https:"||!serviceHost||u.username||u.password||u.port||isPlaceholderHost(serviceHost))issues.push("Use a real public HTTPS service URL; reserved example/test domains are not accepted.");}catch{issues.push("Enter a valid public HTTPS service URL.");}
    const target=Number(form.target),startMinutes=Number(form.startAfterMinutes),durationMinutes=Number(form.durationMinutes),challengeSeconds=Number(form.challenge);
    if(!Number.isInteger(target)||target<1||target>10000)issues.push("Target must be an integer from 1 to 10,000 bps.");
    if(!isValidProposalStartMinutes(startMinutes))issues.push("The app requires a selected SLA start at least 15 minutes in the future. The contract requires 10 minutes at execution; the extra time allows wallet signing, submission, and finalization. Customer acceptance is still required at least five minutes before exposure.");
    if(!Number.isInteger(durationMinutes)||durationMinutes<60||startMinutes+durationMinutes>90*24*60)issues.push("SLA duration must be at least 60 minutes and the complete window must fit within 90 days.");
    if(!Number.isInteger(challengeSeconds)||challengeSeconds<600||challengeSeconds>86400)issues.push("Challenge window must be 600-86,400 seconds.");
    try{
      const parsed=JSON.parse(form.sourcePolicy);
      for(const group of ["measurement","exception","challenge"]){
        const rows=parsed?.[group];
        if(!Array.isArray(rows)||rows.length<1||rows.length>8){issues.push(group+" source policy must contain 1-8 real origins.");continue;}
        const hosts=rows.map((x:any)=>String(x.host||"").toLowerCase().replace(/\.$/,""));
        if(hosts.some((h:string)=>!h||isPlaceholderHost(h)))issues.push(group+" policy contains a missing or reserved placeholder host.");
        if(new Set(hosts).size!==hosts.length)issues.push(group+" policy origins must be distinct.");
      }
      const ms=parsed?.measurement;
      if(Array.isArray(ms)&&(new Set(ms.map((x:any)=>x.kind)).size<2||!ms.some((x:any)=>x.kind==="INDEPENDENT_PROBE")))issues.push("Measurement policy needs at least two source families, including an independently operated probe outside the service provider's control.");
      if(Array.isArray(ms)&&serviceHost){const probe=ms.find((x:any)=>x.kind==="INDEPENDENT_PROBE")?.host?.toLowerCase();if(probe&&sameServiceDomain(probe,serviceHost))issues.push("The independent probe must use an origin outside the service domain.");}
    }catch{issues.push("Source policy must be valid JSON with measurement, exception and challenge arrays.");}
    try{parseProviderBond(form.credit);}catch(e:any){issues.push(e?.message||"Enter a valid exact GEN amount.");}
    setValidation(issues);if(issues.length)return;
    if(!wallet.address)return setError("Connect an injected EIP-1193 wallet first.");
    if(!wallet.correctNetwork)return setError("Switch the injected wallet to GenLayer Studionet (61999).");
    let finalized=false,submitted=false;
    try{
      setError("");setMessage("");setHash("");setCreatedId("");setPhase("signing");
      const agreementsBefore=await read("list_agreements",[0,30]);
      const countBefore=Number(agreementsBefore?.total||0);
      const now=Math.floor(Date.now()/1000);
      const {start,end}=buildSlaWindow(Number(form.startAfterMinutes),Number(form.durationMinutes),now);
      const credit=parseProviderBond(form.credit);
      const agreementCall=buildCreateAgreementCall({
        customer,service:form.service.trim(),serviceUrl:form.url.trim(),metric:form.metric.trim(),targetBps:Number(form.target),
        maxCreditAtto:credit,windowStart:start,windowEnd:end,exceptions:form.exceptions,policy:form.policy,
        sourcePolicy:form.sourcePolicy,challengeWindowSeconds:Number(form.challenge)
      });
      const tx=await write(wallet.address,"create_agreement",agreementCall.args,agreementCall.value);
      submitted=true;setHash(String(tx));setPhase("submitted");await new Promise(resolve=>setTimeout(resolve,500));setPhase("finalizing");
      const execution=await waitFinal(String(tx),()=>setPhase("verifying-execution"));finalized=true;setPhase("verifying-state");
      const list=await read("list_agreements",[0,30]);
      const countAfter=Number(list?.total||0);
      const added=Math.min(30,Math.max(0,countAfter-countBefore));
      const page=added?await read("list_agreements",[countBefore,added]):{items:[]};
      const match=(page?.items||[]).find((item:any)=>isMatchingProposedAgreement(item,{provider:wallet.address!,customer,service:form.service.trim(),bondAtto:credit.toString()}));
      const stored=match?.id?await read("get_agreement",[match.id]):null;
      if(!isMatchingProposedAgreement(stored,{provider:wallet.address,customer,service:form.service.trim(),bondAtto:credit.toString()})){setPhase("verification-incomplete");setMessage(execution.execution==="unknown"?`The chain finalized this write, but the execution result is unavailable and no matching PROPOSED agreement was found. ${NO_RESUBMIT_UNTIL_VERIFIED}`:`The execution receipt succeeded, but the expected PROPOSED agreement was not found in canonical state. ${NO_RESUBMIT_UNTIL_VERIFIED}`);return;}
      setCreatedId(stored.id);setPhase("state-verified");
    }catch(e:any){const text=e?.message||String(e);if(text.startsWith("Transaction rolled back:")){setError(text);setPhase("failed");}else if(finalized){setPhase("verification-incomplete");setMessage("The chain finalized this write, but canonical state could not be verified. Do not resubmit until the transaction and registry are verified. "+text);}else if(submitted){setPhase("submitted-unverified");setMessage("The write was submitted, but finalization could not be confirmed. Inspect its Explorer record before taking any further action. Do not resubmit while its status is unknown. "+text);}else{setError(text);setPhase("");}}
  }
  return <section className="shell page">
    <div className="page-intro"><div><div className="kicker">New agreement</div><h1>Freeze the exception.</h1></div><p>The provider bonds the maximum credit and proposes the exact SLA, exception clauses, and public source origins. The named customer must accept before the exposure window begins.</p></div>
    <div className="form-grid"><div className="form-sheet">
      <div className="form-heading"><div><div className="kicker">Agreement details</div><p>Set the parties, covered service, and measurable SLA.</p></div><button className="button sample-button" type="button" onClick={loadSample}>Load Sample Agreement</button></div>
      {sampleLoaded&&<div className="sample-warning" role="status"><b>Illustrative sample loaded.</b> The customer address and evidence sources are examples, not verified incident evidence. Replace them and verify every source before creating a real agreement.</div>}
      <div className="two"><Field label="Customer wallet address" placeholder="0x… (40 hexadecimal characters)" value={form.customer} set={v=>update("customer",v)}/><Field label="Service name" placeholder="e.g. Payments API" value={form.service} set={v=>update("service",v)}/></div>
      <Field label="Service URL" placeholder="https://service.example (use the real public service host)" value={form.url} set={v=>update("url",v)}/>
      <div className="two"><Field label="SLA metric" placeholder="e.g. monthly availability" value={form.metric} set={v=>update("metric",v)}/><Field label="Target (basis points)" placeholder="e.g. 9995 = 99.95%" value={form.target} set={v=>update("target",v)}/></div>
      <div className="two"><Field label="Provider bond / maximum credit (GEN)" placeholder="0.001–50 GEN" value={form.credit} set={v=>update("credit",v)}/><Field label="Challenge window (seconds)" placeholder="600–86400" value={form.challenge} set={v=>update("challenge",v)}/></div>
      <div className="two"><Field label="SLA begins after (minutes)" placeholder="At least 15 minutes" value={form.startAfterMinutes} set={v=>update("startAfterMinutes",v)}/><Field label="SLA duration (minutes)" placeholder="At least 60 minutes" value={form.durationMinutes} set={v=>update("durationMinutes",v)}/></div>
      <div className="form-section-label">Frozen terms and evidence policy</div>
      <Area label="Exception clauses (JSON)" placeholder='[{"code":"…","title":"…","rule":"…","proof":"…"}]' value={form.exceptions} set={v=>update("exceptions",v)}/>
      <Area label="Measurement and adjudication policy" placeholder="State what evidence can establish the miss or excuse it. Unavailable evidence is not proof." value={form.policy} set={v=>update("policy",v)}/>
      <Area label="Source families, origins, and path prefixes (JSON)" placeholder={'{"measurement":[{"kind":"PROVIDER_STATUS","host":"status.your-service.com","path_prefix":"/incidents"},{"kind":"INDEPENDENT_PROBE","host":"probe.your-service.org","path_prefix":"/"}],"exception":[{"kind":"PUBLIC_NOTICE","host":"notices.your-service.org","path_prefix":"/"}],"challenge":[{"kind":"COUNTER_EVIDENCE","host":"evidence.your-service.org","path_prefix":"/"}]}'} value={form.sourcePolicy} set={v=>update("sourcePolicy",v)}/>
      <p className="micro-note">Use real, public HTTPS origins relevant to this service. Each policy group requires 1–8 distinct origins. Measurement needs at least two source families, including an independent probe on a separate origin. The customer accepts this exact frozen policy. The contract requires at least 10 minutes before SLA start at execution; this app requires you to select at least 15 minutes when creating a proposal to leave time for wallet signing, submission, and finalization. The timestamp uses your selected interval without added minutes. Customer acceptance must still occur at least 5 minutes before SLA exposure.</p>
      {validation.length>0&&<ul className="tx tx-error" role="alert">{validation.map((item,i)=><li key={i}>{item}</li>)}</ul>}
      <button className="button red" onClick={submit} disabled={phase==="signing"||phase==="submitted"||phase==="submitted-unverified"||phase==="finalizing"||phase==="verifying-execution"||phase==="verifying-state"||phase==="verification-incomplete"}>Fund and propose agreement</button>
      {createdId&&<p className="micro-note" role="status">Proposal persisted and verified: <Link href={"/agreements/"+createdId}>{createdId} · open agreement</Link></p>}
      <TxNotice phase={phase} hash={hash} error={error} message={message}/>
    </div><aside className="side-note"><div className="kicker">Formation rule</div><h2>Neither party can change the agreement after acceptance.</h2><p>The contract requires at least 10 minutes before SLA start when the proposal executes. This app requires a selected lead of at least 15 minutes to leave time for wallet signing, submission, and finalization before that boundary. The timestamp uses the interval you select without added time. The named customer must accept the same specification at least five minutes before SLA exposure. An unaccepted proposal has a bounded bond refund.</p><p>The source policy pins evidence families to exact HTTPS hosts and path prefixes. Measurement requires distinct origins, including an independent probe.</p><p className="micro-note">The form starts blank. Nothing is sent to the contract until you submit and approve the wallet transaction.</p></aside></div>
  </section>
}
function Field({label,value,set,placeholder=""}:{label:string,value:string,set:(v:string)=>void,placeholder?:string}){const id=`field-${label.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;return <div className="field"><label htmlFor={id}>{label}</label><input id={id} value={value} placeholder={placeholder} onChange={e=>set(e.target.value)}/></div>}
function Area({label,value,set,placeholder=""}:{label:string,value:string,set:(v:string)=>void,placeholder?:string}){const id=`field-${label.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;return <div className="field"><label htmlFor={id}>{label}</label><textarea id={id} value={value} placeholder={placeholder} onChange={e=>set(e.target.value)}/></div>}

function isPlaceholderHost(host:string){return ["example.com","example.org","example.net","localhost","local","internal"].includes(host)||host.endsWith(".example.com")||host.endsWith(".example.org")||host.endsWith(".example.net")||host.endsWith(".example")||host.endsWith(".invalid")||host.endsWith(".test")||host.endsWith(".localhost")||host.endsWith(".local")||host.endsWith(".internal")}
function sameServiceDomain(host:string,serviceHost:string){const tail=(x:string)=>x.split(".").slice(-2).join(".");return host===serviceHost||host.endsWith("."+serviceHost)||serviceHost.endsWith("."+host)||tail(host)===tail(serviceHost)}
