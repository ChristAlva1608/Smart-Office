"""add last_trained_at timestamp to user

Revision ID: 612370439e88
Revises: 594d0d4c2ce0
Create Date: 2025-06-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '612370439e88'
down_revision = '594d0d4c2ce0'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('user', sa.Column('last_trained_at', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('user', 'last_trained_at')
