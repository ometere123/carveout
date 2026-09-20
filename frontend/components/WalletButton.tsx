"use client";
import { useState } from "react";
import { useInjectedWallet } from "@/lib/wallet";
const short=(v:string)=>v.slice(0,6)+"…"+v.slice(-4);
export function WalletButton(){const w=useInjectedWallet();const[busy,setBusy]=useState(false);const[err,setErr]=useState("");async function act(){setBusy(true);setErr("");try{if(!w.connected)await w.connect();else if(!w.correctNetwork)await w.switchNetwork();}catch(e:any){setErr(e?.message||"Wallet request failed")}finally{setBusy(false)}}return <div className="wallet-wrap"><button className={`wallet ${w.connected&&!w.correctNetwork?"warn":""}`} onClick={act} disabled={busy}>{!w.ready?"checking…":busy?"opening…":!w.connected?"connect wallet":!w.correctNetwork?"switch · 61999":short(w.address!)}</button>{w.connected&&<button className="wallet-mini" onClick={w.disconnect}>×</button>}{err&&<span className="wallet-error">{err}</span>}</div>}
