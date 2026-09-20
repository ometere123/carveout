import json
from tests.direct.conftest import hx

CONTRACT = "contracts/carveout.py"
EXCEPTIONS = json.dumps([
    {"code":"MAINT","title":"Scheduled maintenance","rule":"48 hour notice and matching window are required","proof":"dated public notice and timeline"},
    {"code":"UPSTREAM","title":"Upstream outage","rule":"named dependency outage must materially cause impact","proof":"official upstream plus service timeline"},
])
EVIDENCE = json.dumps([
    {"kind":"INDEPENDENT_PROBE","url":"https://probe.example/incident","note":"independent measured service window"},
    {"kind":"STATUS_AGGREGATOR","url":"https://status-archive.example/incident","note":"separate public status archive for the same window"},
])


def deploy(direct_deploy):
    return direct_deploy(CONTRACT)


def create(vm, c, provider, customer, bond=10**18):
    vm.sender = provider
    vm.value = bond
    vm.warp("2026-09-19T12:00:00Z")
    aid = c.create_agreement(
        hx(customer), "Payments API", "https://api.example.com", "availability", 9995, 10**18,
        1789819200, 1792411200, EXCEPTIONS, "provider plus independent public evidence", 900,
    )
    vm.value = 0
    return aid


def open_verified(vm, c, customer, aid, measured=9900):
    vm.sender = customer
    iid = c.open_incident(aid, measured, 1789819200, 1789822800, EVIDENCE)
    vm.mock_web(r".*", {"status":200, "body":"Payments API availability was 99.00% for the stated window."})
    vm.mock_llm(r".*", json.dumps({
        "result":"VERIFIED", "measured_bps":measured, "service_matches":True,
        "window_matches":True, "basis":"public probe establishes the metric",
    }))
    out = c.verify_measurement(iid)
    assert out["result"] == "VERIFIED"
    assert c.get_incident(iid)["status"] == "OPEN"
    vm.clear_mocks()
    return iid


def test_create_freezes_exception_and_bond(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);a=c.get_agreement(aid)
    assert a["provider"].lower()==hx(direct_alice).lower();assert a["customer"].lower()==hx(direct_bob).lower();assert len(a["exceptions"])==2;assert c.get_stats()["accounting_balanced"] is True


def test_bond_must_cover_credit(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**17;direct_vm.warp("2026-09-19T12:00:00Z")
    with direct_vm.expect_revert("provider bond"):
        c.create_agreement(hx(direct_bob),"API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"independent evidence required",900)


def test_only_customer_can_open_miss(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_alice
    with direct_vm.expect_revert("only the customer"):
        c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE)


def test_incident_requires_claimed_metric_below_target(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    with direct_vm.expect_revert("measured SLA miss"):
        c.open_incident(aid,9995,1789819200,1789822800,EVIDENCE)


def test_measurement_must_be_independently_verified_before_exception(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob;iid=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE);direct_vm.sender=direct_alice
    with direct_vm.expect_revert("provider cannot claim"):
        c.claim_exception(iid,"UPSTREAM",EVIDENCE)


def test_measurement_verification_uses_substantive_validator_replay(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob;iid=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"availability 99.00 percent"});direct_vm.mock_llm(r".*",json.dumps({"result":"VERIFIED","measured_bps":9900,"service_matches":True,"window_matches":True,"basis":"matches"}));c.verify_measurement(iid)
    direct_vm.clear_mocks();direct_vm.mock_web(r".*",{"status":200,"body":"availability 99.80 percent"});direct_vm.mock_llm(r".*",json.dumps({"result":"VERIFIED","measured_bps":9980,"service_matches":True,"window_matches":True,"basis":"different measurement"}));assert direct_vm.run_validator() is False


def test_measurement_not_proven_releases_agreement_for_new_attempt(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob;iid=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"unrelated status page"});direct_vm.mock_llm(r".*",json.dumps({"result":"NOT_PROVEN","measured_bps":0,"service_matches":False,"window_matches":False,"basis":"wrong service"}));c.verify_measurement(iid)
    assert c.get_incident(iid)["status"]=="MEASUREMENT_REJECTED";assert c.get_agreement(aid)["incident_id"]==""


def test_measurement_source_unavailable_is_retryable_nondecision(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob;iid=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE);direct_vm.mock_web(r".*",{"status":200,"body":""});out=c.verify_measurement(iid);assert out["result"]=="SOURCE_UNAVAILABLE";assert c.get_incident(iid)["status"]=="MEASUREMENT_INCONCLUSIVE"


def test_unfrozen_exception_rejected(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice
    with direct_vm.expect_revert("not frozen"):
        c.claim_exception(iid,"FORCE_MAJEURE",EVIDENCE)


def test_not_proven_exception_becomes_full_liability_pending(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"AWS incident began later than customer errors"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","liable_bps":10000,"facts":["impact predates upstream"],"basis":"causation not established"}))
    out=c.adjudicate_exception(iid);assert out["status"]=="NOT_PROVEN";assert c.get_incident(iid)["liable_bps"]=="10000";assert direct_vm.run_validator() is True


def test_validator_detects_different_exception_judgment(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","liable_bps":10000,"facts":["x"],"basis":"not proven"}));c.adjudicate_exception(iid)
    direct_vm.clear_mocks();direct_vm.mock_web(r".*",{"status":200,"body":"different"});direct_vm.mock_llm(r".*",json.dumps({"status":"PROVEN","liable_bps":0,"facts":["x"],"basis":"proven"}));assert direct_vm.run_validator() is False


def test_exception_source_unavailable_never_becomes_proven(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":""});out=c.adjudicate_exception(iid);assert out["status"]=="SOURCE_UNAVAILABLE";assert c.get_incident(iid)["status"]=="INCONCLUSIVE"


def test_unanswered_incident_defaults_to_full_breach_after_response_window(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.warp("2026-09-19T13:01:00Z");direct_vm.sender=direct_bob;out=c.finalize_default_breach(iid);assert out["liable_bps"]==10000;assert c.get_incident(iid)["status"]=="FINAL";assert c.get_credit(hx(direct_bob))==str(10**18);assert c.get_stats()["accounting_balanced"] is True


def test_provider_cannot_invoke_exception_after_response_deadline(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.warp("2026-09-19T13:01:00Z");direct_vm.sender=direct_alice
    with direct_vm.expect_revert("provider cannot claim"):
        c.claim_exception(iid,"UPSTREAM",EVIDENCE)


def test_credit_withdrawal_cannot_redirect(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.warp("2026-10-25T12:00:00Z");direct_vm.sender=direct_alice;c.expire_agreement(aid);direct_vm.sender=direct_bob
    with direct_vm.expect_revert("credit may only"):
        c.withdraw_credit(hx(direct_alice))


def test_stats_are_hard_locked_to_studionet(direct_vm,direct_deploy):
    s=deploy(direct_deploy).get_stats();assert s["chain_id"]=="61999";assert s["rpc"]=="https://studio.genlayer.com/api";assert s["admin_controls"] is False


def test_unavailable_measurement_can_be_dismissed_after_bounded_retry(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    iid=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":""})
    assert c.verify_measurement(iid)["result"]=="SOURCE_UNAVAILABLE"
    direct_vm.warp("2026-09-19T18:01:00Z")
    c.dismiss_unproven_measurement(iid)
    assert c.get_incident(iid)["status"]=="MEASUREMENT_REJECTED"
    assert c.get_agreement(aid)["incident_id"]==""


def test_partial_exception_settlement_uses_deterministic_liability_share(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"Upstream outage overlaps only part of customer impact."})
    direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","liable_bps":3000,"facts":["70 percent overlap"],"basis":"30 percent remains provider-liable"}))
    c.adjudicate_exception(iid);direct_vm.warp("2026-09-19T12:16:00Z")
    out=c.finalize_incident(iid)
    assert out["liable_bps"]==3000
    assert out["payout_atto"]==str(3*10**17)
    assert c.get_credit(hx(direct_bob))==str(3*10**17)
    assert c.get_stats()["accounting_balanced"] is True


def test_undecidable_exception_challenge_expires_and_refunds_challenger(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline"});direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","liable_bps":3000,"facts":["partial"],"basis":"partial overlap"}));c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_bob;direct_vm.value=10**16;c.challenge_exception(iid,"The upstream event starts later than the customer impact.","https://counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":""});assert c.resolve_challenge(iid)["outcome"]=="SOURCE_UNAVAILABLE"
    direct_vm.warp("2026-09-20T13:00:00Z");c.expire_challenge(iid)
    ch=json.loads(c.get_incident(iid)["challenge"]);assert ch["status"]=="EXPIRED";assert c.get_credit(hx(direct_bob))==str(10**16)


def test_measurement_packet_requires_independent_probe_plus_second_source_family(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    weak=json.dumps([{"kind":"INDEPENDENT_PROBE","url":"https://probe.example/only","note":"only one source"}])
    with direct_vm.expect_revert("evidence must contain 2"):
        c.open_incident(aid,9900,1789819200,1789822800,weak)
    same_family=json.dumps([{"kind":"INDEPENDENT_PROBE","url":"https://probe-a.example/x","note":"probe a"},{"kind":"INDEPENDENT_PROBE","url":"https://probe-b.example/x","note":"probe b"}])
    with direct_vm.expect_revert("two source families"):
        c.open_incident(aid,9900,1789819200,1789822800,same_family)


def test_provider_can_challenge_pending_liability_and_rejected_bond_goes_to_customer(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline does not establish upstream causation"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","liable_bps":10000,"facts":["causation not established"],"basis":"full provider liability"}))
    c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_alice;direct_vm.value=10**16;c.challenge_exception(iid,"Counter-evidence establishes an upstream overlap.","https://provider-counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":"counter-evidence does not change the liability finding"})
    direct_vm.mock_llm(r".*",json.dumps({"outcome":"REJECTED","revised_liable_bps":10000,"basis":"pending allocation remains"}))
    out=c.resolve_challenge(iid)
    assert out["outcome"]=="REJECTED"
    assert c.get_credit(hx(direct_bob))==str(10**16)
    assert c.get_stats()["accounting_balanced"] is True
