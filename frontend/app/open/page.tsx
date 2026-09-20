"use client";
import {useState} from "react";
import Link from "next/link";
import {write,waitFinal,gen,read} from "@/lib/contract";
import {parseGenAmount} from "@/lib/amount";
import {useInjectedWallet} from "@/lib/wallet";
import {TxNotice} from "@/components/TxNotice";

const exceptions=`[{"code":"MAINT","title":"Scheduled maintenance","rule":"48 hour notice and matching window are required","proof":"Dated public notice and timeline"},{"code":"UPSTREAM","title":"Upstream outage","rule":"A named dependency outage must materially cause impact","proof":"Official upstream plus service timeline"}]`;
const sourcePolicy=JSON.stringify({measurement:[],exception:[],challenge:[]},null,2);

export default function Open(){
  const wallet=useInjectedWallet();
  const [form,setForm]=useState({customer:"",service:"",url:"",metric:"",target:"9995",credit:"0.001",exceptions,policy:"Use only the agreed public origins and paths below. Unavailable evidence is not proof.",sourcePolicy,startAfterHours:"24",durationDays:"30",challenge:"1800"});
  const [phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState("");
  const [validation,setValidation]=useState<string[]>([]);
  const [createdId,setCreatedId]=useState("");
  const update=(key:string,value:string)=>setForm(current=>({...current,[key]:value}));
  async function submit(){
    const issues:string[]=[];
    const customer=form.customer.trim();
    if(!/^0x[0-9a-fA-F]{40}$/.test(customer))issues.push("Enter a valid customer address.");
    if(wallet.address&&customer.toLowerCase()===wallet.address.toLowerCase())issues.push("Provider and customer must be different addresses.");
    if(!form.service.trim())issues.push("Enter the service name.");
    if(!form.metric.trim())issues.push("Enter the SLA metric.");
    let serviceHost="";
    try{const u=new URL(form.url);serviceHost=u.hostname.toLowerCase();if(u.protocol!=="https:"||!serviceHost||u.username||u.password||u.port||isPlaceholderHost(serviceHost))issues.push("Use a real public HTTPS service URL; reserved example/test domains are not accepted.");}catch{issues.push("Enter a valid public HTTPS service URL.");}
    const target=Number(form.target),startHours=Number(form.startAfterHours),durationDays=Number(form.durationDays),challengeSeconds=Number(form.challenge);
    if(!Number.isInteger(target)||target<1||target>10000)issues.push("Target must be an integer from 1 to 10,000 bps.");
    if(!Number.isInteger(startHours)||startHours<1)issues.push("SLA start must be at least one hour in the future.");
    if(!Number.isInteger(durationDays)||durationDays<1||startHours+durationDays*24>90*24)issues.push("SLA duration must be at least one day and the complete window must fit within 90 days.");
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
      if(Array.isArray(ms)&&(new Set(ms.map((x:any)=>x.kind)).size<2||!ms.some((x:any)=>x.kind==="INDEPENDENT_PROBE")))issues.push("Measurement policy needs at least two source families, including INDEPENDENT_PROBE.");
      if(Array.isArray(ms)&&serviceHost){const probe=ms.find((x:any)=>x.kind==="INDEPENDENT_PROBE")?.host?.toLowerCase();if(probe&&sameServiceDomain(probe,serviceHost))issues.push("The independent probe must use an origin outside the service domain.");}
    }catch{issues.push("Source policy must be valid JSON with measurement, exception and challenge arrays.");}
    try{const credit=parseGenAmount(form.credit);if(credit<1000000000000000n||credit>50n*10n**18n)issues.push("Provider bond and maximum credit must be between 0.001 and 50 GEN.");}catch(e:any){issues.push(e?.message||"Enter a valid exact GEN amount.");}
    setValidation(issues);if(issues.length)return;
    if(!wallet.address)return setError("Connect an injected EIP-1193 wallet first.");
    if(!wallet.correctNetwork)return setError("Switch the injected wallet to GenLayer Studionet (61999).");
    let finalized=false;
    try{
      setError("");setHash("");setCreatedId("");setPhase("signing");
      const now=Math.floor(Date.now()/1000);
      const start=now+Number(form.startAfterHours)*3600;
      const end=start+Number(form.durationDays)*86400;
      const credit=gen(form.credit);
      const tx=await write(wallet.address,"create_agreement",[
        customer,form.service.trim(),form.url.trim(),form.metric.trim(),Number(form.target),credit.toString(),start,end,
        form.exceptions,form.policy,form.sourcePolicy,Number(form.challenge)
      ],credit);
      setHash(String(tx));setPhase("finalizing");await waitFinal(String(tx));finalized=true;setPhase("readback");
      const list=await read("list_agreements",[0,30]);
      if(!Number(list?.total))throw new Error("Finalized transaction did not produce a readable agreement record.");
      const page=await read("list_agreements",[Math.max(0,Number(list.total)-1),1]);
      const newest=page?.items?.[page.items.length-1];
      if(!newest?.id)throw new Error("The new agreement is missing from the canonical registry.");
      const stored=await read("get_agreement",[newest.id]);
      if(stored.status!=="PROPOSED"||String(stored.provider).toLowerCase()!==wallet.address.toLowerCase()||String(stored.customer).toLowerCase()!==customer.toLowerCase()||stored.service_name!==form.service.trim()||String(stored.bond_atto)!==credit.toString())throw new Error("Canonical agreement readback does not match the proposal. Do not submit again until you inspect the transaction and registry.");
      setCreatedId(stored.id);setPhase("finalized");
    }catch(e:any){setError(finalized?"Transaction finalized, but canonical readback verification failed. Do not resubmit until you inspect the transaction. "+(e?.message||String(e)):(e?.message||String(e)));setPhase(finalized?"readback-failed":"");}
  }
  return <section className="shell page">
    <div className="page-intro"><div><div className="kicker">new service covenant</div><h1>freeze the exception.</h1></div><p>The provider bonds the maximum credit and proposes the exact SLA, exception clauses, and public source origins. The named customer must accept before the exposure window begins.</p></div>
    <div className="form-grid"><div className="form-sheet">
      <div className="two"><Field label="named customer address" value={form.customer} set={v=>update("customer",v)}/><Field label="service name" value={form.service} set={v=>update("service",v)}/></div>
      <Field label="service URL" value={form.url} set={v=>update("url",v)}/>
      <div className="two"><Field label="metric" value={form.metric} set={v=>update("metric",v)}/><Field label="target bps" value={form.target} set={v=>update("target",v)}/></div>
      <div className="two"><Field label="provider bond / max credit · GEN" value={form.credit} set={v=>update("credit",v)}/><Field label="challenge window seconds" value={form.challenge} set={v=>update("challenge",v)}/></div>
      <div className="two"><Field label="SLA starts after · hours" value={form.startAfterHours} set={v=>update("startAfterHours",v)}/><Field label="SLA duration · days" value={form.durationDays} set={v=>update("durationDays",v)}/></div>
      <Area label="frozen exception clauses · JSON" value={form.exceptions} set={v=>update("exceptions",v)}/>
      <Area label="measurement / adjudication policy" value={form.policy} set={v=>update("policy",v)}/>
      <Area label="frozen source families, origins and path prefixes · JSON" value={form.sourcePolicy} set={v=>update("sourcePolicy",v)}/>
      <p className="micro-note">Use actual public evidence origins that can publish the measurement, exception, and counter-evidence for this specific service. Placeholder domains are rejected; the customer accepts this frozen source policy with the SLA.</p>
      {validation.length>0&&<ul className="tx tx-error" role="alert">{validation.map((item,i)=><li key={i}>{item}</li>)}</ul>}
      <button className="button red" onClick={submit} disabled={phase==="signing"||phase==="finalizing"}>fund + propose covenant</button>
      {createdId&&<p className="micro-note" role="status">Proposal persisted and verified: <Link href={"/agreements/"+createdId}>{createdId} · open agreement</Link></p>}
      <TxNotice phase={phase} hash={hash} error={error}/>
    </div><aside className="side-note"><div className="kicker">formation rule</div><h2>Neither party can change the file after acceptance.</h2><p>Agreement creation leaves the bond in a proposed state. The customer accepts the same specification at least five minutes before SLA exposure. An unaccepted proposal has a bounded bond refund.</p><p>The source policy pins evidence families to exact HTTPS hosts and path prefixes. Measurement requires separate origins, including an independent probe origin.</p></aside></div>
  </section>
}
function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><input value={value} onChange={e=>set(e.target.value)}/></div>}
function Area({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><textarea value={value} onChange={e=>set(e.target.value)}/></div>}

function isPlaceholderHost(host:string){return ["example.com","example.org","example.net","localhost","local","internal"].includes(host)||host.endsWith(".example.com")||host.endsWith(".example.org")||host.endsWith(".example.net")||host.endsWith(".example")||host.endsWith(".invalid")||host.endsWith(".test")||host.endsWith(".localhost")||host.endsWith(".local")||host.endsWith(".internal")}
function sameServiceDomain(host:string,serviceHost:string){const tail=(x:string)=>x.split(".").slice(-2).join(".");return host===serviceHost||host.endsWith("."+serviceHost)||serviceHost.endsWith("."+host)||tail(host)===tail(serviceHost)}
