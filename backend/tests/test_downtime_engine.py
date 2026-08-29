import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.downtime_engine import BankDowntimeEngine

@pytest.fixture
def downtime_engine():
    return BankDowntimeEngine()

def test_record_and_check_downtime(downtime_engine):
    downtime_engine.record_downtime("SBI", "cards", "HIGH")
    assert downtime_engine.is_bank_down("SBI") is True
    assert downtime_engine.is_bank_down("KOTAK") is False

def test_resolve_downtime(downtime_engine):
    downtime_engine.record_downtime("ICICI", "upi")
    assert downtime_engine.is_bank_down("ICICI") is True
    resolved = downtime_engine.resolve_downtime("ICICI")
    assert resolved is True
    assert downtime_engine.is_bank_down("ICICI") is False

def test_get_rerouted_strategy_when_down(downtime_engine):
    downtime_engine.record_downtime("AXIS", "netbanking")
    strategy = downtime_engine.get_rerouted_strategy("AXIS", "netbanking")
    assert strategy["reroute_needed"] is True
    assert strategy["recommended_rail"] == "UPI_INTENT"
    assert "AXIS" in strategy["affected_bank"]

def test_get_rerouted_strategy_when_normal(downtime_engine):
    strategy = downtime_engine.get_rerouted_strategy("YESBANK", "cards")
    assert strategy["reroute_needed"] is False
    assert strategy["recommended_rail"] == "cards"
