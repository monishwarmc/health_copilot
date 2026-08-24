"""add chat conversations and messages

Revision ID: 0f096fa6670a
Revises: 2daef35e71aa
Create Date: 2026-08-19 19:34:58.318349

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0f096fa6670a"
down_revision: Union[str, Sequence[str], None] = "2daef35e71aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ============================================================
    # nutrition_logs changes
    # ============================================================

    op.alter_column(
        "nutrition_logs",
        "quantity",
        existing_type=sa.DOUBLE_PRECISION(precision=53),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=False,
    )

    op.alter_column(
        "nutrition_logs",
        "unit",
        existing_type=sa.VARCHAR(length=50),
        type_=sa.String(length=20),
        existing_nullable=False,
    )

    op.alter_column(
        "nutrition_logs",
        "calories",
        existing_type=sa.DOUBLE_PRECISION(precision=53),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "protein_g",
        existing_type=sa.DOUBLE_PRECISION(precision=53),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "carbs_g",
        existing_type=sa.DOUBLE_PRECISION(precision=53),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "fat_g",
        existing_type=sa.DOUBLE_PRECISION(precision=53),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "fiber_g",
        existing_type=sa.DOUBLE_PRECISION(precision=53),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "source",
        existing_type=sa.VARCHAR(length=50),
        type_=sa.String(length=100),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "source_food_id",
        existing_type=sa.VARCHAR(length=100),
        type_=sa.String(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        server_default=None,
        existing_nullable=False,
    )

    # ============================================================
    # chat_conversations
    # ============================================================

    op.create_table(
        "chat_conversations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
            server_default="New Chat",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_chat_conversations_user_id",
        "chat_conversations",
        ["user_id"],
        unique=False,
    )

    # ============================================================
    # chat_messages
    # ============================================================

    op.create_table(
        "chat_messages",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "conversation_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "content",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["chat_conversations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_chat_messages_conversation_id",
        "chat_messages",
        ["conversation_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # ============================================================
    # chat_messages
    # ============================================================

    op.drop_index(
        "ix_chat_messages_conversation_id",
        table_name="chat_messages",
    )

    op.drop_table("chat_messages")

    # ============================================================
    # chat_conversations
    # ============================================================

    op.drop_index(
        "ix_chat_conversations_user_id",
        table_name="chat_conversations",
    )

    op.drop_table("chat_conversations")

    # ============================================================
    # nutrition_logs changes - reverse
    # ============================================================

    op.alter_column(
        "nutrition_logs",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        server_default=sa.text("CURRENT_TIMESTAMP"),
        existing_nullable=False,
    )

    op.alter_column(
        "nutrition_logs",
        "source_food_id",
        existing_type=sa.String(length=255),
        type_=sa.VARCHAR(length=100),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "source",
        existing_type=sa.String(length=100),
        type_=sa.VARCHAR(length=50),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "fiber_g",
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.DOUBLE_PRECISION(precision=53),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "fat_g",
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.DOUBLE_PRECISION(precision=53),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "carbs_g",
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.DOUBLE_PRECISION(precision=53),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "protein_g",
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.DOUBLE_PRECISION(precision=53),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "calories",
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.DOUBLE_PRECISION(precision=53),
        existing_nullable=True,
    )

    op.alter_column(
        "nutrition_logs",
        "unit",
        existing_type=sa.String(length=20),
        type_=sa.VARCHAR(length=50),
        existing_nullable=False,
    )

    op.alter_column(
        "nutrition_logs",
        "quantity",
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.DOUBLE_PRECISION(precision=53),
        existing_nullable=False,
    )