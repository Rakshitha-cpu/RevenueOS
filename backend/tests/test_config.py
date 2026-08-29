import pytest
from unittest.mock import patch
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.config import ConfigManager

def test_config_manager_singleton():
    """Verify singleton pattern works properly."""
    cfg1 = ConfigManager()
    cfg2 = ConfigManager()
    assert cfg1 is cfg2

def test_config_manager_get_secret():
    """Verify secret retrieval with fallback."""
    cfg = ConfigManager()
    with patch.dict(os.environ, {"TEST_KEY": "sample_secret"}):
        # Clear cache for this key
        if "TEST_KEY" in cfg._secrets_cache:
            del cfg._secrets_cache["TEST_KEY"]
        val = cfg.get_secret("TEST_KEY", default="fallback")
        assert val == "sample_secret"

def test_config_manager_fallback():
    """Verify default fallback if secret missing."""
    cfg = ConfigManager()
    if "NON_EXISTENT_KEY" in cfg._secrets_cache:
        del cfg._secrets_cache["NON_EXISTENT_KEY"]
    val = cfg.get_secret("NON_EXISTENT_KEY", default="default_fallback")
    assert val == "default_fallback"
