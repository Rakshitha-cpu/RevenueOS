"""
Centralized Configuration Proxy.
Re-exports from app.core.config for backwards compatibility.
"""
from app.core.config import Settings, settings, ConfigManager, config_manager

__all__ = ["Settings", "settings", "ConfigManager", "config_manager"]
