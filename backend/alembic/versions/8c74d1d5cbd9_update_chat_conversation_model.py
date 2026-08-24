"""update chat conversation model

Revision ID: 8c74d1d5cbd9
Revises: 0f096fa6670a
Create Date: 2026-08-24 21:29:41.275060

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "8c74d1d5cbd9"
down_revision: Union[str, Sequence[str], None] = "0f096fa6670a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ============================================================
    # CHAT CONVERSATIONS
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
    # CHAT MESSAGES
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

    op.drop_index(
        "ix_chat_messages_conversation_id",
        table_name="chat_messages",
    )

    op.drop_table("chat_messages")

    op.drop_index(
        "ix_chat_conversations_user_id",
        table_name="chat_conversations",
    )

    op.drop_table("chat_conversations")