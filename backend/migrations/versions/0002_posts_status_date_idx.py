"""add composite index on posts(status, date_posted desc) for the feed query

Revision ID: 0002_posts_status_date_idx
Revises: 0001_add_draft_support
Create Date: 2026-07-28

GET /api/posts filters status = 'published' and orders by date_posted DESC.
The existing ix_posts_status index only covers the equality filter; this
composite index covers the filter + sort together so the feed stays O(limit)
as the table grows.
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "0002_posts_status_date_idx"
down_revision = "0001_add_draft_support"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX ix_posts_status_date_posted "
        "ON posts (status, date_posted DESC)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_posts_status_date_posted")
