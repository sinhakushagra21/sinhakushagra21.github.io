import os
from collections import defaultdict
from time import time

_requests: dict[str, list[float]] = defaultdict(list)
# per-IP requests allowed per WINDOW. Overridable via env (RATE_LIMIT).
LIMIT = int(os.getenv("RATE_LIMIT", "40"))
WINDOW = 3600  # 1 hour


def check_rate_limit(ip: str) -> tuple[bool, int]:
    now = time()
    timestamps = [t for t in _requests[ip] if now - t < WINDOW]
    _requests[ip] = timestamps
    if len(timestamps) >= LIMIT:
        reset_in = int(_requests[ip][0] + WINDOW - now)
        return False, reset_in
    _requests[ip].append(now)
    return True, 0
