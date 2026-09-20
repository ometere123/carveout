import os
import pytest

_original_unlink = os.unlink
_deferred = []

def _windows_safe_unlink(path, *args, **kwargs):
    try:
        return _original_unlink(path, *args, **kwargs)
    except PermissionError as exc:
        if getattr(exc, 'winerror', None) == 32:
            _deferred.append(path)
            return None
        raise

os.unlink = _windows_safe_unlink
result = pytest.main(['tests/direct/', '-v', '--tb=short'])
os.unlink = _original_unlink
for path in _deferred:
    try:
        _original_unlink(path)
    except (FileNotFoundError, PermissionError):
        pass
raise SystemExit(int(result))
