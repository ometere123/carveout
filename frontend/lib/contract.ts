import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionHashVariant } from "genlayer-js/types";
import { CHAIN_ID, CONTRACT_ADDRESS, assertReleaseConfig } from "./config";
import { provider } from "./wallet";
import { parseGenAmount } from "./amount";
import { assertContractAddress, assertWriteWallet } from "./walletGuard";
import { finalizedExecutionFailure } from "./executionFailure";
assertReleaseConfig();
export function readClient(){ return createClient({chain:studionet}); }
export function requireContract(){assertContractAddress(CONTRACT_ADDRESS);return CONTRACT_ADDRESS;}
export function writeClient(address:string){const p=provider();if(!p)throw new Error("CARVEOUT: no injected EIP-1193 wallet available.");if(typeof address!=="string"||!/^0x[0-9a-fA-F]{40}$/.test(address))throw new Error("CARVEOUT: connected wallet address is missing or invalid.");const walletAddress=address as `0x${string}`;return createClient({chain:studionet,account:walletAddress,provider:p as any});}
export function writeWithClient(client:{writeContract:(request:any)=>Promise<unknown>},walletAddress:`0x${string}`,contractAddress:`0x${string}`,functionName:string,args:any[]=[],value?:bigint){
  const jsonRpcAccount={address:walletAddress,type:"json-rpc" as const};
  return client.writeContract({account:jsonRpcAccount,address:contractAddress,functionName,args,value:value??0n} as any);
}
export async function read(functionName:string,args:any[]=[]):Promise<any>{return readClient().readContract({address:requireContract(),functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL,jsonSafeReturn:true} as any);}
export async function write(address:string,functionName:string,args:any[]=[],value?:bigint){
  const p=provider();
  if(!p)throw new Error("CARVEOUT: no injected EIP-1193 wallet available.");
  const [chain,accounts]=await Promise.all([p.request({method:"eth_chainId"}),p.request({method:"eth_accounts"})]);
  assertWriteWallet(chain,accounts,address);
  const contractAddress=requireContract();
  const client=writeClient(address);
  return writeWithClient(client,address as `0x${string}`,contractAddress,functionName,args,value);
}
export async function waitFinal(hash:string){const receipt=await readClient().waitForTransactionReceipt({hash:hash as `0x${string}`,status:"FINALIZED",retries:240,interval:15000,fullTransaction:true} as any);if((receipt as any).txExecutionResultName!==ExecutionResult.FINISHED_WITH_RETURN)throw new Error(finalizedExecutionFailure(receipt as any));return receipt;}
export function gen(value:string|number){return parseGenAmount(String(value));}
