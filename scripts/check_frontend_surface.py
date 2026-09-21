"""Static guard for the required multipage frontend and real contract action surface.

This is not a Next.js build. It prevents accidental handoff regressions before dependencies are installed.
"""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
front = root / "frontend"
required_routes = ['app/page.tsx', 'app/agreements/page.tsx', 'app/agreements/[id]/page.tsx', 'app/open/page.tsx', 'app/account/page.tsx', 'app/protocol/page.tsx']
required_actions = ['accept_agreement', 'expire_proposal', 'open_incident', 'verify_measurement', 'claim_exception', 'adjudicate_exception', 'challenge_exception', 'resolve_challenge', 'finalize_default_breach', 'finalize_incident', 'withdraw_credit']
failures=[]
for rel in required_routes:
    if not (front / rel).is_file(): failures.append("missing route: " + rel)
all_source = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in front.rglob("*") if p.is_file() and p.suffix in {".ts",".tsx"} and "node_modules" not in p.parts and ".next" not in p.parts)
for action in required_actions:
    if f'"{action}"' not in all_source and f"'{action}'" not in all_source:
        failures.append("frontend does not expose contract action: " + action)
config=(front/"lib/config.ts").read_text(encoding="utf-8")
wallet=(front/"lib/wallet.ts").read_text(encoding="utf-8")
contract=(front/"lib/contract.ts").read_text(encoding="utf-8")
receipt=(front/"lib/finalizedReceipt.ts").read_text(encoding="utf-8")
execution=(front/"lib/executionFailure.ts").read_text(encoding="utf-8")
for required in ('CHAIN_ID = 61999','https://studio.genlayer.com/api'):
    if required not in config: failures.append("missing frontend release lock: " + required)
for required in ('window.ethereum','eth_requestAccounts','wallet_switchEthereumChain','wallet_addEthereumChain'):
    if required not in wallet: failures.append("missing EIP-1193 path: " + required)
for required, source in (
    ('writeContract', contract),
    ('LATEST_FINAL', contract),
    ('waitForTransactionReceipt', receipt),
    ('FINALIZED', receipt),
    ('finishedwithreturn', execution),
):
    if required not in source: failures.append("missing finalized GenLayer integration behavior: " + required)
if "debugTraceTransaction" in receipt or "gen_dbg_traceTransaction" in receipt:
    failures.append("production transaction verification must not depend on the optional GenLayer debug RPC")
for forbidden in ('wallet_getSnaps','wallet_requestSnaps','WalletConnect','Privy'):
    if forbidden in all_source: failures.append("forbidden wallet path: " + forbidden)
if failures:
    print("CARVEOUT_FRONTEND_SURFACE_CHECK=FAIL")
    print("\n".join(failures))
    raise SystemExit(1)
print("CARVEOUT_FRONTEND_SURFACE_CHECK=PASS")
print("ROUTES=" + str(len(required_routes)))
print("REQUIRED_ACTIONS=" + str(len(required_actions)))
