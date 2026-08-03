"""add reaction timestamp for public reactor lists

Revision ID: 0005_add_reactions_reacted_at
Revises: 0004_add_post_pinned_at
Create Date: 2026-08-02

The server default backfills existing reactions and timestamps new rows. The
composite index keeps a post's newest-first reactor list efficient as it grows.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0005_add_reactions_reacted_at"
down_revision = "0004_add_post_pinned_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "reactions",
        sa.Column(
            "reacted_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.execute(
        "CREATE INDEX ix_reactions_post_reacted_at "
        "ON reactions (post_id, reacted_at DESC)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_reactions_post_reacted_at")
    op.drop_column("reactions", "reacted_at")
