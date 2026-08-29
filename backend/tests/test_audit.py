import pytest
from app.services.audit import AuditLogger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base

# Setup in-memory sqlite for testing
engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

@pytest.fixture
def db_session():
    db = SessionLocal()
    yield db
    db.close()

@pytest.fixture
def logger():
    return AuditLogger()

def test_log_event_in_memory(logger):
    """Test that logging an event stores it in memory when no DB is provided."""
    logger.in_memory_logs = []
    
    entry = logger.log_event("User", "U-123", "LOGIN", "System", "Test login")
    
    assert len(logger.in_memory_logs) == 1
    assert logger.in_memory_logs[0]["entity_id"] == "U-123"
    assert entry["event_type"] == "LOGIN"

def test_log_event_with_db(logger, db_session):
    """Test that logging persists to the database when a session is provided."""
    entry = logger.log_event(
        "Transaction", 
        "TXN-999", 
        "TEST_EVENT", 
        "System", 
        "Testing DB insert", 
        db=db_session
    )
    
    logs = logger.get_logs(db=db_session)
    
    assert len(logs) > 0
    # The most recent log should be our test event
    assert logs[0]["entity_id"] == "TXN-999"
    assert logs[0]["event_type"] == "TEST_EVENT"
