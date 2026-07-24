"""add draft support: post status, updated_at, relaxed columns, coalesced search_vector

Revision ID: 0001_add_draft_support
Revises:
Create Date: 2026-07-24

Postgres-specific migration (the app runs on postgresql+asyncpg). It:
  - adds a `post_status` enum + `status` column, backfilling existing rows to
    'published' while defaulting new rows to 'draft';
  - adds `updated_at`;
  - relaxes `content` and `category_id` to NULL for in-progress drafts;
  - rebuilds the generated `search_vector` column so NULL draft content no longer
    breaks it (drafts are excluded from search at the query level anyway).
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "0001_add_draft_support"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- status enum + column -------------------------------------------------
    # Existing rows are live posts -> backfill 'published'; flip the go-forward
    # default to 'draft' so it matches the model's server_default.
    # Idempotent: the app's create_all may have already created this enum type.
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE post_status AS ENUM ('draft', 'published'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )
    op.execute(
        "ALTER TABLE posts ADD COLUMN status post_status NOT NULL DEFAULT 'published'"
    )
    op.execute("ALTER TABLE posts ALTER COLUMN status SET DEFAULT 'draft'")
    op.execute("CREATE INDEX ix_posts_status ON posts (status)")

    # --- updated_at -----------------------------------------------------------
    op.execute(
        "ALTER TABLE posts ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()"
    )

    # --- relax draft columns --------------------------------------------------
    op.execute("ALTER TABLE posts ALTER COLUMN content DROP NOT NULL")
    op.execute("ALTER TABLE posts ALTER COLUMN category_id DROP NOT NULL")

    # --- rebuild search_vector with coalesce ---------------------------------
    # A generated column's expression can't be altered in place; drop and re-add.
    # The GIN index depends on it, so it drops with the column and is recreated.
    op.execute("DROP INDEX IF EXISTS ix_post_search_vector")
    op.execute("ALTER TABLE posts DROP COLUMN search_vector")
    op.execute(
        "ALTER TABLE posts ADD COLUMN search_vector TSVECTOR "
        "GENERATED ALWAYS AS "
        "(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) "
        "STORED NOT NULL"
    )
    op.execute(
        "CREATE INDEX ix_post_search_vector ON posts USING gin (search_vector)"
    )


def downgrade() -> None:
    # Restore original search_vector expression.
    op.execute("DROP INDEX IF EXISTS ix_post_search_vector")
    op.execute("ALTER TABLE posts DROP COLUMN search_vector")
    op.execute(
        "ALTER TABLE posts ADD COLUMN search_vector TSVECTOR "
        "GENERATED ALWAYS AS "
        "(to_tsvector('english', title || ' ' || content)) "
        "STORED NOT NULL"
    )
    op.execute(
        "CREATE INDEX ix_post_search_vector ON posts USING gin (search_vector)"
    )

    # Re-tighten columns (may fail if draft rows with NULLs exist; clean first).
    op.execute("ALTER TABLE posts ALTER COLUMN category_id SET NOT NULL")
    op.execute("ALTER TABLE posts ALTER COLUMN content SET NOT NULL")

    op.execute("ALTER TABLE posts DROP COLUMN updated_at")

    op.execute("DROP INDEX IF EXISTS ix_posts_status")
    op.execute("ALTER TABLE posts DROP COLUMN status")
    op.execute("DROP TYPE post_status")
