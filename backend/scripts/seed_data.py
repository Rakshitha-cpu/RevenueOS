import os
import sys
import uuid
import random
from datetime import datetime, timedelta

# Add backend directory to path so we can import our models
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, Merchant, Customer, Transaction, Policy

# Default Docker postgres connection string
DATABASE_URL = "postgresql://revenueos:revenueos_password@localhost:5432/revenueos_db"

def seed_data():
    engine = create_engine(DATABASE_URL)
    
    print("Dropping and recreating database tables...")
    Base.metadata.drop_all(engine) 
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()

    print("1/4: Seeding Merchant...")
    merchant_id = str(uuid.uuid4())
    merchant = Merchant(
        id=merchant_id,
        name="Demo Merchant Inc.",
        currency="INR"
    )
    session.add(merchant)

    print("2/4: Seeding Policies...")
    policy = Policy(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        policy_name="Default Recovery Policy",
        max_retries=3,
        human_approval_required=True
    )
    session.add(policy)

    print("3/4: Seeding 2,000 Customers...")
    customers = []
    for i in range(2000):
        c = Customer(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            external_customer_id=f"CUST-{10000+i}",
            name=f"Customer {i}",
            email=f"customer{i}@example.com",
            segment=random.choice(["HIGH_VALUE", "REGULAR", "NEW", "CHURNING"])
        )
        customers.append(c)
    session.add_all(customers)
    session.commit()

    print("4/4: Seeding 10,000 Transactions (as per blueprint distribution)...")
    distribution = {
        "Payment failures": {"count": 3000, "failure_code": "CARD_DECLINED", "reason": "Insufficient funds or bank decline"},
        "Checkout abandonment": {"count": 2000, "failure_code": "ABANDONED", "reason": "User dropped off at checkout"},
        "Subscriptions": {"count": 2000, "failure_code": "RENEWAL_FAILED", "reason": "Auto-charge failed"},
        "Invoices": {"count": 1500, "failure_code": "OVERDUE", "reason": "Invoice past due date"},
        "Mandates": {"count": 1000, "failure_code": "MANDATE_REVOKED", "reason": "UPI Mandate cancelled by user"},
        "Other": {"count": 500, "failure_code": "SYSTEM_ERROR", "reason": "Timeout or gateway error"}
    }

    transactions = []
    for risk_type, data in distribution.items():
        for _ in range(data["count"]):
            cust = random.choice(customers)
            t = Transaction(
                id=str(uuid.uuid4()),
                merchant_id=merchant_id,
                customer_id=cust.id,
                amount=round(random.uniform(500, 15000), 2),
                payment_method=random.choice(["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING"]),
                status="FAILED",
                failure_code=data["failure_code"],
                failure_reason=data["reason"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            )
            transactions.append(t)

    session.add_all(transactions)
    session.commit()

    print(f"\n✅ Successfully seeded database with {len(customers)} customers and {len(transactions)} transactions.")

if __name__ == "__main__":
    seed_data()
