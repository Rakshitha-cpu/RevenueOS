"""create core revenueos tables

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-31 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'recovery_events',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('order_id', sa.String(length=64), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(length=8), default='INR'),
        sa.Column('failure_reason', sa.String(length=64), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.Column('policy_verdict', sa.String(length=32), nullable=False),
        sa.Column('idempotency_key', sa.String(length=128), unique=True, nullable=False),
        sa.Column('status', sa.String(length=32), default='PENDING'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

def downgrade() -> None:
    op.drop_table('recovery_events')