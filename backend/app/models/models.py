from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

# --- FOUNDATION MODELS ---

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="active")
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Merchant(Base):
    __tablename__ = 'merchants'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    currency = Column(String, default="INR")
    timezone = Column(String, default="Asia/Kolkata")
    created_at = Column(DateTime, default=datetime.utcnow)

class Customer(Base):
    __tablename__ = 'customers'
    id = Column(String, primary_key=True)
    merchant_id = Column(String, ForeignKey('merchants.id'))
    external_customer_id = Column(String)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    segment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(String, primary_key=True)
    merchant_id = Column(String, ForeignKey('merchants.id'))
    customer_id = Column(String, ForeignKey('customers.id'))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_method = Column(String)
    status = Column(String)
    failure_code = Column(String)
    failure_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Policy(Base):
    __tablename__ = 'policies'
    id = Column(String, primary_key=True)
    merchant_id = Column(String, ForeignKey('merchants.id'))
    policy_name = Column(String)
    max_retries = Column(Integer, default=3)
    max_contacts = Column(Integer, default=2)
    high_value_threshold = Column(Float, default=50000.0)
    human_approval_required = Column(Boolean, default=True)
    fraud_block_enabled = Column(Boolean, default=True)
    enabled = Column(Boolean, default=True)

# --- REVENUE RISK & RECOVERY MODELS ---

class RevenueRisk(Base):
    __tablename__ = 'revenue_risks'
    id = Column(String, primary_key=True)
    transaction_id = Column(String, ForeignKey('transactions.id'))
    customer_id = Column(String, ForeignKey('customers.id'))
    risk_type = Column(String)
    risk_score = Column(Float)
    loss_probability = Column(Float)
    amount_at_risk = Column(Float)
    recoverability_score = Column(Float)
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

class RecoveryStrategy(Base):
    __tablename__ = 'recovery_strategies'
    id = Column(String, primary_key=True)
    risk_id = Column(String, ForeignKey('revenue_risks.id'))
    strategy_type = Column(String)
    success_probability = Column(Float)
    expected_recovery = Column(Float)
    friction_score = Column(Float)
    risk_score = Column(Float)
    estimated_cost = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class RecoveryWorkflow(Base):
    __tablename__ = 'recovery_workflows'
    id = Column(String, primary_key=True)
    risk_id = Column(String, ForeignKey('revenue_risks.id'))
    customer_id = Column(String, ForeignKey('customers.id'))
    strategy_id = Column(String, ForeignKey('recovery_strategies.id'))
    status = Column(String)
    current_step = Column(String)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    stop_reason = Column(String)

class AgentAction(Base):
    __tablename__ = 'agent_actions'
    id = Column(String, primary_key=True)
    workflow_id = Column(String, ForeignKey('recovery_workflows.id'))
    agent_name = Column(String)
    action_type = Column(String)
    action_payload = Column(JSON)
    authorization_status = Column(String)
    policy_status = Column(String)
    result = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- AUDIT & SECURITY MODELS ---

class AuthorizationLog(Base):
    __tablename__ = 'authorization_logs'
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=True)
    agent_name = Column(String, nullable=True)
    action = Column(String)
    resource = Column(String)
    decision = Column(String)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(String, primary_key=True)
    entity_type = Column(String)
    entity_id = Column(String)
    event_type = Column(String)
    actor_type = Column(String)
    actor_id = Column(String)
    description = Column(String)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
