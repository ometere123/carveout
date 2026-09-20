import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionHashVariant } from "genlayer-js/types";
import { CONTRACT_ADDRESS, assertReleaseConfig } from "./config";
import { provider } from "./wallet";
assertReleaseConfig();
export function readClient(){ return createClient({chain:studionet}); }
export function requireContract(){ if(!CONTRACT_ADDRESS) throw new Error("CARVEOUT contract is not configured yet"); return CONTRACT_ADDRESS as `0x${string}`; }
export function writeClient(address:string){const p=provider();if(!p)throw new Error("No injected EIP-1193 wallet available");return createClient({chain:studionet,account:address as `0x${string}`,provider:p as any});}
export async function read(functionName:string,args:any[]=[]):Promise<any>{return readClient().readContract({address:requireContract(),functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL,jsonSafeReturn:true} as any);}
export async function write(address:string,functionName:string,args:any[]=[],value?:bigint){const client=writeClient(address);const base:any={account:address as `0x${string}`,address:requireContract(),functionName,args};if(value!==undefined)base.value=value;const estimate=await client.estimateTransactionFeesForWrite(base);return client.writeContract({...base,fees:{distribution:estimate.distribution,messageAllocations:estimate.messageAllocations,feeValue:estimate.feeValue}});}
export async function waitFinal(hash:string){const receipt=await readClient().waitForTransactionReceipt({hash:hash as `0x${string}`,waitUntil:"finalized",retries:240,interval:15000} as any);if((receipt as any).txExecutionResultName!==ExecutionResult.FINISHED_WITH_RETURN)throw new Error(`Transaction finalized without successful execution: ${(receipt as any).statusName} / ${(receipt as any).txExecutionResultName}`);return receipt;}
export function gen(value:string|number){return BigInt(Math.round(Number(value)*1e6))*10n**12n;}
