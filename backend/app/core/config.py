import os
from typing import Dict, Any, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """
    Centralized, Type-Safe Enterprise Configuration for RevenueOS.
    Single Source of Truth for all environments (Dev, Staging, Prod).
    """
    APP_NAME: str = "RevenueOS"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Database & Redis
    DATABASE_URL: str = Field(default="sqlite:///./revenueos.db", env="DATABASE_URL")
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    
    # Security & API Secrets
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="live_secret_revenueos_wh_90428819", env="RAZORPAY_WEBHOOK_SECRET")
    JWT_SECRET_KEY: str = Field(default="supersecretjwtkey_revenueos_prod_2026", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours
    
    # LLM Inference Keys
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    GEMINI_API_KEY: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    
    # Deterministic Compliance & Policy Rules
    REVENUEOS_DEMO_MODE: bool = Field(default=False, env="REVENUEOS_DEMO_MODE")
    MAX_DISCOUNT_PERCENT: float = 5.0
    LOYALTY_VOUCHER_CODE: str = "SAVE232"
    MAX_RISK_SCORE_CEILING: float = 85.0
    HIGH_VALUE_TRANSACTION_THRESHOLD: float = 25000.0
    TRAI_DND_START_HOUR: int = 21  # 9:00 PM IST
    TRAI_DND_END_HOUR: int = 8    # 8:00 AM IST
    MAX_CONTACT_RETRIES: int = 3
    RETRY_COOLDOWN_MINUTES: int = 5
    
    # Bank Gateway Failure Rates
    HDFC_FAIL_RATE: float = Field(default=0.85, env="HDFC_FAIL_RATE")
    SBI_FAIL_RATE: float = Field(default=0.45, env="SBI_FAIL_RATE")
    ICICI_FAIL_RATE: float = Field(default=0.05, env="ICICI_FAIL_RATE")

    class Config:
        case_sensitive = True
        extra = "ignore"

settings = Settings()

class ConfigManager:
    """
    Enterprise Configuration Manager with Dynamic Threshold Resolution.
    """
    def __init__(self):
        self.settings = settings
        self._secrets_cache = {}

    def get_secret(self, secret_name: str, default: Optional[str] = None) -> str:
        """Retrieves an environment-aware secret securely."""
        return os.getenv(secret_name, default or getattr(self.settings, secret_name, ""))

    @staticmethod
    def get_initial_bank_downtimes() -> Dict[str, Dict[str, Any]]:
        return {
            "HDFC": {
                "status": "DOWNTIME" if settings.HDFC_FAIL_RATE > 0.5 else "OPERATIONAL",
                "failure_rate": settings.HDFC_FAIL_RATE,
                "alternative_rail": "UPI"
            },
            "SBI": {
                "status": "DEGRADED" if settings.SBI_FAIL_RATE > 0.3 else "OPERATIONAL",
                "failure_rate": settings.SBI_FAIL_RATE,
                "alternative_rail": "CARD"
            },
            "ICICI": {
                "status": "OPERATIONAL",
                "failure_rate": settings.ICICI_FAIL_RATE,
                "alternative_rail": "NETBANKING"
            }
        }

    @staticmethod
    def get_policy_thresholds() -> Dict[str, Any]:
        return {
            "max_risk_score": settings.MAX_RISK_SCORE_CEILING,
            "high_value_threshold": settings.HIGH_VALUE_TRANSACTION_THRESHOLD,
            "max_contact_retries": settings.MAX_CONTACT_RETRIES,
            "max_discount_percent": settings.MAX_DISCOUNT_PERCENT,
            "idempotency_ttl_minutes": 15
        }

config_manager = ConfigManager()