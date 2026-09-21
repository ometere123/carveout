const txId = "0x4fb02e8700c6a15f467b2a4650144c08f55bcd19deba6c28e2b4f137e8587ac1";
const endpoint = "https://studio.genlayer.com/api";

if (process.env.STUDIONET_RECEIPT_PROBE !== "1") {
  throw new Error("Set STUDIONET_RECEIPT_PROBE=1 to query the live Studionet endpoint.");
}

for (const [method, params] of [
  ["gen_getTransactionReceipt", [{ txId }]],
  ["gen_getTransactionStatus", [{ txId }]],
  // The current hosted node accepts this legacy status argument form too.
  ["gen_getTransactionStatus", [txId]],
]) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const body = await response.json();
  console.log(JSON.stringify({ method, params, httpStatus: response.status, response: body }, null, 2));
}
