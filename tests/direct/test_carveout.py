import hashlib
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

SOURCE_POLICY = json.dumps({
    "measurement":[
        {"kind":"INDEPENDENT_PROBE","host":"probe.example","path_prefix":"/incident"},
        {"kind":"STATUS_AGGREGATOR","host":"status-archive.example","path_prefix":"/incident"},
        {"kind":"PROVIDER_STATUS","host":"status.api.example.com","path_prefix":"/history"},
    ],
    "exception":[
        {"kind":"UPSTREAM_STATUS","host":"status.example.net","path_prefix":"/incident"},
        {"kind":"INDEPENDENT_TIMELINE","host":"example.org","path_prefix":"/timeline"},
    ],
    "challenge":[
        {"kind":"COUNTER_EVIDENCE","host":"counter.example","path_prefix":"/evidence"},
        {"kind":"COUNTER_EVIDENCE","host":"provider-counter.example","path_prefix":"/evidence"},
    ],
})
EXCEPTION_EVIDENCE = json.dumps([
    {"kind":"UPSTREAM_STATUS","url":"https://status.example.net/incident","note":"official named upstream incident and timestamps"},
    {"kind":"INDEPENDENT_TIMELINE","url":"https://example.org/timeline","note":"independent service impact timeline"},
])


def deploy(direct_deploy):
    return direct_deploy(CONTRACT)


def propose(vm, c, provider, customer, bond=10**18):
    vm.sender = provider
    vm.value = bond
    vm.warp("2026-09-19T11:00:00Z")
    aid = c.create_agreement(
        hx(customer), "Payments API", "https://api.example.com", "availability", 9995, 10**18,
        1789819200, 1792411200, EXCEPTIONS, "provider plus independent public evidence", SOURCE_POLICY, 900,
    )
    vm.value = 0
    return aid


def create(vm, c, provider, customer, bond=10**18):
    aid = propose(vm, c, provider, customer, bond)
    vm.sender = customer
    c.accept_agreement(aid)
    vm.warp("2026-09-19T13:00:00Z")
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
    assert c.get_incident(iid)["measurement_case_hash"]
    vm.clear_mocks()
    return iid


def test_create_freezes_exception_and_bond(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);a=c.get_agreement(aid)
    assert a["provider"].lower()==hx(direct_alice).lower();assert a["customer"].lower()==hx(direct_bob).lower();assert len(a["exceptions"])==2;assert a["status"]=="ACTIVE";assert int(a["accepted_at"])<int(a["window_start"]);assert c.get_stats()["accounting_balanced"] is True



def test_provider_proposal_cannot_self_activate_and_customer_must_accept(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=propose(direct_vm,c,direct_alice,direct_bob)
    assert c.get_agreement(aid)["status"]=="PROPOSED"
    with direct_vm.expect_revert("only the named customer"):
        c.accept_agreement(aid)
    direct_vm.sender=direct_bob;c.accept_agreement(aid)
    assert c.get_agreement(aid)["status"]=="ACTIVE"
    assert c.get_stats()["accounting_balanced"] is True


def test_late_acceptance_expires_proposal_and_refunds_provider(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=propose(direct_vm,c,direct_alice,direct_bob)
    direct_vm.warp("2026-09-19T11:55:00Z");direct_vm.sender=direct_bob
    with direct_vm.expect_revert("proposal is not open"):
        c.accept_agreement(aid)
    c.expire_proposal(aid)
    assert c.get_agreement(aid)["status"]=="EXPIRED"
    assert c.get_credit(hx(direct_alice))==str(10**18)
    stats=c.get_stats();assert stats["agreement_escrow"]=="0" and stats["accounting_balanced"] is True


def test_agreement_cannot_be_created_once_formation_lead_is_lost(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**18;direct_vm.warp("2026-09-19T11:55:00Z")
    with direct_vm.expect_revert("ten minutes for bilateral formation"):
        c.create_agreement(hx(direct_bob),"Payments API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"provider plus independent public evidence",SOURCE_POLICY,900)
    assert c.get_stats()["total_deposited"]=="0"

def test_bond_must_cover_credit(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**17;direct_vm.warp("2026-09-19T11:00:00Z")
    with direct_vm.expect_revert("provider bond"):
        c.create_agreement(hx(direct_bob),"API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"independent evidence required",SOURCE_POLICY,900)


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
        c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)


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



def test_untrusted_independent_probe_label_cannot_bypass_frozen_origin_policy(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    fake=json.dumps([
        {"kind":"INDEPENDENT_PROBE","url":"https://attacker.example/incident","note":"self-labelled independent source"},
        {"kind":"STATUS_AGGREGATOR","url":"https://status-archive.example/incident","note":"allowed archive"},
    ])
    with direct_vm.expect_revert("outside the frozen source policy"):
        c.open_incident(aid,9900,1789819200,1789822800,fake)


def test_two_measurement_families_cannot_share_one_origin(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    duplicate=json.dumps([
        {"kind":"INDEPENDENT_PROBE","url":"https://probe.example/incident","note":"probe"},
        {"kind":"STATUS_AGGREGATOR","url":"https://probe.example/incident/archive","note":"same origin with a second label"},
    ])
    with direct_vm.expect_revert("origins must be distinct"):
        c.open_incident(aid,9900,1789819200,1789822800,duplicate)


def test_frozen_source_path_prefix_is_enforced(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    mismatch=json.dumps([
        {"kind":"INDEPENDENT_PROBE","url":"https://probe.example/private/incident","note":"path not covered by formation"},
        {"kind":"STATUS_AGGREGATOR","url":"https://status-archive.example/incident","note":"allowed archive"},
    ])
    with direct_vm.expect_revert("path is outside the frozen source policy"):
        c.open_incident(aid,9900,1789819200,1789822800,mismatch)

def test_unfrozen_exception_rejected(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice
    with direct_vm.expect_revert("not frozen"):
        c.claim_exception(iid,"FORCE_MAJEURE",EVIDENCE)


def test_not_proven_exception_becomes_full_liability_pending(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"AWS incident began later than customer errors"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":["impact predates upstream"],"basis":"causation not established"}))
    out=c.adjudicate_exception(iid);assert out["status"]=="NOT_PROVEN";assert c.get_incident(iid)["liable_bps"]=="10000";assert direct_vm.run_validator() is True


def test_validator_detects_different_exception_judgment(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":["x"],"basis":"not proven"}));c.adjudicate_exception(iid)
    direct_vm.clear_mocks();direct_vm.mock_web(r".*",{"status":200,"body":"different"});direct_vm.mock_llm(r".*",json.dumps({"status":"PROVEN","facts":["x"],"basis":"proven"}));assert direct_vm.run_validator() is False


def test_exception_source_unavailable_never_becomes_proven(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":""});out=c.adjudicate_exception(iid);assert out["status"]=="SOURCE_UNAVAILABLE";assert c.get_incident(iid)["status"]=="INCONCLUSIVE"


def test_unanswered_incident_defaults_to_full_breach_after_response_window(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.warp("2026-09-19T14:01:00Z");direct_vm.sender=direct_bob;out=c.finalize_default_breach(iid);assert out["liable_bps"]==10000;assert c.get_incident(iid)["status"]=="FINAL";assert c.get_credit(hx(direct_bob))==str(10**18);assert c.get_stats()["accounting_balanced"] is True


def test_provider_cannot_invoke_exception_after_response_deadline(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid);direct_vm.warp("2026-09-19T14:01:00Z");direct_vm.sender=direct_alice
    with direct_vm.expect_revert("provider cannot claim"):
        c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)


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
    direct_vm.warp("2026-09-19T19:01:00Z")
    c.dismiss_unproven_measurement(iid)
    assert c.get_incident(iid)["status"]=="MEASUREMENT_REJECTED"
    assert c.get_agreement(aid)["incident_id"]==""


def test_partial_exception_settlement_uses_deterministic_liability_share(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"Upstream outage overlaps only part of customer impact."})
    direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","excused_intervals":[{"from_ts":1789819200,"to_ts":1789821720,"evidence_ids":["X1"]}],"facts":["70 percent overlap"],"basis":"upstream evidence covers 70 percent of the measured interval"}))
    c.adjudicate_exception(iid);direct_vm.warp("2026-09-19T13:16:00Z")
    out=c.finalize_incident(iid)
    assert out["liable_bps"]==3000
    assert out["payout_atto"]==str(3*10**17)
    assert c.get_credit(hx(direct_bob))==str(3*10**17)
    assert c.get_stats()["accounting_balanced"] is True




def test_partial_exception_intervals_cannot_overlap(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"partial overlap"})
    intervals=[{"from_ts":1789819200,"to_ts":1789821000,"evidence_ids":["X1"]},{"from_ts":1789820900,"to_ts":1789821720,"evidence_ids":["X1"]}]
    direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","excused_intervals":intervals,"facts":[],"basis":"overlapping intervals"}))
    out=c.adjudicate_exception(iid)
    assert out["status"]=="INCONCLUSIVE" and c.get_incident(iid)["status"]=="INCONCLUSIVE"
    assert c.get_stats()["accounting_balanced"] is True


def test_partial_exception_interval_must_stay_inside_observation(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"partial overlap"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","excused_intervals":[{"from_ts":1789819100,"to_ts":1789821720,"evidence_ids":["X1"]}],"facts":[],"basis":"outside the observation"}))
    out=c.adjudicate_exception(iid)
    assert out["status"]=="INCONCLUSIVE" and c.get_incident(iid)["status"]=="INCONCLUSIVE"


def test_malformed_partial_interval_output_fails_closed(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"partial overlap"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","excused_intervals":[{"from_ts":"start","to_ts":1789821720,"evidence_ids":["NOT_FROZEN"]}],"facts":[],"basis":"malformed interval"}))
    out=c.adjudicate_exception(iid)
    assert out["status"]=="INCONCLUSIVE" and c.get_incident(iid)["exception_result"]=="INCONCLUSIVE"

def test_case_commitments_are_stable_and_change_when_measurement_evidence_changes(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    i1=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE)
    first=c.get_incident(i1)["measurement_case_hash"]
    assert first==c.get_incident(i1)["measurement_case_hash"]
    direct_vm.mock_web(r".*",{"status":200,"body":"unrelated service evidence"})
    direct_vm.mock_llm(r".*",json.dumps({"result":"NOT_PROVEN","measured_bps":0,"service_matches":False,"window_matches":False,"basis":"evidence does not prove the claim"}))
    c.verify_measurement(i1);direct_vm.clear_mocks()
    alternate=json.dumps([
        {"kind":"INDEPENDENT_PROBE","url":"https://probe.example/incident/second","note":"independent measured service window"},
        {"kind":"STATUS_AGGREGATOR","url":"https://status-archive.example/incident","note":"separate public status archive for the same window"},
    ])
    i2=c.open_incident(aid,9900,1789819200,1789822800,alternate)
    a=c.get_agreement(aid);second=c.get_incident(i2)["measurement_case_hash"]
    def expected(incident_id,evidence):
        value={"spec_hash":a["spec_hash"],"incident_id":incident_id,"observed_from":"1789819200","observed_to":"1789822800","claimed_actual_bps":"9900","measurement_evidence":[{"id":f"E{index+1}",**item} for index,item in enumerate(json.loads(evidence))]}
        return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    assert first==expected(i1,EVIDENCE)
    assert second==expected(i2,alternate)
    assert second!=first


def test_exception_and_challenge_hashes_bind_full_case_inputs(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    inc=c.get_incident(iid); measurement_hash=inc["measurement_case_hash"]; exception_hash=inc["exception_case_hash"]
    agreement=c.get_agreement(aid); clause=next(x for x in agreement["exceptions"] if x["code"]=="UPSTREAM")
    commitment={"spec_hash":agreement["spec_hash"],"measurement_case_hash":measurement_hash,"verified_actual_bps":inc["actual_bps"],"measurement_basis":inc["measurement_basis"],"incident_id":iid,"observed_from":inc["observed_from"],"observed_to":inc["observed_to"],"exception_code":"UPSTREAM","frozen_clause":clause,"exception_evidence":inc["exception_evidence"]}
    expected_exception_hash=hashlib.sha256(json.dumps(commitment,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    assert exception_hash==expected_exception_hash and c.get_incident(iid)["exception_case_hash"]==exception_hash
    direct_vm.mock_web(r".*",{"status":200,"body":"original measurement and upstream evidence"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":["no causal link"],"basis":"causation not established"}))
    c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_vm.sender
    direct_vm.value=10**16;c.challenge_exception(iid,"The original event timeline contradicts the pending finding.","https://counter.example/evidence");direct_vm.value=0
    after=c.get_incident(iid);challenge_hash=after["challenge_case_hash"]
    assert after["measurement_case_hash"]==measurement_hash and after["exception_case_hash"]==exception_hash
    assert challenge_hash and json.loads(after["challenge"])["case_hash"]==challenge_hash


def test_challenge_replays_all_original_evidence_and_validator_detects_substantive_disagreement(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"full record shows the claimed upstream did not overlap the incident"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":["timeline mismatch"],"basis":"not established"}))
    c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_bob;direct_vm.value=10**16;c.challenge_exception(iid,"The incident window is covered by the upstream record.","https://counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":"complete original measurements, exception record, and new counter evidence"})
    direct_vm.mock_llm(r".*",json.dumps({"outcome":"REJECTED","basis":"pending decision still matches full record"}))
    c.resolve_challenge(iid)
    direct_vm.clear_mocks();direct_vm.mock_web(r".*",{"status":200,"body":"different complete record contradicts the exception finding"})
    direct_vm.mock_llm(r".*",json.dumps({"outcome":"UPHELD","revised_status":"PARTIAL","excused_intervals":[{"from_ts":1789819200,"to_ts":1789821720,"evidence_ids":["X1"]}],"basis":"original exception analysis missed clear overlap"}))
    assert direct_vm.run_validator() is False


def test_challenge_outcome_upheld_refunds_bond_and_revises_liability(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":["pending"],"basis":"not established"}))
    c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_bob;direct_vm.value=10**16;c.challenge_exception(iid,"The complete event timeline shows material overlap.","https://counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":"complete record proves the invoked upstream event overlapped the measured miss"})
    direct_vm.mock_llm(r".*",json.dumps({"outcome":"UPHELD","revised_status":"PARTIAL","excused_intervals":[{"from_ts":1789819200,"to_ts":1789821720,"evidence_ids":["X1"]}],"basis":"record proves most impact was excused"}))
    out=c.resolve_challenge(iid)
    assert out["outcome"]=="UPHELD" and c.get_incident(iid)["liable_bps"]=="3000"
    assert c.get_credit(hx(direct_bob))==str(10**16)
    assert c.get_stats()["accounting_balanced"] is True

def test_undecidable_exception_challenge_expires_and_refunds_challenger(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline"});direct_vm.mock_llm(r".*",json.dumps({"status":"PARTIAL","excused_intervals":[{"from_ts":1789819200,"to_ts":1789821720,"evidence_ids":["X1"]}],"facts":["partial"],"basis":"partial overlap"}));c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_bob;direct_vm.value=10**16;c.challenge_exception(iid,"The upstream event starts later than the customer impact.","https://counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":""});assert c.resolve_challenge(iid)["outcome"]=="SOURCE_UNAVAILABLE"
    direct_vm.warp("2026-09-20T13:16:00Z");c.expire_challenge(iid)
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
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"timeline does not establish upstream causation"})
    direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":["causation not established"],"basis":"full provider liability"}))
    c.adjudicate_exception(iid);direct_vm.clear_mocks()
    direct_vm.sender=direct_alice;direct_vm.value=10**16;c.challenge_exception(iid,"Counter-evidence establishes an upstream overlap.","https://provider-counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":"counter-evidence does not change the liability finding"})
    direct_vm.mock_llm(r".*",json.dumps({"outcome":"REJECTED","basis":"pending allocation remains"}))
    out=c.resolve_challenge(iid)
    assert out["outcome"]=="REJECTED"
    assert c.get_credit(hx(direct_bob))==str(10**16)
    assert c.get_stats()["accounting_balanced"] is True

def test_acceptance_after_sla_exposure_begins_is_rejected(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=propose(direct_vm,c,direct_alice,direct_bob)
    direct_vm.warp("2026-09-19T12:00:00Z");direct_vm.sender=direct_bob
    with direct_vm.expect_revert("proposal is not open"):
        c.accept_agreement(aid)
    c.expire_proposal(aid)
    assert c.get_credit(hx(direct_alice))==str(10**18)
    assert c.get_stats()["accounting_balanced"] is True


def test_accepted_specification_is_immutable_through_incident(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob)
    before=c.get_agreement(aid);iid=open_verified(direct_vm,c,direct_bob,aid);after=c.get_agreement(aid)
    for key in ("service_name","service_url","metric_name","target_bps","window_start","window_end","max_credit_atto","exceptions","evidence_policy","source_policy","spec_hash"):
        assert after[key]==before[key]
    assert c.get_incident(iid)["measurement_case_hash"]


def test_provider_and_customer_must_be_distinct(direct_vm,direct_deploy,direct_alice):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**18;direct_vm.warp("2026-09-19T11:00:00Z")
    with direct_vm.expect_revert("distinct parties"):
        c.create_agreement(hx(direct_alice),"Payments API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"provider plus independent public evidence",SOURCE_POLICY,900)
    direct_vm.value=0
    assert c.get_stats()["accounting_balanced"] is True


def test_challenge_requires_exact_native_bond(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"upstream incident"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":[],"basis":"no causal overlap"}));c.adjudicate_exception(iid)
    direct_vm.sender=direct_bob;direct_vm.value=10**16+1
    with direct_vm.expect_revert("exact challenge bond"):
        c.challenge_exception(iid,"Counter record for the claimed window.","https://counter.example/evidence")
    direct_vm.value=0
    assert c.get_stats()["challenge_escrow"]=="0" and c.get_stats()["accounting_balanced"] is True


def test_challenge_source_unavailable_never_changes_pending_liability_or_breaks_accounting(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"no overlap"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":[],"basis":"exception not established"}));c.adjudicate_exception(iid)
    before=c.get_incident(iid);direct_vm.clear_mocks();direct_vm.sender=direct_bob;direct_vm.value=10**16;c.challenge_exception(iid,"The counter source might change this decision.","https://counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":""});out=c.resolve_challenge(iid);after=c.get_incident(iid)
    assert out["outcome"]=="SOURCE_UNAVAILABLE"
    assert after["exception_result"]==before["exception_result"] and after["liable_bps"]==before["liable_bps"]
    assert c.get_stats()["accounting_balanced"] is True
    direct_vm.warp("2026-09-20T13:16:00Z");c.expire_challenge(iid)
    assert c.get_stats()["accounting_balanced"] is True and c.get_stats()["challenge_escrow"]=="0"


def test_finalization_cannot_replay_settlement(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"upstream overlap"});direct_vm.mock_llm(r".*",json.dumps({"status":"PROVEN","facts":[],"basis":"causal exception established"}));c.adjudicate_exception(iid)
    direct_vm.warp("2026-09-19T13:16:00Z");first=c.finalize_incident(iid);stats=c.get_stats()
    with direct_vm.expect_revert("not finalizable"):
        c.finalize_incident(iid)
    assert c.get_stats()["withdrawn"]==stats["withdrawn"] and c.get_stats()["accounting_balanced"] is True
    assert first["payout_atto"]=="0"

def test_malformed_measurement_judgment_cannot_open_or_charge_incident(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);direct_vm.sender=direct_bob
    iid=c.open_incident(aid,9900,1789819200,1789822800,EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"public measurement sources"});direct_vm.mock_llm(r".*","{not valid json")
    with direct_vm.expect_revert("measurement result is not JSON"):
        c.verify_measurement(iid)
    assert c.get_incident(iid)["status"]=="MEASUREMENT_PENDING"
    assert c.get_stats()["accounting_balanced"] is True


def test_malformed_exception_judgment_cannot_create_favorable_result(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"public measurement and exception sources"});direct_vm.mock_llm(r".*",json.dumps({"status":"EXCUSED_ALL","facts":[],"basis":"invalid outcome"}))
    with direct_vm.expect_revert("invalid exception status"):
        c.adjudicate_exception(iid)
    assert c.get_incident(iid)["status"]=="EXCEPTION_CLAIMED"
    assert c.get_stats()["accounting_balanced"] is True


def test_malformed_challenge_response_preserves_pending_allocation_and_bond(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);aid=create(direct_vm,c,direct_alice,direct_bob);iid=open_verified(direct_vm,c,direct_bob,aid)
    direct_vm.sender=direct_alice;c.claim_exception(iid,"UPSTREAM",EXCEPTION_EVIDENCE)
    direct_vm.mock_web(r".*",{"status":200,"body":"exception timeline does not establish causality"});direct_vm.mock_llm(r".*",json.dumps({"status":"NOT_PROVEN","facts":[],"basis":"causation not established"}));c.adjudicate_exception(iid)
    before=c.get_incident(iid);direct_vm.clear_mocks();direct_vm.sender=direct_vm.sender;direct_vm.value=10**16;c.challenge_exception(iid,"New public counter-evidence disputes the pending exception allocation.","https://counter.example/evidence");direct_vm.value=0
    direct_vm.mock_web(r".*",{"status":200,"body":"complete frozen case record"});direct_vm.mock_llm(r".*","not json")
    with direct_vm.expect_revert("challenge result is not JSON"):
        c.resolve_challenge(iid)
    after=c.get_incident(iid)
    assert after["liable_bps"]==before["liable_bps"] and json.loads(after["challenge"])["status"]=="OPEN"
    assert c.get_stats()["challenge_escrow"]==str(10**16) and c.get_stats()["accounting_balanced"] is True

def test_independent_probe_cannot_use_a_sibling_service_domain(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**18;direct_vm.warp("2026-09-19T11:00:00Z")
    policy=json.loads(SOURCE_POLICY);policy["measurement"][0]["host"]="probe.api.example.com"
    with direct_vm.expect_revert("outside the service domain"):
        c.create_agreement(hx(direct_bob),"Payments API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"provider plus independent public evidence",json.dumps(policy),900)
    direct_vm.value=0
    assert c.get_stats()["accounting_balanced"] is True

def test_source_policy_rejects_raw_ip_and_local_origins(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**18;direct_vm.warp("2026-09-19T11:00:00Z")
    policy=json.loads(SOURCE_POLICY);policy["measurement"][1]["host"]="127.0.0.1"
    with direct_vm.expect_revert("host must be public DNS"):
        c.create_agreement(hx(direct_bob),"Payments API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"provider plus independent public evidence",json.dumps(policy),900)
    direct_vm.value=0
    assert c.get_stats()["accounting_balanced"] is True

def test_agreement_cannot_be_created_after_sla_window_has_started(direct_vm,direct_deploy,direct_alice,direct_bob):
    c=deploy(direct_deploy);direct_vm.sender=direct_alice;direct_vm.value=10**18;direct_vm.warp("2026-09-19T12:00:01Z")
    with direct_vm.expect_revert("ten minutes for bilateral formation"):
        c.create_agreement(hx(direct_bob),"Payments API","https://api.example.com","availability",9995,10**18,1789819200,1792411200,EXCEPTIONS,"provider plus independent public evidence",SOURCE_POLICY,900)
    direct_vm.value=0
    assert c.get_stats()["total_deposited"]=="0" and c.get_stats()["accounting_balanced"] is True
