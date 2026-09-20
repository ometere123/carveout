import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { ExecutionResult, TransactionStatus, type DecodedDeployData, type GenLayerClient, type GenLayerChain, type TransactionHash } from "genlayer-js/types";
const EXPECTED_CHAIN=61999; const EXPECTED_RPC="https://studio.genlayer.com/api";
export default async function main(client:GenLayerClient<any>){
  const chain=client.chain as GenLayerChain;
  if(chain.id!==EXPECTED_CHAIN) throw new Error("CARVEOUT is locked to Studionet 61999");
  if(chain.rpcUrls.default.http[0]!==EXPECTED_RPC) throw new Error("CARVEOUT deploy RPC must be https://studio.genlayer.com/api");
  const code=new Uint8Array(readFileSync(path.resolve(process.cwd(),"contracts/carveout.py")));
  const tx=await client.deployContract({code,args:[]});
  const receipt=await client.waitForTransactionReceipt({hash:tx as TransactionHash,status:TransactionStatus.FINALIZED,retries:240,interval:15000});
  if(receipt.txExecutionResultName!==ExecutionResult.FINISHED_WITH_RETURN)throw new Error(`Deployment failed: ${receipt.statusName} / ${receipt.txExecutionResultName}`);
  const address=(receipt.txDataDecoded as DecodedDeployData)?.contractAddress||receipt.data?.contract_address;if(!address)throw new Error("No contract address in finalized receipt");
  const stats=await client.readContract({address:address as `0x${string}`,functionName:"get_stats",args:[]}) as any;
  if(String(stats?.chain_id)!==String(EXPECTED_CHAIN)||stats?.rpc!==EXPECTED_RPC)throw new Error("Deployed contract reports the wrong release network");
  mkdirSync(path.resolve(process.cwd(),"deployments"),{recursive:true});
  writeFileSync(path.resolve(process.cwd(),"deployments/studionet.json"),JSON.stringify({product:"CARVEOUT",network:"studionet",chainId:EXPECTED_CHAIN,rpc:EXPECTED_RPC,explorer:"https://explorer-studio.genlayer.com",deployedAt:new Date().toISOString(),contract:{address,txHash:tx}},null,2)+"\n");
  writeFileSync(path.resolve(process.cwd(),"frontend/.env.local"),[`NEXT_PUBLIC_CARVEOUT_CONTRACT=${address}`,`NEXT_PUBLIC_GENLAYER_CHAIN_ID=${EXPECTED_CHAIN}`,`NEXT_PUBLIC_GENLAYER_RPC_URL=${EXPECTED_RPC}`,`NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com`,""].join("\n"));
  console.log("CARVEOUT finalized on Studionet:",address); console.log("tx:",tx);
}
