from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any
import os

# Enterprise Database Connection URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/revenueos"
)

# Standardize postgresql dialect
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# High-Concurrency Enterprise Connection Pool Strategy
is_sqlite = DATABASE_URL.startswith("sqlite")

engine_kwargs: Dict[str, Any] = {
    "echo": False,
}

if not is_sqlite:
    # Explicitly configured connection pooling for high-throughput fintech workload
    engine_kwargs.update({
        "pool_size": 20,            # High concurrent worker capacity
        "max_overflow": 10,         # Burst connection allocation
        "pool_timeout": 30,         # Maximum queue wait before timeout
        "pool_recycle": 1800,       # Recycle connections every 30m to prevent stale drops
        "pool_pre_ping": True       # Health check / ping connection before leasing
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency injection yielding managed database session with guaranteed closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_pool_status() -> Dict[str, Any]:
    """Monitors live database connection pool health and utilization."""
    if is_sqlite:
        return {"type": "sqlite", "status": "active"}
    
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in_connections": pool.checkedin(),
        "checked_out_connections": pool.checkedout(),
        "overflow_connections": pool.overflow(),
        "total_connections": pool.size() + pool.overflow(),
        "status": "HEALTHY"
    }
