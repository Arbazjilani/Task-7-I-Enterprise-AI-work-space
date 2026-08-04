"""add is active to documents

Revision ID: a263348f84d4
Revises: 098e10b5434d
Create Date: 2026-07-15 11:50:53.175940

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a263348f84d4'
down_revision: Union[str, Sequence[str], None] = '098e10b5434d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "documents",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )

    op.alter_column(
        "documents",
        "is_active",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column(
        "documents",
        "is_active",
    )