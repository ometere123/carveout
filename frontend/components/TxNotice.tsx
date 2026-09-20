"use client";
import { EXPLORER } from "@/lib/config";
const labels:Record<string,string>={signing:"Awaiting signature",submitted:"Submitted",finalizing:"Finalizing",readback:"Finalized · verifying contract readback",finalized:"Finalized · readback verified","readback-failed":"Finalized · readback failed"};
export function TxNotice({phase,hash,error}:{phase:string;hash?:string;error?:string}){if(!phase&&!error)return null;const label=labels[phase]||(error?"Failed":phase);return <div className={`tx ${error?"tx-error":""}`} role={error?"alert":"status"}><b>{label}</b>{hash&&<a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noopener noreferrer" aria-label="View transaction in Studionet Explorer">{hash.slice(0,10)}… ↗</a>}<span>{error}</span></div>}
