from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import hmac
import hashlib
import json
import base64

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "revenueos_enterprise_jwt_secret_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class SecurityManager:
    """
    Enterprise Authentication & Role-Based Access Control (RBAC).
    Handles secure token generation, verification, and role authorization.
    """

    @staticmethod
    def _base64url_encode(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

    @staticmethod
    def _base64url_decode(data: str) -> bytes:
        padding = '=' * (4 - len(data) % 4)
        return base64.urlsafe_b64decode(data + padding)

    @classmethod
    def create_access_token(cls, user_id: str, role: str = "operator", expires_delta: Optional[timedelta] = None) -> str:
        """Generates a secure signed JWT token."""
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        header = {"alg": ALGORITHM, "typ": "JWT"}
        payload = {
            "sub": user_id,
            "role": role,
            "exp": int(expire.timestamp()),
            "iat": int(datetime.utcnow().timestamp())
        }

        encoded_header = cls._base64url_encode(json.dumps(header).encode('utf-8'))
        encoded_payload = cls._base64url_encode(json.dumps(payload).encode('utf-8'))
        signature_base = f"{encoded_header}.{encoded_payload}".encode('utf-8')

        signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
        encoded_signature = cls._base64url_encode(signature)

        return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

    @classmethod
    def verify_token(cls, token: str) -> Optional[Dict[str, Any]]:
        """Verifies JWT signature and expiry, returning the decoded payload."""
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None

            encoded_header, encoded_payload, encoded_signature = parts
            signature_base = f"{encoded_header}.{encoded_payload}".encode('utf-8')

            expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
            actual_sig = cls._base64url_decode(encoded_signature)

            if not hmac.compare_digest(expected_sig, actual_sig):
                return None

            payload_data = json.loads(cls._base64url_decode(encoded_payload).decode('utf-8'))
            if datetime.utcnow().timestamp() > payload_data.get("exp", 0):
                return None  # Expired

            return payload_data
        except Exception:
            return None

security_manager = SecurityManager()
