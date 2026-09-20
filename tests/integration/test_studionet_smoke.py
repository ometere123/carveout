"""Opt-in live Studionet smoke test for the canonical deployed contract.

Run after deployment with CARVEOUT_CONTRACT=0x...:
    gltest tests/integration/ -v -s --network studionet

The test intentionally skips before deployment instead of pretending that a local
configuration assertion proves network integration.
"""

import os

import pytest
from eth_account import Account

from genlayer_py import create_client
from genlayer_py.chains import studionet

EXPECTED_RPC = "https://studio.genlayer.com/api"
EXPECTED_CHAIN_ID = 61999


@pytest.mark.integration
def test_canonical_deployment_reports_studionet_and_balanced_accounting():
    address = os.getenv("CARVEOUT_CONTRACT", "").strip()
    if not address:
        pytest.skip("set CARVEOUT_CONTRACT to the finalized Studionet deployment address")

    assert studionet.id == EXPECTED_CHAIN_ID
    assert studionet.rpc_urls["default"]["http"][0] == EXPECTED_RPC

    # The pinned genlayer-py read API requires a sender address but does not sign
    # a view request. Generate an ephemeral in-memory account for this read-only
    # integration check instead of depending on or persisting a deployment key.
    client = create_client(chain=studionet, account=Account.create())
    stats = client.read_contract(
        address=address,
        function_name="get_stats",
        args=[],
    )

    assert stats["network"] == "Studionet"
    assert stats["chain_id"] == str(EXPECTED_CHAIN_ID)
    assert stats["rpc"] == EXPECTED_RPC
    assert stats["accounting_balanced"] is True
    assert stats["admin_controls"] is False
