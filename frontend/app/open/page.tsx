"use client";
import {useState} from "react";
import {write,waitFinal,gen} from "@/lib/contract";
import {useInjectedWallet} from "@/lib/wallet";
import {TxNotice} from "@/components/TxNotice";

const exceptions=`[{"code":"MAINT","title":"Scheduled maintenance","rule":"48 hour notice and matching window are required","proof":"Dated public notice and timeline"},{"code":"UPSTREAM","title":"Upstream outage","rule":"A named dependency outage must materially cause impact","proof":"Official upstream plus service timeline"}]`;
const sourcePolicy=JSON.stringify({
  measurement:[
    {kind:"INDEPENDENT_PROBE",host:"probe.example.net",path_prefix:"/incident"},
    {kind:"STATUS_AGGREGATOR",host:"status-archive.example.org",path_prefix:"/incident"},
    {kind:"PROVIDER_STATUS",host:"status.api.example.com",path_prefix:"/history"}
  ],
  exception:[
    {kind:"UPSTREAM_STATUS",host:"status.example.net",path_prefix:"/incident"},
    {kind:"INDEPENDENT_TIMELINE",host:"timeline.example.org",path_prefix:"/case"}
  ],
  challenge:[
    {kind:"COUNTER_EVIDENCE",host:"counter.example.com",path_prefix:"/evidence"},
    {kind:"COUNTER_EVIDENCE",host:"counter.example.net",path_prefix:"/evidence"}
  ]
},null,2);

export default function Open(){
  const wallet=useInjectedWallet();
  const [form,setForm]=useState({customer:"",service:"Payments API",url:"https://api.example.com",metric:"monthly availability",target:"9995",credit:"1",exceptions,policy:"Use only the agreed public origins and paths below. Unavailable evidence is not proof.",sourcePolicy,startAfterHours:"24",durationDays:"30",challenge:"1800"});
  const [phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState("");
  const update=(key:string,value:string)=>setForm(current=>({...current,[key]:value}));
  async function submit(){
    if(!wallet.address)return setError("Connect an injected EIP-1193 wallet first.");
    if(!wallet.correctNetwork)return setError("Switch the injected wallet to GenLayer Studionet (61999).");
    try{
      setError("");setHash("");setPhase("signing");
      const now=Math.floor(Date.now()/1000);
      const start=now+Math.max(1,Number(form.startAfterHours))*3600;
      const end=start+Math.max(2,Number(form.durationDays))*86400;
      const credit=gen(form.credit);
      const tx=await write(wallet.address,"create_agreement",[
        form.customer,form.service,form.url,form.metric,Number(form.target),credit.toString(),start,end,
        form.exceptions,form.policy,form.sourcePolicy,Number(form.challenge)
      ],credit);
      setHash(String(tx));setPhase("finalizing");await waitFinal(String(tx));setPhase("finalized");
    }catch(e:any){setError(e?.message||String(e));setPhase("");}
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
      <button className="button red" onClick={submit} disabled={phase==="signing"||phase==="finalizing"}>fund + propose covenant</button>
      <TxNotice phase={phase} hash={hash} error={error}/>
    </div><aside className="side-note"><div className="kicker">formation rule</div><h2>Neither party can change the file after acceptance.</h2><p>Agreement creation leaves the bond in a proposed state. The customer accepts the same specification at least five minutes before SLA exposure. An unaccepted proposal has a bounded bond refund.</p><p>The source policy pins evidence families to exact HTTPS hosts and path prefixes. Measurement requires separate origins, including an independent probe origin.</p></aside></div>
  </section>
}
function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><input value={value} onChange={e=>set(e.target.value)}/></div>}
function Area({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <div className="field"><label>{label}</label><textarea value={value} onChange={e=>set(e.target.value)}/></div>}
