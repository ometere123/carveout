"use client";
import {useEffect,useRef,useState} from "react";
import {formatGenAmount} from "@/lib/amount";
import {read,write,waitFinal} from "@/lib/contract";
import {useInjectedWallet} from "@/lib/wallet";
import {TxNotice} from "@/components/TxNotice";
import {isExpectedActionState} from "@/lib/actionVerification";

export default function Account(){
  const w=useInjectedWallet();
  const[credit,setCredit]=useState("0"),[phase,setPhase]=useState(""),[hash,setHash]=useState(""),[error,setError]=useState(""),[message,setMessage]=useState("");
  const submittedHash=useRef("");
  useEffect(()=>{if(w.address)read("get_credit",[w.address]).then(x=>setCredit(String(x))).catch(()=>{})},[w.address]);
  async function withdraw(){
    if(!w.address)return;
    let finalityKnown=false;
    try{
      setError("");setMessage("");setPhase("signing");setHash("");submittedHash.current="";
      const before=String(await read("get_credit",[w.address]));
      const statsBefore=await read("get_stats");
      const h=await write(w.address,"withdraw_credit",[w.address]);setHash(String(h));submittedHash.current=String(h);setPhase("submitted");await new Promise(resolve=>setTimeout(resolve,500));setPhase("finalizing");
      const outcome=await waitFinal(String(h),()=>setPhase("verifying-execution"));finalityKnown=true;setPhase("verifying-state");
      const remaining=String(await read("get_credit",[w.address]));
      const statsAfter=await read("get_stats");setCredit(remaining);
      const verified=isExpectedActionState({action:"withdraw_credit",creditBefore:before,creditAfter:remaining,statsBefore,statsAfter});
      if(verified){setPhase("state-verified");return;}
      setPhase("verification-incomplete");setMessage(outcome.execution==="unknown"?"The transaction finalized, but its execution result is unavailable and claimable/withdrawn accounting did not prove the withdrawal. Do not resubmit until verified.":"Execution succeeded, but the canonical withdrawal accounting did not match. Do not resubmit until verified.");
    }catch(e:any){const text=e?.message||String(e);if(text.startsWith("Transaction rolled back:")){setError(text);setPhase("failed");}else if(submittedHash.current){setMessage(finalityKnown?"The transaction finalized, but withdrawal state could not be verified. Do not resubmit until the Explorer transaction and accounting are checked. "+text:"The write was submitted, but finalization could not be confirmed. Do not resubmit while its status is unknown. Check the Explorer transaction. "+text);setPhase(finalityKnown?"verification-incomplete":"submitted-unverified");}else{setError(text);setPhase("")}}
  }
  return <section className="shell page"><div className="kicker">Claim ledger</div><h1>Account</h1><div className="contract-panel account-card" style={{marginTop:40}}><div className="big-metric">{formatGenAmount(BigInt(credit), 6)} GEN</div><p>Pull-based claimable credit. Only its recorded owner can withdraw it.</p>{!w.address&&<p className="micro-note">Connect a wallet to read its claimable balance.</p>}{w.address&&!w.correctNetwork&&<p className="micro-note" role="status">Switch to Studionet (61999) to withdraw.</p>}<button className="button primary" onClick={withdraw} disabled={!w.address||!w.correctNetwork||credit==="0"||phase==="signing"||phase==="submitted-unverified"||phase==="verification-incomplete"||phase==="finalizing"||phase==="verifying-execution"||phase==="verifying-state"}><span>Withdraw to connected wallet</span></button><TxNotice phase={phase} hash={hash} error={error} message={message}/></div></section>
}
