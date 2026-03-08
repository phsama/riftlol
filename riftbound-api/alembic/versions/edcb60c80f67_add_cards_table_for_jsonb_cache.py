"""add_cards_table_for_jsonb_cache

Revision ID: edcb60c80f67
Revises: ab1df731b28a
Create Date: 2026-03-07 15:23:15.958275

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'edcb60c80f67'
down_revision: Union[str, Sequence[str], None] = 'ab1df731b28a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'cards',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('set_id', sa.String(), nullable=True),
        sa.Column('data', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cards_id'), 'cards', ['id'], unique=False)
    op.create_index(op.f('ix_cards_name'), 'cards', ['name'], unique=False)
    op.create_index(op.f('ix_cards_set_id'), 'cards', ['set_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_cards_set_id'), table_name='cards')
    op.drop_index(op.f('ix_cards_name'), table_name='cards')
    op.drop_index(op.f('ix_cards_id'), table_name='cards')
    op.drop_table('cards')
