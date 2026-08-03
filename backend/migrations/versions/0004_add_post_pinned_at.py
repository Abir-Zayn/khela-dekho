"""add pinned_at to posts for pin/unpin on an author profile

Revision ID: 0004_add_post_pinned_at
Revises: 0003_post_tags_tag_id_idx
Create Date: 2026-07-30

NULL pinned_at = not pinned; a timestamp doubles as the pin ordering key.
The partial index only covers pinned rows (a tiny slice of the table) and serves
both the per-author cap count and the "pinned first" profile feed sort.
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0004_add_post_pinned_at"
down_revision = "0003_post_tags_tag_id_idx"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "posts",
        sa.Column("pinned_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        "CREATE INDEX ix_posts_user_pinned_at "
        "ON posts (user_id, pinned_at DESC) "
        "WHERE pinned_at IS NOT NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_posts_user_pinned_at")
    op.drop_column("posts", "pinned_at")
