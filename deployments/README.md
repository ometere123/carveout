# CARVEOUT deployment record

`deploy/deployScript.ts` writes `studionet.json` only after the deployment reaches FINALIZED with successful execution and `get_stats()` confirms chain `61999` and `https://studio.genlayer.com/api`.
