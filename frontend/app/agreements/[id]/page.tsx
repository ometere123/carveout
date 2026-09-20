"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { read, waitFinal, write } from "@/lib/contract";
import { formatGenAmount } from "@/lib/amount";
import { useInjectedWallet } from "@/lib/wallet";
import { TxNotice } from "@/components/TxNotice";

const now = () => Math.floor(Date.now()/1000);
const genText = (v:any) => `${formatGenAmount(BigInt(String(v || 0)), 6)} GEN`;
const short = (v="") => v.length > 18 ? `${v.slice(0,9)}…${v.slice(-6)}` : v;
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
  const wallet=useInjectedWallet();
  const [agreement,setAgreement]=useState<any>(null),[incident,setIncident]=useState<any>(null);
  const [phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState("");
  const [miss,setMiss]=useState({actual:"9900",from:"",to:"",evidence:"[]"});
  const [claim,setClaim]=useState({code:"",evidence:"[]"});
  const [challenge,setChallenge]=useState({text:"",url:""});

  const refresh=useCallback(async()=>{
    try{
      const a=await read("get_agreement",[id]);setAgreement(a);
      setMiss(x=>({...x,evidence:x.evidence==="[]"?defaultEvidence(a.source_policy,"measurement"):x.evidence}));
      setClaim(x=>({...x,evidence:x.evidence==="[]"?defaultEvidence(a.source_policy,"exception"):x.evidence}));
      setChallenge(x=>({...x,url:x.url||defaultChallengeUrl(a.source_policy)}));
      if(a.incident_id){setIncident(await read("get_incident",[a.incident_id]));}else setIncident(null);
      setError("");
    }catch(e:any){setError(e?.message||String(e));throw e;}
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
    setError("");setPhase("signing");setHash("");
    const tx=await write(wallet.address,name,args,value);setHash(String(tx));setPhase("submitted");await new Promise(resolve=>setTimeout(resolve,500));setPhase("finalizing");await waitFinal(String(tx));setPhase("readback");try{await refresh()}catch(e:any){setPhase("readback-failed");throw Object.assign(new Error(e?.message||String(e)),{finalized:true})}setPhase("finalized");
  }
  async function doTx(name:string,args:any[]=[],value?:bigint){try{await transact(name,args,value)}catch(e:any){setError(e?.message||String(e));setPhase(e?.finalized?"readback-failed":"")}}

  if(!agreement)return <section className="shell page"><div className="kicker">Agreement file</div><h1>{error?"Agreement unavailable":"Loading agreement…"}</h1>{error&&<div className="tx tx-error" role="alert">{error}</div>}</section>;
  const maxCredit=BigInt(agreement.max_credit_atto||0);
  const challengeBond=maxCredit/100n>100000000000000n?maxCredit/100n:100000000000000n;
  const exception=incident?.exception_code?(agreement.exceptions||[]).find((x:any)=>x.code===incident.exception_code):null;
  let challengeData:any=null;try{challengeData=incident?.challenge?JSON.parse(incident.challenge):null}catch{}

  return <section className="shell page">
    <div className="page-intro">
      <div><div className="kicker">Agreement {agreement.id}</div><h1>{agreement.service_name}</h1></div>
      <div className="contract-summary"><span className={`tag ${agreement.status}`}>{agreement.status}</span><b>{genText(agreement.bond_atto)}</b><small>{agreement.metric_name} · target {(Number(agreement.target_bps)/100).toFixed(2)}%</small></div>
    </div>

    <div className="case-grid">
      <aside className="contract-panel">
        <div className="kicker">Frozen terms</div>
        <div className="docket-line"><span>Provider</span><b>{short(agreement.provider)}</b></div>
        <div className="docket-line"><span>Customer</span><b>{short(agreement.customer)}</b></div>
        <div className="docket-line"><span>Service</span><b>{agreement.service_url}</b></div>
        <div className="docket-line"><span>Maximum credit</span><b>{genText(agreement.max_credit_atto)}</b></div>
        <div className="docket-line"><span>Performance window</span><b>{new Date(Number(agreement.window_start)*1000).toISOString().slice(0,10)} → {new Date(Number(agreement.window_end)*1000).toISOString().slice(0,10)}</b></div>
        <div className="basis">Specification hash · {agreement.spec_hash}</div>
        <h3>Permitted carve-outs</h3>
        {(agreement.exceptions||[]).map((x:any)=><div className="clause" key={x.code}><b>{x.code}</b><strong>{x.title}</strong><p>{x.rule}</p><small>Proof · {x.proof}</small></div>)}
        <div className="basis">Evidence policy · {agreement.evidence_policy}</div>
        <h3>Frozen source policy</h3>
        {Object.entries(agreement.source_policy||{}).map(([group,items]:any)=><div className="basis" key={group}>{group} · {(items||[]).map((x:any)=>`${x.kind} @ ${x.host}${x.path_prefix}`).join(" · ")}</div>)}
      </aside>

      <main className="incident-panel">
        {!incident && agreement.status==="PROPOSED" && <div className="incident-empty">
          <div className="kicker">Awaiting customer acceptance</div><h2>The provider proposed a frozen agreement.</h2>
          <p>The bond is escrowed, but incidents remain unavailable until the named customer accepts the exact specification before the formation deadline.</p>
          <div className="basis">Formation deadline · {new Date(Number(agreement.formation_deadline)*1000).toISOString()}</div>
          <div className="basis">Specification commitment · {agreement.spec_hash}</div>
          {role==="customer"&&now()<Number(agreement.formation_deadline)&&<button className="button red" onClick={()=>doTx("accept_agreement",[id])}>Accept agreement</button>}
          {now()>=Number(agreement.formation_deadline)&&<button className="button primary" onClick={()=>doTx("expire_proposal",[id])}>Return expired proposal bond</button>}
        </div>}
        {!incident && agreement.status==="ACTIVE" && <div className="incident-empty">
          <div className="kicker">No open incident</div><h2>The service agreement is active.</h2><p>The customer can report a measured miss. Liability is not established until independent evidence verifies the service and observation window.</p>
          {role==="customer" && <div className="form-sheet compact">
            <div className="two"><Field label="Claimed availability (basis points)" value={miss.actual} set={v=>setMiss({...miss,actual:v})}/><Field label="Observation start (Unix time)" value={miss.from} set={v=>setMiss({...miss,from:v})}/></div>
            <Field label="Observation end (Unix time)" value={miss.to} set={v=>setMiss({...miss,to:v})}/>
            <Area label="Measurement evidence (JSON)" value={miss.evidence} set={v=>setMiss({...miss,evidence:v})}/>
            <button className="button red" onClick={()=>doTx("open_incident",[id,Number(miss.actual),Number(miss.from),Number(miss.to),miss.evidence])}>Open measured miss</button>
          </div>}
          {now()>Number(agreement.window_end)&&<button className="button primary" onClick={()=>doTx("expire_agreement",[id])}>Close expired agreement</button>}
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
            <div><span>Observation</span><b>{new Date(Number(incident.observed_from)*1000).toISOString()}<br/>→ {new Date(Number(incident.observed_to)*1000).toISOString()}</b></div>
            <div><span>Provider liability</span><b>{(Number(incident.liable_bps)/100).toFixed(2)}%</b></div>
            <div><span>Exception</span><b>{exception?`${exception.code} / ${exception.title}`:"None"}</b></div>
          </div>
          {incident.facts?.length>0&&<div className="fact-sheet">{incident.facts.map((f:string,i:number)=><p key={i}><b>{String(i+1).padStart(2,"0")}</b>{f}</p>)}</div>}
          {incident.basis&&<div className="basis">Judgment basis · {incident.basis}</div>}
          <div className="basis" title={incident.measurement_case_hash}>Measurement case commitment · {incident.measurement_case_hash||"Pending"}</div>
          {incident.exception_case_hash&&<div className="basis">Exception case commitment · {incident.exception_case_hash}</div>}
          {incident.challenge_case_hash&&<div className="basis">Challenge case commitment · {incident.challenge_case_hash}</div>}
          {incident.excused_intervals?.length>0&&<div className="fact-sheet"><div className="kicker">Excused intervals · liability is deterministic</div>{incident.excused_intervals.map((x:any,i:number)=><p key={i}><b>{String(i+1).padStart(2,"0")}</b>{new Date(Number(x.from_ts)*1000).toISOString()} → {new Date(Number(x.to_ts)*1000).toISOString()} · Evidence {x.evidence_ids.join(", ")}</p>)}</div>}
          {challengeData&&<div className="challenge-record"><b>Challenge · {challengeData.status}</b><p>{challengeData.text}</p>{challengeData.basis&&<small>{challengeData.basis}</small>}</div>}

          <div className="action-row">
            {["MEASUREMENT_PENDING","MEASUREMENT_INCONCLUSIVE"].includes(incident.status)&&<button className="button primary" onClick={()=>doTx("verify_measurement",[incident.id])}>verify measurement</button>}
            {incident.status==="MEASUREMENT_INCONCLUSIVE"&&now()>=Number(incident.measurement_deadline||0)&&<button className="button" onClick={()=>doTx("dismiss_unproven_measurement",[incident.id])}>dismiss unproven miss</button>}
            {["EXCEPTION_CLAIMED","INCONCLUSIVE"].includes(incident.status)&&<button className="button red" onClick={()=>doTx("adjudicate_exception",[incident.id])}>adjudicate frozen exception</button>}
            {challengeData?.status==="OPEN"&&<button className="button red" onClick={()=>doTx("resolve_challenge",[incident.id])}>resolve challenge</button>}
            {challengeData?.status==="OPEN"&&now()>=Number(challengeData.resolution_deadline||0)&&<button className="button" onClick={()=>doTx("expire_challenge",[incident.id])}>expire challenge</button>}
            {incident.status==="PENDING"&&now()>=Number(incident.challenge_deadline||0)&&challengeData?.status!=="OPEN"&&<button className="button primary" onClick={()=>doTx("finalize_incident",[incident.id])}>finalize settlement</button>}
            {incident.status==="OPEN"&&now()>=Number(incident.response_deadline||0)&&<button className="button red" onClick={()=>doTx("finalize_default_breach",[incident.id])}>finalize provider default</button>}
            {incident.status==="INCONCLUSIVE"&&now()>=Number(incident.resolution_deadline||0)&&<button className="button red" onClick={()=>doTx("finalize_default_breach",[incident.id])}>finalize unresolved default</button>}
          </div>

          {role==="provider"&&incident.status==="OPEN"&&now()<Number(incident.response_deadline||0)&&<div className="form-sheet compact">
            <div className="kicker">invoke one frozen clause</div>
            <select value={claim.code} onChange={e=>setClaim({...claim,code:e.target.value})}><option value="">choose exception</option>{(agreement.exceptions||[]).map((x:any)=><option key={x.code} value={x.code}>{x.code} · {x.title}</option>)}</select>
            <Area label="exception evidence JSON" value={claim.evidence} set={v=>setClaim({...claim,evidence:v})}/>
            <button className="button red" onClick={()=>doTx("claim_exception",[incident.id,claim.code,claim.evidence])}>claim exception</button>
          </div>}

          {incident.status==="PENDING"&&!incident.challenge&&role!=="observer"&&now()<Number(incident.challenge_deadline||0)&&<div className="form-sheet compact challenge-sheet">
            <div className="kicker">counter-evidence window</div>
            <Area label="specific factual or contractual error" value={challenge.text} set={v=>setChallenge({...challenge,text:v})}/>
            <Field label="public counter-evidence URL" value={challenge.url} set={v=>setChallenge({...challenge,url:v})}/>
            <div className="micro-note">Challenge bond · {genText(challengeBond.toString())}. A rejected challenge bond goes to the opposing agreement party.</div>
            <button className="button red" onClick={()=>doTx("challenge_exception",[incident.id,challenge.text,challenge.url],challengeBond)}>file bonded challenge</button>
          </div>}
        </>}
      </main>
    </div>
    <TxNotice phase={phase} hash={hash} error={error}/>
  </section>
}

function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><input value={value} onChange={e=>set(e.target.value)}/></div>}
function Area({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><textarea value={value} onChange={e=>set(e.target.value)}/></div>}
