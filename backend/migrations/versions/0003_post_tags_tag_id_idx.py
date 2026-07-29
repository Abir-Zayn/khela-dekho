"""add reverse lookup index on post_tags(tag_id)

Revision ID: 0003_post_tags_tag_id_idx
Revises: 0002_posts_status_date_idx
Create Date: 2026-07-29

Related-post scoring needs fast "posts by tag" lookups. The composite PK
(post_id, tag_id) already covers "tags by post"; this index covers the reverse.
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "0003_post_tags_tag_id_idx"
down_revision = "0002_posts_status_date_idx"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_post_tags_tag_id", "post_tags", ["tag_id"])


def downgrade() -> None:
    op.drop_index("ix_post_tags_tag_id", table_name="post_tags")
