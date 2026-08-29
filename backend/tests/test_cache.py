import pytest
import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.core.cache import CacheManager

@pytest.fixture
def cache():
    return CacheManager(default_ttl_seconds=2)

def test_cache_set_and_get(cache):
    cache.set("key1", "value1")
    assert cache.get("key1") == "value1"

def test_cache_expiration(cache):
    cache.set("short_key", "short_val", ttl_seconds=1)
    assert cache.get("short_key") == "short_val"
    time.sleep(1.1)
    assert cache.get("short_key") is None

def test_cache_delete_and_clear(cache):
    cache.set("k1", "v1")
    cache.set("k2", "v2")
    assert cache.delete("k1") is True
    assert cache.get("k1") is None
    assert cache.get("k2") == "v2"
    cache.clear()
    assert cache.get("k2") is None
