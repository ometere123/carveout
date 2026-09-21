"""Check local source/schema hashes and locked Studionet release metadata."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "deployments" / "studionet.json").read_text(encoding="utf-8"))
candidate = manifest.get("releaseCandidate")
if not candidate:
    raise SystemExit("releaseCandidate metadata is missing")
if manifest.get("network") != "studionet" or manifest.get("chainId") != 61999:
    raise SystemExit("manifest is not locked to Studionet 61999")
if manifest.get("rpc") != "https://studio.genlayer.com/api":
    raise SystemExit("manifest RPC is not the canonical Studionet endpoint")
contract = (ROOT / "contracts" / "carveout.py").read_bytes()
source_hash = hashlib.sha256(contract).hexdigest()
if source_hash != candidate.get("source", {}).get("sha256"):
    raise SystemExit("candidate contract source hash does not match contracts/carveout.py")
schema_path = ROOT / candidate["schema"]["path"]
schema_hash = hashlib.sha256(schema_path.read_bytes()).hexdigest()
if schema_hash != candidate["schema"].get("sha256"):
    raise SystemExit("candidate schema hash does not match its recorded hash")
if candidate.get("targetAddress") is not None:
    raise SystemExit("candidate target address must remain unset until a human verifies deployment")
if candidate.get("deployed") is not False:
    raise SystemExit("candidate must remain undeployed until a human verifies its deployment")
print("CARVEOUT_RELEASE_MANIFEST=PASS")
print(f"NETWORK=studionet CHAIN_ID=61999 RPC={manifest['rpc']}")
print(f"CANDIDATE_SOURCE_SHA256={source_hash}")
print(f"CANDIDATE_SCHEMA_SHA256={schema_hash}")
print("CANDIDATE_DEPLOYED=false (human deployment and readback required)")
