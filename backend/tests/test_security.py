import pytest
from datetime import timedelta
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.core.security import SecurityManager

def test_jwt_token_generation_and_verification():
    token = SecurityManager.create_access_token(user_id="user_admin_01", role="admin")
    assert isinstance(token, str)
    assert len(token.split('.')) == 3

    payload = SecurityManager.verify_token(token)
    assert payload is not None
    assert payload["sub"] == "user_admin_01"
    assert payload["role"] == "admin"

def test_jwt_token_tampering():
    token = SecurityManager.create_access_token(user_id="user_01", role="operator")
    tampered_token = token[:-5] + "XXXXX"
    payload = SecurityManager.verify_token(tampered_token)
    assert payload is None

def test_jwt_token_expired():
    token = SecurityManager.create_access_token(
        user_id="user_02", 
        role="operator", 
        expires_delta=timedelta(seconds=-10)
    )
    payload = SecurityManager.verify_token(token)
    assert payload is None
