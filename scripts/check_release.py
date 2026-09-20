from pathlib import Path
root = Path(__file__).resolve().parents[1]
forbidden = ["61997", "studio-dev.genlayer.com", "wallet_getSnaps", "wallet_requestSnaps", "WalletConnect", "Privy"]
scan = [root / "contracts", root / "frontend", root / "deploy", root / "gltest.config.yaml"]
failures=[]
for entry in scan:
    paths = [entry] if entry.is_file() else [x for x in entry.rglob("*") if x.is_file() and x.suffix in {".py",".ts",".tsx",".js",".json",".yaml",".yml",".env",".example"}]
    for path in paths:
        text=path.read_text(encoding="utf-8", errors="ignore")
        for token in forbidden:
            if token in text: failures.append(f"{path.relative_to(root)}: {token}")
contract=(root/"contracts/carveout.py").read_text()
for required in ['NETWORK_ID = "61999"','RPC_URL = "https://studio.genlayer.com/api"']:
    if required not in contract: failures.append("missing contract network lock: "+required)
if failures:
    print("CARVEOUT_RELEASE_CHECK=FAIL")
    print("\n".join(failures)); raise SystemExit(1)
print("CARVEOUT_RELEASE_CHECK=PASS")
print("NETWORK=Studionet")
print("CHAIN_ID=61999")
print("RPC=https://studio.genlayer.com/api")
