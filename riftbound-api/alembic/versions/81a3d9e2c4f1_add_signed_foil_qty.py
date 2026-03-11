"""Add signed foil qty

Revision ID: 81a3d9e2c4f1
Revises: ab0b2be9329c
Create Date: 2026-03-11 01:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '81a3d9e2c4f1'
down_revision: Union[str, Sequence[str], None] = 'ab0b2be9329c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('collections', sa.Column('signed_foil_qty', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('collections', 'signed_foil_qty')
