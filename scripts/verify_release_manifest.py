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
deployed = candidate.get("deployed")
target_address = candidate.get("targetAddress")
if deployed is False:
    if target_address is not None:
        raise SystemExit("undeployed candidate cannot have a target address")
elif deployed is True:
    import re
    verification = candidate.get("deploymentVerification", {})
    if not isinstance(target_address, str) or not re.fullmatch(r"0x[0-9a-fA-F]{40}", target_address):
        raise SystemExit("deployed candidate needs a valid verified target address")
    if verification.get("status") != "PASS":
        raise SystemExit("candidate deployment must be marked verified")
    if verification.get("network") != "studionet" or verification.get("chainId") != 61999 or verification.get("rpc") != "https://studio.genlayer.com/api":
        raise SystemExit("deployed candidate verification is not locked to Studionet 61999")
    if verification.get("deploymentTransaction") != candidate.get("deployment", {}).get("transaction"):
        raise SystemExit("candidate deployment transaction verification mismatch")
    if verification.get("sourceSha256") != source_hash:
        raise SystemExit("deployed contract source hash does not match local candidate")
    if verification.get("schemaSha256") != schema_hash:
        raise SystemExit("deployed schema hash does not match local candidate")
    if verification.get("sourceMatchesLocalByteForByte") is not True or verification.get("schemaMatchesLocal") is not True:
        raise SystemExit("deployed source/schema must explicitly match local release artifacts")
    if candidate.get("deployment", {}).get("address", "").lower() != target_address.lower():
        raise SystemExit("candidate deployment address does not match verified target")
    if candidate.get("deployment", {}).get("status") != "FINALIZED" or candidate.get("deployment", {}).get("execution") != "SUCCESS":
        raise SystemExit("candidate deployment must be finalized with successful execution")
    frontend = candidate.get("frontend", {})
    if frontend.get("contractAddress", "").lower() != target_address.lower():
        raise SystemExit("candidate frontend contract address must match verified deployment")
    if frontend.get("productionEnvironmentConfigured") is not True:
        raise SystemExit("candidate contract address must be configured in Vercel Production")
else:
    raise SystemExit("candidate deployed flag must be true or false")
print("CARVEOUT_RELEASE_MANIFEST=PASS")
print(f"NETWORK=studionet CHAIN_ID=61999 RPC={manifest['rpc']}")
print(f"CANDIDATE_SOURCE_SHA256={source_hash}")
print(f"CANDIDATE_SCHEMA_SHA256={schema_hash}")
print(f"CANDIDATE_DEPLOYED={str(deployed).lower()} ADDRESS={target_address or 'PENDING'}")
