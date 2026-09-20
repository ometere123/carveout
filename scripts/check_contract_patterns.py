"""Cheap static guardrails that run even before GenVM tooling is installed.

This does not replace genvm-lint or Direct Mode. It catches accidental release
regressions in the contract's trust boundary.
"""

import ast
from pathlib import Path

CONTRACT = Path(__file__).resolve().parents[1] / "contracts" / "carveout.py"
source = CONTRACT.read_text(encoding="utf-8")
tree = ast.parse(source)

assert 'NETWORK_ID = "61999"' in source or 'NETWORK_ID="61999"' in source
assert 'https://studio.genlayer.com/api' in source
for forbidden in ("61997", "studio-dev.genlayer.com", "wallet_getSnaps", "WalletConnect", "Privy"):
    assert forbidden not in source, f"forbidden release token in contract: {forbidden}"

parents = {}
for node in ast.walk(tree):
    for child in ast.iter_child_nodes(node):
        parents[child] = node

def enclosing_function(node):
    while node in parents:
        node = parents[node]
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            return node
    return None

# Consensus closures must never read/write persistent `self` state directly.
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef) and node.name in ("leader_fn", "validator_fn"):
        for nested in ast.walk(node):
            if isinstance(nested, ast.Attribute) and isinstance(nested.value, ast.Name) and nested.value.id == "self":
                raise AssertionError(f"self.{nested.attr} used inside {node.name} at line {nested.lineno}")

# Direct LLM calls must be inside a leader closure. Web access may live in the
# pure `_fetch` helper, but `_fetch` itself may only be called from leader_fn.
for node in ast.walk(tree):
    if not isinstance(node, ast.Call):
        continue
    try:
        callee = ast.unparse(node.func)
    except Exception:
        callee = ""
    fn = enclosing_function(node)
    if callee == "gl.nondet.exec_prompt":
        assert fn and fn.name == "leader_fn", f"exec_prompt outside leader_fn at line {node.lineno}"
    if callee == "_fetch":
        assert fn and fn.name == "leader_fn", f"_fetch outside leader_fn at line {node.lineno}"

# No wall-clock shortcuts: protocol timing must come from consensus message time.
for forbidden in ("time.time(", "datetime.now(", "datetime.utcnow("):
    assert forbidden not in source, f"wall clock use forbidden: {forbidden}"

print("CARVEOUT_CONTRACT_PATTERN_CHECK=PASS")
