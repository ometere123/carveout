"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { read, waitFinal, write } from "@/lib/contract";
import { useInjectedWallet } from "@/lib/wallet";
import { TxNotice } from "@/components/TxNotice";

const now = () => Math.floor(Date.now()/1000);
const genText = (v:any) => `${(Number(v || 0)/1e18).toFixed(4)} GEN`;
const short = (v="") => v.length > 18 ? `${v.slice(0,9)}…${v.slice(-6)}` : v;
const defaultMeasurement = JSON.stringify([
  {kind:"INDEPENDENT_PROBE",url:"https://example.com/probe",note:"Independent availability record for the exact service and observation window."},
  {kind:"PROVIDER_STATUS",url:"https://status.example.com",note:"Provider status history for the exact service and observation window."}
], null, 2);
const defaultExceptionEvidence = JSON.stringify([
  {kind:"UPSTREAM_STATUS",url:"https://status.example.net",note:"Official upstream incident record and timestamps."},
  {kind:"INDEPENDENT_TIMELINE",url:"https://example.org/timeline",note:"Independent timing evidence linking the service impact to the invoked exception."}
], null, 2);

export default function AgreementDetail(){
  const {id}=useParams<{id:string}>();
  const wallet=useInjectedWallet();
  const [agreement,setAgreement]=useState<any>(null),[incident,setIncident]=useState<any>(null);
  const [phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState("");
  const [miss,setMiss]=useState({actual:"9900",from:"",to:"",evidence:defaultMeasurement});
  const [claim,setClaim]=useState({code:"",evidence:defaultExceptionEvidence});
  const [challenge,setChallenge]=useState({text:"",url:"https://"});

  const refresh=useCallback(async()=>{
    try{
      const a=await read("get_agreement",[id]);setAgreement(a);
      if(a.incident_id){setIncident(await read("get_incident",[a.incident_id]));}else setIncident(null);
      setError("");
    }catch(e:any){setError(e?.message||String(e));}
  },[id]);
  useEffect(()=>{refresh()},[refresh]);

  const role=useMemo(()=>{
    const a=wallet.address?.toLowerCase(); if(!a||!agreement)return "observer";
    if(a===String(agreement.provider).toLowerCase())return "provider";
    if(a===String(agreement.customer).toLowerCase())return "customer";
    return "observer";
  },[wallet.address,agreement]);

  async function transact(name:string,args:any[]=[],value?:bigint){
    if(!wallet.address)throw new Error("Connect an injected EIP-1193 wallet first");
    setError("");setPhase("signing");setHash("");
    const tx=await write(wallet.address,name,args,value);setHash(String(tx));setPhase("finalizing");await waitFinal(String(tx));setPhase("finalized");await refresh();
  }
  async function doTx(name:string,args:any[]=[],value?:bigint){try{await transact(name,args,value)}catch(e:any){setError(e?.message||String(e));setPhase("")}}

  if(!agreement)return <section className="shell page"><div className="kicker">agreement file</div><h1>loading covenant…</h1>{error&&<div className="tx tx-error">{error}</div>}</section>;
  const maxCredit=BigInt(agreement.max_credit_atto||0);
  const challengeBond=maxCredit/100n>100000000000000n?maxCredit/100n:100000000000000n;
  const exception=incident?.exception_code?(agreement.exceptions||[]).find((x:any)=>x.code===incident.exception_code):null;
  let challengeData:any=null;try{challengeData=incident?.challenge?JSON.parse(incident.challenge):null}catch{}

  return <section className="shell page">
    <div className="page-intro">
      <div><div className="kicker">{agreement.id} / service covenant</div><h1>{agreement.service_name}</h1></div>
      <div className="contract-summary"><span className={`tag ${agreement.status}`}>{agreement.status}</span><b>{genText(agreement.bond_atto)}</b><small>{agreement.metric_name} · target {(Number(agreement.target_bps)/100).toFixed(2)}%</small></div>
    </div>

    <div className="case-grid">
      <aside className="contract-panel">
        <div className="kicker">frozen law</div>
        <div className="docket-line"><span>provider</span><b>{short(agreement.provider)}</b></div>
        <div className="docket-line"><span>customer</span><b>{short(agreement.customer)}</b></div>
        <div className="docket-line"><span>service</span><b>{agreement.service_url}</b></div>
        <div className="docket-line"><span>maximum credit</span><b>{genText(agreement.max_credit_atto)}</b></div>
        <div className="docket-line"><span>window</span><b>{new Date(Number(agreement.window_start)*1000).toISOString().slice(0,10)} → {new Date(Number(agreement.window_end)*1000).toISOString().slice(0,10)}</b></div>
        <div className="basis">spec hash · {agreement.spec_hash}</div>
        <h3>permitted carve-outs</h3>
        {(agreement.exceptions||[]).map((x:any)=><div className="clause" key={x.code}><b>{x.code}</b><strong>{x.title}</strong><p>{x.rule}</p><small>proof · {x.proof}</small></div>)}
        <div className="basis">evidence policy · {agreement.evidence_policy}</div>
      </aside>

      <main className="incident-panel">
        {!incident && agreement.status==="ACTIVE" && <div className="incident-empty">
          <div className="kicker">no live incident</div><h2>The service covenant is active.</h2><p>A customer can open a measured miss, but collateral is not exposed until independent evidence verifies the service and exact observation window.</p>
          {role==="customer" && <div className="form-sheet compact">
            <div className="two"><Field label="claimed availability bps" value={miss.actual} set={v=>setMiss({...miss,actual:v})}/><Field label="observed from · unix" value={miss.from} set={v=>setMiss({...miss,from:v})}/></div>
            <Field label="observed to · unix" value={miss.to} set={v=>setMiss({...miss,to:v})}/>
            <Area label="measurement evidence JSON" value={miss.evidence} set={v=>setMiss({...miss,evidence:v})}/>
            <button className="button red" onClick={()=>doTx("open_incident",[id,Number(miss.actual),Number(miss.from),Number(miss.to),miss.evidence])}>open measured miss</button>
          </div>}
          {now()>Number(agreement.window_end)&&<button className="button primary" onClick={()=>doTx("expire_agreement",[id])}>expire clean agreement</button>}
        </div>}

        {incident && <>
          <div className="incident-head"><div><div className="kicker">incident {incident.id}</div><h2>{incident.status.replaceAll("_"," ")}</h2></div><div className="metric-badge"><span>verified / claimed</span><b>{(Number(incident.actual_bps)/100).toFixed(2)}%</b></div></div>
          <div className="timeline">
            <div className="tick"><b>01</b><span>miss asserted</span><small>{incident.claimed_actual_bps} bps</small></div>
            <div className={`tick ${["MEASUREMENT_REJECTED"].includes(incident.status)?"bad":"done"}`}><b>02</b><span>measurement proof</span><small>{incident.measurement_basis||"awaiting consensus"}</small></div>
            <div className={`tick ${incident.exception_code?"done":""}`}><b>03</b><span>exception claim</span><small>{incident.exception_code||"not invoked"}</small></div>
            <div className={`tick ${incident.exception_result?"done":""}`}><b>04</b><span>exception judgment</span><small>{incident.exception_result||"pending"}</small></div>
            <div className={`tick ${incident.status==="FINAL"?"done":""}`}><b>05</b><span>settlement</span><small>{incident.payout_atto?genText(incident.payout_atto):"not final"}</small></div>
          </div>

          <div className="incident-facts">
            <div><span>observation</span><b>{new Date(Number(incident.observed_from)*1000).toISOString()}<br/>→ {new Date(Number(incident.observed_to)*1000).toISOString()}</b></div>
            <div><span>provider liable</span><b>{(Number(incident.liable_bps)/100).toFixed(2)}%</b></div>
            <div><span>exception</span><b>{exception?`${exception.code} / ${exception.title}`:"none"}</b></div>
          </div>
          {incident.facts?.length>0&&<div className="fact-sheet">{incident.facts.map((f:string,i:number)=><p key={i}><b>{String(i+1).padStart(2,"0")}</b>{f}</p>)}</div>}
          {incident.basis&&<div className="basis">judgment basis · {incident.basis}</div>}
          {challengeData&&<div className="challenge-record"><b>challenge · {challengeData.status}</b><p>{challengeData.text}</p>{challengeData.basis&&<small>{challengeData.basis}</small>}</div>}

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
