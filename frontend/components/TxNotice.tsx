"use client";
import { EXPLORER } from "@/lib/config";
export function TxNotice({phase,hash,error}:{phase:string;hash?:string;error?:string}){if(!phase&&!error)return null;return <div className={`tx ${error?"tx-error":""}`}><b>{error?"FAILED":phase.toUpperCase()}</b>{hash&&<a href={`${EXPLORER}/tx/${hash}`} target="_blank">{hash.slice(0,10)}… ↗</a>}<span>{error}</span></div>}
