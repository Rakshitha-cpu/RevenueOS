import os
from typing import Dict, Any, Optional
from pydantic import Field
from dotenv import load_dotenv

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

load_dotenv()

class Settings(BaseSettings):
    """
    Centralized, Type-Safe Enterprise Configuration for RevenueOS.
    Single Source of Truth for all environments (Dev, Staging, Prod).
    """
    APP_NAME: str = "RevenueOS"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=False)
    
    # Database & Redis
    DATABASE_URL: str = Field(default="sqlite:///./revenueos.db")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # Security & API Secrets
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="live_secret_revenueos_wh_90428819")
    JWT_SECRET_KEY: str = Field(default="supersecretjwtkey_revenueos_prod_2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours
    
    # LLM Inference Keys
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None)
    GEMINI_API_KEY: Optional[str] = Field(default=None)
    
    # Deterministic Compliance & Policy Rules
    REVENUEOS_DEMO_MODE: bool = Field(default=False)
    MAX_DISCOUNT_PERCENT: float = 5.0
    LOYALTY_VOUCHER_CODE: str = "SAVE232"
    MAX_RISK_SCORE_CEILING: float = 85.0
    HIGH_VALUE_TRANSACTION_THRESHOLD: float = 25000.0
    TRAI_DND_START_HOUR: int = 21  # 9:00 PM IST
    TRAI_DND_END_HOUR: int = 8    # 8:00 AM IST
    MAX_CONTACT_RETRIES: int = 3
    RETRY_COOLDOWN_MINUTES: int = 5
    
    # Bank Gateway Failure Rates
    HDFC_FAIL_RATE: float = Field(default=0.85)
    SBI_FAIL_RATE: float = Field(default=0.45)
    ICICI_FAIL_RATE: float = Field(default=0.05)

    def __init__(self, **data):
        super().__init__(**data)
        # Override fields from OS environment if present
        for key in self.__annotations__:
            env_val = os.getenv(key)
            if env_val is not None:
                orig_type = self.__annotations__[key]
                if orig_type == bool:
                    setattr(self, key, env_val.lower() in ("true", "1", "yes"))
                elif orig_type == float:
                    setattr(self, key, float(env_val))
                elif orig_type == int:
                    setattr(self, key, int(env_val))
                else:
                    setattr(self, key, env_val)

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