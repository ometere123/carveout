"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { read, waitFinal, write } from "@/lib/contract";
import { formatGenAmount } from "@/lib/amount";
import { useInjectedWallet } from "@/lib/wallet";
import { TxNotice } from "@/components/TxNotice";
import { isExpectedActionState, NO_RESUBMIT_UNTIL_VERIFIED, resolveWriteVerification } from "@/lib/actionVerification";
import { canonicalUtcTimestamp, formatWatTimestamp } from "@/lib/time";
import { isMissingAgreementRead } from "@/lib/agreementLookup";
import Link from "next/link";

const now = () => Math.floor(Date.now()/1000);
const genText = (v:any) => `${formatGenAmount(BigInt(String(v || 0)), 6)} GEN`;
const short = (v="") => v.length > 18 ? `${v.slice(0,9)}…${v.slice(-6)}` : v;
function WatTime({value}:{value:string|number}){return <time dateTime={canonicalUtcTimestamp(value)} title={`Canonical UTC: ${canonicalUtcTimestamp(value)} · Unix seconds: ${String(value)}`}>{formatWatTimestamp(value)}</time>}
function defaultEvidence(policy:any,group:string){
  const entries=policy?.[group]||[];
  return JSON.stringify(entries.slice(0,group==="measurement"?2:2).map((x:any,i:number)=>({
    kind:x.kind,url:`https://${x.host}${x.path_prefix==="/"?`/${group}`:x.path_prefix}`,
    note:`${group} source ${i+1} listed in the agreement's frozen source policy.`
  })),null,2);
}
function defaultChallengeUrl(policy:any){const x=policy?.challenge?.[0];return x?`https://${x.host}${x.path_prefix==="/"?"/evidence":x.path_prefix}`:"";}


export default function AgreementDetail(){
  const {id}=useParams<{id:string}>();
  const searchParams=useSearchParams();
  const wallet=useInjectedWallet();
  const [agreement,setAgreement]=useState<any>(null),[incident,setIncident]=useState<any>(null);
  const [notFound,setNotFound]=useState(false);
  const [phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState(""),[message,setMessage]=useState("");
  const submittedHash=useRef("");
  const finalityKnown=useRef(false);
  const [miss,setMiss]=useState({actual:"9900",from:"",to:"",evidence:"[]"});
  const [claim,setClaim]=useState({code:"",evidence:"[]"});
  const [challenge,setChallenge]=useState({text:"",url:""});

  const refresh=useCallback(async()=>{
    try{
      const a=await read("get_agreement",[id]);
      if(!a||!a.id){setAgreement(null);setIncident(null);setNotFound(true);setError("");return {agreement:null,incident:null};}
      setAgreement(a);setNotFound(false);
      setMiss(x=>({...x,evidence:x.evidence==="[]"?defaultEvidence(a.source_policy,"measurement"):x.evidence}));
      setClaim(x=>({...x,evidence:x.evidence==="[]"?defaultEvidence(a.source_policy,"exception"):x.evidence}));
      setChallenge(x=>({...x,url:x.url||defaultChallengeUrl(a.source_policy)}));
      const nextIncident=a.incident_id?await read("get_incident",[a.incident_id]):null;
      setIncident(nextIncident);
      setError("");
      return { agreement:a, incident:nextIncident };
    }catch(e:any){
      if(isMissingAgreementRead(e)){setAgreement(null);setIncident(null);setNotFound(true);setError("");return {agreement:null,incident:null};}
      setNotFound(false);setError(e?.message||String(e));throw e;
    }
  },[id]);
  useEffect(()=>{refresh().catch(()=>{})},[refresh]);

  const role=useMemo(()=>{
    const a=wallet.address?.toLowerCase(); if(!a||!agreement)return "observer";
    if(a===String(agreement.provider).toLowerCase())return "provider";
    if(a===String(agreement.customer).toLowerCase())return "customer";
    return "observer";
  },[wallet.address,agreement]);

  async function transact(name:string,args:any[]=[],value?:bigint){
    if(!wallet.address)throw new Error("Connect an injected EIP-1193 wallet first");
    if(!wallet.correctNetwork)throw new Error("Switch the injected wallet to GenLayer Studionet (61999) before signing.");
    const beforeAgreement=agreement,beforeIncident=incident;
    const creditAddress=name==="expire_proposal"||name==="expire_agreement"?String(agreement?.provider):name==="withdraw_credit"?wallet.address:"";
    const creditBefore=creditAddress?String(await read("get_credit",[creditAddress])):undefined;
    const statsBefore=name==="withdraw_credit"?await read("get_stats"):undefined;
    const settlement=name==="finalize_incident"||name==="finalize_default_breach";
    const settlementParties=settlement?[String(agreement.customer),String(agreement.provider)]:[];
    const creditsBefore=Object.fromEntries(await Promise.all(settlementParties.map(async party=>[party.toLowerCase(),String(await read("get_credit",[party]))] as const)));
    setError("");setMessage("");setPhase("signing");setHash("");submittedHash.current="";finalityKnown.current=false;
    const tx=await write(wallet.address,name,args,value);setHash(String(tx));submittedHash.current=String(tx);setPhase("submitted");await new Promise(resolve=>setTimeout(resolve,500));setPhase("finalizing");
    const outcome=await waitFinal(String(tx),()=>setPhase("verifying-execution"));finalityKnown.current=true;setPhase("verifying-state");
    const after=await refresh();
    if(!after.incident&&beforeIncident?.id&&["verify_measurement","dismiss_unproven_measurement"].includes(name))after.incident=await read("get_incident",[beforeIncident.id]);
    const creditAfter=creditAddress?String(await read("get_credit",[creditAddress])):undefined;
    const statsAfter=name==="withdraw_credit"||name==="finalize_incident"||name==="finalize_default_breach"?await read("get_stats"):undefined;
    const creditsAfter=Object.fromEntries(await Promise.all(settlementParties.map(async party=>[party.toLowerCase(),String(await read("get_credit",[party]))] as const)));
    const verified=isExpectedActionState({action:name,beforeAgreement,beforeIncident,agreement:after.agreement,incident:after.incident,args,creditBefore,creditAfter,statsBefore,statsAfter,creditsBefore,creditsAfter});
    const result=resolveWriteVerification(outcome.execution,verified);
    if(result==="state-verified"){setPhase("state-verified");return;}
    setPhase("verification-incomplete");
    setMessage(outcome.execution==="unknown"?`The chain finalized this write, but execution metadata is unavailable and the expected action-specific contract state was not proven. ${NO_RESUBMIT_UNTIL_VERIFIED}`:`Execution succeeded, but the expected action-specific contract state was not proven. ${NO_RESUBMIT_UNTIL_VERIFIED}`);
  }
  async function doTx(name:string,args:any[]=[],value?:bigint){if(["signing","submitted","submitted-unverified","finalizing","verifying-execution","verifying-state","verification-incomplete"].includes(phase))return;try{await transact(name,args,value)}catch(e:any){const text=e?.message||String(e);if(text.startsWith("Transaction rolled back:")){setError(text);setPhase("failed");}else if(submittedHash.current){setError("");setMessage(finalityKnown.current?`The transaction finalized, but its expected state could not be verified. ${NO_RESUBMIT_UNTIL_VERIFIED} Check the Explorer transaction and contract state. ${text}`:`The write was submitted but finalization could not be confirmed. Do not resubmit while its status is unknown. Check the Explorer transaction. ${text}`);setPhase(finalityKnown.current?"verification-incomplete":"submitted-unverified");}else{setError(text);setPhase("")}}}

  if(!agreement)return <section className="shell page"><div className="kicker">Agreement file</div><h1>{notFound?"Agreement not found":error?"Agreement unavailable":"Loading agreement…"}</h1>{notFound?<><p>This agreement ID does not have a record on the canonical CARVEOUT contract.</p><div className="action-row"><Link className="button primary" href="/agreements">Return to Agreements</Link><Link className="button" href="/open">Create a New Agreement</Link></div></>:error&&<div className="tx tx-error" role="alert">{error}</div>}</section>;
  const maxCredit=BigInt(agreement.max_credit_atto||0);
  const challengeBond=maxCredit/100n>100000000000000n?maxCredit/100n:100000000000000n;
  const exception=incident?.exception_code?(agreement.exceptions||[]).find((x:any)=>x.code===incident.exception_code):null;
  let challengeData:any=null;try{challengeData=incident?.challenge?JSON.parse(incident.challenge):null}catch{}

  return <section className="shell page">
    {searchParams.get("created")==="1"&&agreement.status==="PROPOSED"&&<div className="creation-notice" role="status"><span className="kicker">Proposal persisted and verified</span><b>Agreement created successfully</b><span>The canonical record is PROPOSED and awaiting customer acceptance.</span></div>}
    <div className="agreement-summary">
      <div className="agreement-summary-title"><div><div className="kicker">Agreement file · {agreement.id}</div><h1>{agreement.service_name}</h1></div><span className={`tag ${agreement.status}`}>{agreement.status}</span></div>
      <div className="summary-facts"><div><span>Bonded maximum credit</span><b>{genText(agreement.bond_atto)}</b></div><div><span>Target metric</span><b>{agreement.metric_name}</b><small>{(Number(agreement.target_bps)/100).toFixed(2)}% target</small></div><div><span>Service</span><b>{agreement.service_url}</b></div></div>
    </div>

    <div className="agreement-layout">
      <aside className="contract-panel">
        <div className="kicker">Agreement dossier</div>
        <div className="docket-line"><span>Provider</span><b>{short(agreement.provider)}</b></div>
        <div className="docket-line"><span>Customer</span><b>{short(agreement.customer)}</b></div>
        <div className="docket-line"><span>Service</span><b>{agreement.service_url}</b></div>
        <div className="docket-line"><span>Target</span><b>{agreement.metric_name} · {(Number(agreement.target_bps)/100).toFixed(2)}%</b></div>
        <div className="docket-line"><span>Bond</span><b>{genText(agreement.bond_atto)} · max {genText(agreement.max_credit_atto)}</b></div>
        <div className="docket-line"><span>Challenge window</span><b>{agreement.challenge_window_seconds} seconds</b></div>
        <div className="docket-line"><span>SLA window · WAT</span><b><WatTime value={agreement.window_start}/> → <WatTime value={agreement.window_end}/></b></div>
        {agreement.created_at&&<div className="docket-line"><span>Proposal created · WAT</span><b><WatTime value={agreement.created_at}/></b></div>}
        {agreement.status==="PROPOSED"&&<div className="docket-line"><span>Formation deadline · WAT</span><b><WatTime value={agreement.formation_deadline}/></b></div>}
        {Number(agreement.accepted_at)>0&&<div className="docket-line"><span>Customer accepted · WAT</span><b><WatTime value={agreement.accepted_at}/></b></div>}
        {agreement.expired_at&&<div className="docket-line"><span>Proposal expired · WAT</span><b><WatTime value={agreement.expired_at}/></b></div>}
        <div className="digest-row"><span>Specification hash</span><code>{agreement.spec_hash}</code></div>
      </aside>

      <main className="incident-panel">
        {!incident && agreement.status==="PROPOSED" && <div className="incident-empty">
          <div className="kicker">Awaiting customer acceptance</div><h2>The provider proposed a frozen agreement.</h2>
          <p>The bond is escrowed, but incidents remain unavailable until the named customer accepts the exact specification before the formation deadline.</p>
          <div className="action-panel"><div className="kicker">Next action</div><p>Customer acceptance must be finalized before the formation deadline and at least five minutes before SLA exposure.</p>{role==="customer"&&now()<Number(agreement.formation_deadline)&&<button className="button red" onClick={()=>doTx("accept_agreement",[id])}>Accept agreement</button>}{role!=="customer"&&now()<Number(agreement.formation_deadline)&&<p className="micro-note">The named customer wallet is the next signer.</p>}{now()>=Number(agreement.formation_deadline)&&<button className="button primary" onClick={()=>doTx("expire_proposal",[id])}>Return expired proposal bond</button>}</div>
        </div>}
        {!incident && agreement.status==="ACTIVE" && <div className="incident-empty">
          <div className="kicker">No open incident</div><h2>The service agreement is active.</h2><p>The customer can report a measured miss. Liability is not established until independent evidence verifies the service and observation window.</p>
          {role==="customer" && <div className="form-sheet compact action-panel">
            <div className="two"><Field label="Claimed availability (basis points)" value={miss.actual} set={v=>setMiss({...miss,actual:v})}/><Field label="Observation start (Unix time)" value={miss.from} set={v=>setMiss({...miss,from:v})}/></div>
            <Field label="Observation end (Unix time)" value={miss.to} set={v=>setMiss({...miss,to:v})}/>
            <Area label="Measurement evidence (JSON)" value={miss.evidence} set={v=>setMiss({...miss,evidence:v})}/>
            <button className="button red" onClick={()=>doTx("open_incident",[id,Number(miss.actual),Number(miss.from),Number(miss.to),miss.evidence])}>Open measured miss</button>
          </div>}
          {now()>Number(agreement.window_end)&&<div className="action-panel"><div className="kicker">Next action</div><button className="button primary" onClick={()=>doTx("expire_agreement",[id])}>Close expired agreement</button></div>}
        </div>}

        {incident && <>
          <div className="incident-head"><div><div className="kicker">Incident {incident.id}</div><h2>{incident.status.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,(c:string)=>c.toUpperCase())}</h2></div><div className="metric-badge"><span>Verified / claimed</span><b>{(Number(incident.actual_bps)/100).toFixed(2)}%</b></div></div>
          <div className="timeline">
            <div className="tick"><b>01</b><span>Miss asserted</span><small>{incident.claimed_actual_bps} bps</small></div>
            <div className={`tick ${["MEASUREMENT_REJECTED"].includes(incident.status)?"bad":"done"}`}><b>02</b><span>Measurement proof</span><small>{incident.measurement_basis||"Awaiting consensus"}</small></div>
            <div className={`tick ${incident.exception_code?"done":""}`}><b>03</b><span>Exception claim</span><small>{incident.exception_code||"Not invoked"}</small></div>
            <div className={`tick ${incident.exception_result?"done":""}`}><b>04</b><span>Exception judgment</span><small>{incident.exception_result||"Pending"}</small></div>
            <div className={`tick ${incident.status==="FINAL"?"done":""}`}><b>05</b><span>Settlement</span><small>{incident.payout_atto?genText(incident.payout_atto):"Not final"}</small></div>
          </div>

          <div className="incident-facts">
            <div><span>Observation · WAT</span><b><WatTime value={incident.observed_from}/><br/>→ <WatTime value={incident.observed_to}/></b></div>
            <div><span>Provider liability</span><b>{(Number(incident.liable_bps)/100).toFixed(2)}%</b></div>
            <div><span>Exception</span><b>{exception?`${exception.code} / ${exception.title}`:"None"}</b></div>
          </div>
          <div className="incident-facts timestamp-facts">
            {incident.opened_at&&<div><span>Incident opened · WAT</span><b><WatTime value={incident.opened_at}/></b></div>}
            {incident.measurement_decided_at&&Number(incident.measurement_decided_at)>0&&<div><span>Measurement decision · WAT</span><b><WatTime value={incident.measurement_decided_at}/></b></div>}
            {incident.measurement_verified_at&&Number(incident.measurement_verified_at)>0&&<div><span>Measurement verified · WAT</span><b><WatTime value={incident.measurement_verified_at}/></b></div>}
            {incident.measurement_deadline&&Number(incident.measurement_deadline)>0&&<div><span>Measurement retry deadline · WAT</span><b><WatTime value={incident.measurement_deadline}/></b></div>}
            {incident.response_deadline&&Number(incident.response_deadline)>0&&<div><span>Provider response deadline · WAT</span><b><WatTime value={incident.response_deadline}/></b></div>}
            {incident.adjudicated_at&&<div><span>Exception decision · WAT</span><b><WatTime value={incident.adjudicated_at}/></b></div>}
            {incident.challenge_deadline&&Number(incident.challenge_deadline)>0&&<div><span>Challenge deadline · WAT</span><b><WatTime value={incident.challenge_deadline}/></b></div>}
            {incident.resolution_deadline&&Number(incident.resolution_deadline)>0&&<div><span>Resolution deadline · WAT</span><b><WatTime value={incident.resolution_deadline}/></b></div>}
            {incident.finalized_at&&<div><span>Finalized · WAT</span><b><WatTime value={incident.finalized_at}/></b></div>}
          </div>
          {incident.facts?.length>0&&<div className="fact-sheet">{incident.facts.map((f:string,i:number)=><p key={i}><b>{String(i+1).padStart(2,"0")}</b>{f}</p>)}</div>}
          {incident.basis&&<div className="basis">Judgment basis · {incident.basis}</div>}
          <div className="basis" title={incident.measurement_case_hash}>Measurement case commitment · {incident.measurement_case_hash||"Pending"}</div>
          {incident.exception_case_hash&&<div className="basis">Exception case commitment · {incident.exception_case_hash}</div>}
          {incident.challenge_case_hash&&<div className="basis">Challenge case commitment · {incident.challenge_case_hash}</div>}
          {incident.measurement_evidence_digest&&<div className="basis">Measurement evidence digest · {incident.measurement_evidence_digest}</div>}
          {incident.measurement_evidence_content_digest&&<div className="basis">Measurement evidence content digest · {incident.measurement_evidence_content_digest}</div>}
          {incident.exception_evidence_digest&&<div className="basis">Exception evidence digest · {incident.exception_evidence_digest}</div>}
          {incident.exception_evidence_content_digest&&<div className="basis">Exception evidence content digest · {incident.exception_evidence_content_digest}</div>}
          {incident.challenge_evidence_digest&&<div className="basis">Challenge evidence digest · {incident.challenge_evidence_digest}</div>}
          {incident.challenge_evidence_content_digest&&<div className="basis">Challenge evidence content digest · {incident.challenge_evidence_content_digest}</div>}
          {(incident.measurement_evidence_record||incident.exception_evidence_record||incident.challenge_evidence_record)&&<details className="evidence-record"><summary>Canonical evidence evaluated · bounded excerpts</summary><div className="evidence-record-body">{[["Measurement",incident.measurement_evidence_record],["Exception",incident.exception_evidence_record],["Challenge",incident.challenge_evidence_record]].filter(([,record])=>record).map(([label,record]:any)=><section key={label}><div className="kicker">{label} decision record</div><pre>{JSON.stringify(JSON.parse(record),null,2)}</pre></section>)}</div></details>}
          {incident.excused_intervals?.length>0&&<div className="fact-sheet"><div className="kicker">Excused intervals · liability is deterministic · WAT</div>{incident.excused_intervals.map((x:any,i:number)=><p key={i}><b>{String(i+1).padStart(2,"0")}</b><WatTime value={x.from_ts}/> → <WatTime value={x.to_ts}/> · Evidence {x.evidence_ids.join(", ")}</p>)}</div>}
          {challengeData&&<div className="challenge-record"><b>Challenge · {challengeData.status}</b><p>{challengeData.text}</p>{challengeData.basis&&<small>{challengeData.basis}</small>}{challengeData.checked_at&&<small> · Last checked <WatTime value={challengeData.checked_at}/></small>}{challengeData.resolved_at&&<small> · Resolved <WatTime value={challengeData.resolved_at}/></small>}</div>}

          <section className="action-panel workflow-actions"><div className="kicker">Available protocol actions</div><div className="action-row">
            {["MEASUREMENT_PENDING","MEASUREMENT_INCONCLUSIVE"].includes(incident.status)&&<button className="button primary" onClick={()=>doTx("verify_measurement",[incident.id])}>verify measurement</button>}
            {incident.status==="MEASUREMENT_INCONCLUSIVE"&&now()>=Number(incident.measurement_deadline||0)&&<button className="button" onClick={()=>doTx("dismiss_unproven_measurement",[incident.id])}>dismiss unproven miss</button>}
            {["EXCEPTION_CLAIMED","INCONCLUSIVE"].includes(incident.status)&&<button className="button red" onClick={()=>doTx("adjudicate_exception",[incident.id])}>adjudicate frozen exception</button>}
            {challengeData?.status==="OPEN"&&<button className="button red" onClick={()=>doTx("resolve_challenge",[incident.id])}>resolve challenge</button>}
            {challengeData?.status==="OPEN"&&now()>=Number(challengeData.resolution_deadline||0)&&<button className="button" onClick={()=>doTx("expire_challenge",[incident.id])}>expire challenge</button>}
            {incident.status==="PENDING"&&now()>=Number(incident.challenge_deadline||0)&&challengeData?.status!=="OPEN"&&<button className="button primary" onClick={()=>doTx("finalize_incident",[incident.id])}>finalize settlement</button>}
            {incident.status==="OPEN"&&now()>=Number(incident.response_deadline||0)&&<button className="button red" onClick={()=>doTx("finalize_default_breach",[incident.id])}>finalize provider default</button>}
            {incident.status==="INCONCLUSIVE"&&now()>=Number(incident.resolution_deadline||0)&&<button className="button" onClick={()=>doTx("finalize_default_breach",[incident.id])}>close without decision · return bond</button>}
          </div></section>

          {role==="provider"&&incident.status==="OPEN"&&now()<Number(incident.response_deadline||0)&&<div className="form-sheet compact action-panel">
            <div className="kicker">invoke one frozen clause</div>
            <select value={claim.code} onChange={e=>setClaim({...claim,code:e.target.value})}><option value="">choose exception</option>{(agreement.exceptions||[]).map((x:any)=><option key={x.code} value={x.code}>{x.code} · {x.title}</option>)}</select>
            <Area label="exception evidence JSON" value={claim.evidence} set={v=>setClaim({...claim,evidence:v})}/>
            <button className="button red" onClick={()=>doTx("claim_exception",[incident.id,claim.code,claim.evidence])}>claim exception</button>
          </div>}

          {incident.status==="PENDING"&&!incident.challenge&&role!=="observer"&&now()<Number(incident.challenge_deadline||0)&&<div className="form-sheet compact challenge-sheet action-panel">
            <div className="kicker">counter-evidence window</div>
            <Area label="specific factual or contractual error" value={challenge.text} set={v=>setChallenge({...challenge,text:v})}/>
            <Field label="public counter-evidence URL" value={challenge.url} set={v=>setChallenge({...challenge,url:v})}/>
            <div className="micro-note">Challenge bond · {genText(challengeBond.toString())}. A rejected challenge bond goes to the opposing agreement party.</div>
            <button className="button red" onClick={()=>doTx("challenge_exception",[incident.id,challenge.text,challenge.url],challengeBond)}>file bonded challenge</button>
          </div>}
        </>}
      </main>
    </div>
    <details className="frozen-details"><summary>Frozen exception clauses and evidence policy</summary><div className="frozen-details-grid"><section><div className="kicker">Permitted carve-outs</div>{(agreement.exceptions||[]).map((x:any)=><div className="clause" key={x.code}><b>{x.code}</b><strong>{x.title}</strong><p>{x.rule}</p><small>Proof · {x.proof}</small></div>)}</section><section><div className="kicker">Adjudication policy</div><p className="policy-copy">{agreement.evidence_policy}</p><div className="kicker">Frozen source policy</div>{Object.entries(agreement.source_policy||{}).map(([group,items]:any)=><div className="basis" key={group}>{group} · {(items||[]).map((x:any)=>`${x.kind} @ ${x.host}${x.path_prefix}`).join(" · ")}</div>)}</section></div></details>
    <TxNotice phase={phase} hash={hash} error={error} message={message}/>
  </section>
}

function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><input value={value} onChange={e=>set(e.target.value)}/></div>}
function Area({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><textarea value={value} onChange={e=>set(e.target.value)}/></div>}
