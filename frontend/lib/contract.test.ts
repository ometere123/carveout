import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { assertContractAddress } from "./walletGuard.ts";

test("injected browser write sends with a JSON-RPC account and routes through window.ethereum", async () => {
  const wallet = "0x1234567890123456789012345678901234567890" as const;
  const contract = "0x75f2e473E6f010B510F1d281C8E4679fD2043054" as const;
  const sent: Array<{ method: string; params?: unknown[] }> = [];
  const injected = { request: async ({ method, params }: { method: string; params?: unknown[] }) => {
    sent.push({ method, params });
    if (method === "eth_chainId") return "0xf22f";
    if (method === "eth_accounts") return [wallet];
    if (method === "eth_sendTransaction") return "0x" + "ab".repeat(32);
    throw new Error(`Unexpected injected wallet request: ${method}`);
  } };
  const previousWindow = (globalThis as any).window;
  const previousFetch = globalThis.fetch;
  const previousContract = process.env.NEXT_PUBLIC_CARVEOUT_CONTRACT;
  const previousChain = process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID;
  const previousRpc = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL;
  process.env.NEXT_PUBLIC_CARVEOUT_CONTRACT = contract;
  process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID = "61999";
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL = "https://studio.genlayer.com/api";
  (globalThis as any).window = { ethereum: injected };
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const payload = JSON.parse(String(init?.body));
    const result = payload.method === "eth_estimateGas" ? "0x30d40" : payload.method === "eth_gasPrice" ? "0x1" : "0x0";
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: payload.id, result }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  try {
    const { write, writeWithClient } = await import("./contract.ts");
    const hash = await write(wallet, "create_agreement", [], 123n);
    assert.equal(hash, "0x" + "ab".repeat(32));
    const transaction = sent.find((request) => request.method === "eth_sendTransaction")?.params?.[0] as any;
    assert.ok(transaction, "GenLayer SDK should route eth_sendTransaction through the injected EIP-1193 provider");
    assert.equal(transaction.from, wallet);
    assert.equal(transaction.chainId, "0xf22f");
    assert.equal(transaction.value, "0x7b", "payable GEN value must reach the injected transaction request");

    let captured: any;
    await writeWithClient({ writeContract: async (request) => { captured = request; return "ok"; } }, wallet, contract, "create_agreement", [], 123n);
    assert.equal(captured.account.address, wallet);
    assert.equal(captured.account.type, "json-rpc");
    assert.equal(captured.address, contract);
    assert.equal(captured.value, 123n);
    assertContractAddress(contract);
    assert.throws(() => assertContractAddress("undefined"), /canonical contract address is missing or invalid/);
    const forbiddenWalletPaths = ["privateKey" + "ToAccount", "wallet_get" + "Snaps", "wallet_request" + "Snaps", "Wallet" + "Connect"];
    const adapterSource = await readFile(new URL("./contract.ts", import.meta.url), "utf8");
    for (const forbiddenPath of forbiddenWalletPaths) assert.ok(!adapterSource.includes(forbiddenPath));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousContract === undefined) delete process.env.NEXT_PUBLIC_CARVEOUT_CONTRACT;
    else process.env.NEXT_PUBLIC_CARVEOUT_CONTRACT = previousContract;
    if (previousChain === undefined) delete process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID;
    else process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID = previousChain;
    if (previousRpc === undefined) delete process.env.NEXT_PUBLIC_GENLAYER_RPC_URL;
    else process.env.NEXT_PUBLIC_GENLAYER_RPC_URL = previousRpc;
  }
});
