import pytest
from app.models.models import User, Merchant, Customer, Transaction, Policy
from datetime import datetime

def test_user_creation():
    user = User(id="USR-1", name="Test User", email="test@test.com", password_hash="hash", role="admin")
    assert user.id == "USR-1"
    assert user.status == "active"
    assert user.mfa_enabled is False

def test_merchant_creation():
    merchant = Merchant(id="MERCH-1", name="Test Merch")
    assert merchant.currency == "INR"
    assert merchant.timezone == "Asia/Kolkata"

def test_transaction_model():
    txn = Transaction(id="TXN-1", amount=500.0, currency="USD")
    assert txn.currency == "USD"
    assert txn.amount == 500.0
