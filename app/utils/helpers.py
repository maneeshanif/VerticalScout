from datetime import datetime, timezone


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def safe_get(d: dict, *keys, default=None):
    """Safely get a nested key from a dict."""
    for key in keys:
        if not isinstance(d, dict):
            return default
        d = d.get(key, default)
    return d
