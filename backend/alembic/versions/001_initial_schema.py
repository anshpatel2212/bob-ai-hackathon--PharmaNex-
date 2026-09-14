"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-14 23:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # 1. users table
    if 'users' not in existing_tables:
        op.create_table(
            'users',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('full_name', sa.String(length=150), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False, unique=True),
            sa.Column('organization', sa.String(length=200), nullable=True),
            sa.Column('role', sa.String(length=100), nullable=False, server_default='Pharmacovigilance'),
            sa.Column('password_hash', sa.String(length=255), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. adverse_events table
    if 'adverse_events' not in existing_tables:
        op.create_table(
            'adverse_events',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('is_demo', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('case_id', sa.String(length=100), nullable=False),
            sa.Column('patient_id', sa.String(length=100), nullable=True),
            sa.Column('product_name', sa.String(length=200), nullable=False),
            sa.Column('adverse_event', sa.String(length=255), nullable=False),
            sa.Column('event_date', sa.String(length=50), nullable=True),
            sa.Column('report_date', sa.String(length=50), nullable=True),
            sa.Column('seriousness', sa.String(length=50), nullable=False, server_default='Non-serious'),
            sa.Column('outcome', sa.String(length=100), nullable=True),
            sa.Column('patient_age', sa.Integer(), nullable=True),
            sa.Column('patient_sex', sa.String(length=20), nullable=True),
            sa.Column('country', sa.String(length=100), nullable=True),
            sa.Column('indication', sa.String(length=200), nullable=True),
            sa.Column('dose', sa.String(length=100), nullable=True),
            sa.Column('reporter_type', sa.String(length=100), nullable=True),
            sa.Column('meddra_term', sa.String(length=200), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_ae_user_id', 'adverse_events', ['user_id'])
        op.create_index('ix_ae_is_demo', 'adverse_events', ['is_demo'])
        op.create_index('ix_ae_case_id', 'adverse_events', ['case_id'])

    # 3. datasets table
    if 'datasets' not in existing_tables:
        op.create_table(
            'datasets',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('is_demo', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('filename', sa.String(length=255), nullable=False),
            sa.Column('file_type', sa.String(length=50), nullable=False, server_default='csv'),
            sa.Column('record_count', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('file_size', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_datasets_user_id', 'datasets', ['user_id'])

    # 4. documents table
    if 'documents' not in existing_tables:
        op.create_table(
            'documents',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('is_demo', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('filename', sa.String(length=255), nullable=False),
            sa.Column('file_size', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('module', sa.String(length=50), nullable=False, server_default='Module 1'),
            sa.Column('section_code', sa.String(length=50), nullable=True),
            sa.Column('status', sa.String(length=50), nullable=False, server_default='Uploaded'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_documents_user_id', 'documents', ['user_id'])

    # 5. signals table
    if 'signals' not in existing_tables:
        op.create_table(
            'signals',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('is_demo', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('drug_name', sa.String(length=200), nullable=False),
            sa.Column('adverse_event', sa.String(length=255), nullable=False),
            sa.Column('case_count', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('ror', sa.Float(), nullable=True),
            sa.Column('prr', sa.Float(), nullable=True),
            sa.Column('p_value', sa.Float(), nullable=True),
            sa.Column('signal_status', sa.String(length=50), nullable=False, server_default='Under Evaluation'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_signals_user_id', 'signals', ['user_id'])

    # 6. reports table
    if 'reports' not in existing_tables:
        op.create_table(
            'reports',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('is_demo', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('report_type', sa.String(length=100), nullable=False, server_default='Clinical Safety Evaluation'),
            sa.Column('status', sa.String(length=50), nullable=False, server_default='Draft'),
            sa.Column('summary', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_reports_user_id', 'reports', ['user_id'])


def downgrade() -> None:
    op.drop_table('reports')
    op.drop_table('signals')
    op.drop_table('documents')
    op.drop_table('datasets')
    op.drop_table('adverse_events')
    op.drop_table('users')
