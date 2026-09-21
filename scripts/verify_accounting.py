"""Verify the public get_stats accounting equation from a saved JSON response."""

import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("stats_json", help="Path to the JSON object returned by get_stats()")
args = parser.parse_args()
stats = json.loads(Path(args.stats_json).read_text(encoding="utf-8"))
if str(stats.get("chain_id")) != "61999" or stats.get("rpc") != "https://studio.genlayer.com/api":
    raise SystemExit("get_stats() did not identify canonical Studionet 61999")
deposited = int(stats["total_deposited"])
parts = sum(int(stats[key]) for key in ("agreement_escrow", "challenge_escrow", "claimable", "withdrawn"))
if deposited != parts or stats.get("accounting_balanced") is not True:
    raise SystemExit(f"accounting mismatch: deposited={deposited}, escrow+claimable+withdrawn={parts}")
print("CARVEOUT_ACCOUNTING=PASS")
print(f"total_deposited={deposited}")
print(f"agreement_escrow={stats['agreement_escrow']}")
print(f"challenge_escrow={stats['challenge_escrow']}")
print(f"claimable={stats['claimable']}")
print(f"withdrawn={stats['withdrawn']}")
