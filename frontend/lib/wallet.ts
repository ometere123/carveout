"use client";
import { useCallback, useEffect, useState } from "react";
import { CHAIN_HEX, CHAIN_ID, NETWORK } from "./config";
export type Eip1193Provider = { request(args:{method:string;params?:unknown[]}):Promise<unknown>; on?(event:string,handler:(...args:any[])=>void):void; removeListener?(event:string,handler:(...args:any[])=>void):void };
declare global { interface Window { ethereum?: Eip1193Provider } }
export function provider(){ return typeof window === "undefined" ? null : window.ethereum || null; }
export function normalizeAccounts(value:unknown):string[]{ return Array.isArray(value) ? value.filter((x):x is string => typeof x === "string") : []; }
export async function ensureStudionet(){
  const p=provider(); if(!p) throw new Error("Open an injected EIP-1193 wallet to continue");
  const current=await p.request({method:"eth_chainId"});
  if(typeof current === "string" && parseInt(current,16)===CHAIN_ID) return;
  try { await p.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_HEX}]}); }
  catch(error:any){ if(error?.code!==4902) throw error; await p.request({method:"wallet_addEthereumChain",params:[NETWORK]}); }
}
export function useInjectedWallet(){
  const [address,setAddress]=useState<string|null>(null), [chainId,setChainId]=useState<number|null>(null), [ready,setReady]=useState(false), [off,setOff]=useState(false);
  const refresh=useCallback(async()=>{ const p=provider(); if(!p){setAddress(null);setChainId(null);setReady(true);return;} const [xs,c]=await Promise.all([p.request({method:"eth_accounts"}).catch(()=>[]),p.request({method:"eth_chainId"}).catch(()=>null)]); setAddress(off?null:(normalizeAccounts(xs)[0]||null)); setChainId(typeof c==="string"?parseInt(c,16):null); setReady(true); },[off]);
  useEffect(()=>{refresh(); const p=provider(); if(!p?.on)return; const h=()=>refresh(); p.on("accountsChanged",h);p.on("chainChanged",h);return()=>{p.removeListener?.("accountsChanged",h);p.removeListener?.("chainChanged",h)};},[refresh]);
  const connect=useCallback(async()=>{ const p=provider(); if(!p)throw new Error("No injected EIP-1193 wallet found");setOff(false);const xs=normalizeAccounts(await p.request({method:"eth_requestAccounts"}));if(!xs[0])throw new Error("Wallet returned no account");await ensureStudionet();setAddress(xs[0]);setChainId(CHAIN_ID);return xs[0];},[]);
  return {ready,address,chainId,connected:!!address,correctNetwork:chainId===CHAIN_ID,connect,switchNetwork:ensureStudionet,disconnect:()=>{setOff(true);setAddress(null)},refresh};
}
