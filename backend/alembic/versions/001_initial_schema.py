"""Initial Enterprise Schema Setup for RevenueOS

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-04 19:22:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('mfa_enabled', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Merchants Table
    op.create_table(
        'merchants',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('currency', sa.String(), server_default='INR'),
        sa.Column('timezone', sa.String(), server_default='Asia/Kolkata'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Customers Table
    op.create_table(
        'customers',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('merchant_id', sa.String(), sa.ForeignKey('merchants.id')),
        sa.Column('external_customer_id', sa.String()),
        sa.Column('name', sa.String()),
        sa.Column('email', sa.String()),
        sa.Column('phone', sa.String()),
        sa.Column('segment', sa.String()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Transactions Table
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('merchant_id', sa.String(), sa.ForeignKey('merchants.id')),
        sa.Column('customer_id', sa.String(), sa.ForeignKey('customers.id')),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), server_default='INR'),
        sa.Column('payment_method', sa.String()),
        sa.Column('status', sa.String()),
        sa.Column('failure_code', sa.String()),
        sa.Column('failure_reason', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Cryptographic Audit Logs Table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('entity_type', sa.String()),
        sa.Column('entity_id', sa.String()),
        sa.Column('event_type', sa.String()),
        sa.Column('actor_type', sa.String()),
        sa.Column('actor_id', sa.String()),
        sa.Column('description', sa.String()),
        sa.Column('metadata_json', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('transactions')
    op.drop_table('customers')
    op.drop_table('merchants')
    op.drop_table('users')