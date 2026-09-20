export const CHAIN_ID = 61999;
export const CHAIN_HEX = "0x" + CHAIN_ID.toString(16);
export const RPC = "https://studio.genlayer.com/api";
export const EXPLORER = "https://explorer-studio.genlayer.com";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CARVEOUT_CONTRACT || "";
export const NETWORK = {
  chainId: CHAIN_HEX,
  chainName: "GenLayer Studionet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: [RPC],
  blockExplorerUrls: [EXPLORER],
};
export function assertReleaseConfig() {
  const envId = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || CHAIN_ID);
  const envRpc = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || RPC;
  if (envId !== CHAIN_ID || envRpc !== RPC) throw new Error("CARVEOUT is locked to Studionet 61999 / studio.genlayer.com/api");
}
