import time
from typing import Dict, Any, Optional

class CacheManager:
    """
    High-performance caching layer for risk intelligence and bank downtime queries.
    Supports in-memory TTL caching with Redis fallback in production.
    """
    def __init__(self, default_ttl_seconds: int = 300):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value if not expired."""
        if key in self._cache:
            entry = self._cache[key]
            if time.time() < entry["expires_at"]:
                return entry["value"]
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Store value with TTL expiration."""
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }

    def delete(self, key: str) -> bool:
        """Invalidate cache entry."""
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    def clear(self) -> None:
        """Flush cache."""
        self._cache.clear()

cache_manager = CacheManager()
