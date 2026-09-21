import assert from "node:assert/strict";
import { test } from "node:test";
import { getTransactionReceipt, getTransactionStatus, genRpc } from "./genlayerRpc.ts";

test("receipt adapter sends the documented Studionet RPC request shape", async () => {
  let sentUrl = "";
  let sentInit: RequestInit | undefined;
  const receipt = { statusName: "Finalized", txExecutionResult: 1, txExecutionResultName: "FinishedWithReturn" };
  const mockFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    sentUrl = String(input); sentInit = init;
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: receipt }), { status: 200 });
  }) as typeof fetch;
  const result = await getTransactionReceipt(`0x${"4f".repeat(32)}`, mockFetch);
  assert.equal(result.txExecutionResult, 1);
  assert.equal(sentUrl, "https://studio.genlayer.com/api");
  assert.equal(sentInit?.method, "POST");
  assert.equal(JSON.parse(String(sentInit?.body)).method, "gen_getTransactionReceipt");
  assert.deepEqual(JSON.parse(String(sentInit?.body)).params, [{ txId: `0x${"4f".repeat(32)}` }]);
});

test("JSON-RPC errors are retained as unavailable receipt metadata", async () => {
  await assert.rejects(genRpc("gen_getTransactionReceipt", [{}], (async () => new Response(JSON.stringify({ error: { code: -32601, message: "Method not found" } }), { status: 200 })) as typeof fetch), /Method not found/);
});

test("status adapter follows the bare-hash argument accepted by hosted Studionet", async () => {
  let payload: any;
  const status = await getTransactionStatus(`0x${"4f".repeat(32)}`, (async (_input: RequestInfo | URL, init?: RequestInit) => {
    payload = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "FINALIZED" }), { status: 200 });
  }) as typeof fetch);
  assert.equal(status, "FINALIZED");
  assert.deepEqual(payload.params, [`0x${"4f".repeat(32)}`]);
});
