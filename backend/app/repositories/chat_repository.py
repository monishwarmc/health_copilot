from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.chat import (
    ChatConversation,
    ChatMessage,
)


class ChatRepository:

    # ============================================================
    # CONVERSATIONS
    # ============================================================

    # ------------------------------------------------------------
    # CREATE CONVERSATION
    # ------------------------------------------------------------

    def create_conversation(
        self,
        db: Session,
        user_id: UUID,
        title: str = "New Chat",
    ) -> ChatConversation:

        conversation = ChatConversation(
            user_id=user_id,
            title=title,
        )

        db.add(conversation)

        db.commit()

        db.refresh(conversation)

        return conversation

    # ------------------------------------------------------------
    # GET SINGLE CONVERSATION
    # ------------------------------------------------------------

    def get_conversation(
        self,
        db: Session,
        conversation_id: UUID,
        user_id: UUID,
    ) -> ChatConversation | None:

        statement = (
            select(ChatConversation)
            .where(
                ChatConversation.id == conversation_id,
                ChatConversation.user_id == user_id,
            )
        )

        return db.scalar(statement)

    # ------------------------------------------------------------
    # GET ALL USER CONVERSATIONS
    # ------------------------------------------------------------

    def get_conversations(
        self,
        db: Session,
        user_id: UUID,
    ) -> list[ChatConversation]:

        statement = (
            select(ChatConversation)
            .where(
                ChatConversation.user_id == user_id,
            )
            .order_by(
                ChatConversation.updated_at.desc()
            )
        )

        conversations = list(
            db.scalars(statement)
        )

        for conversation in conversations:

            if not conversation.title:
                conversation.title = "New Chat"

        if conversations:
            db.commit()

            for conversation in conversations:
                db.refresh(conversation)

        return conversations

    # ------------------------------------------------------------
    # UPDATE CONVERSATION TITLE
    # ------------------------------------------------------------

    def update_title(
        self,
        db: Session,
        conversation: ChatConversation,
        title: str,
    ) -> ChatConversation:

        conversation.title = title
        conversation.updated_at = datetime.now(UTC)

        db.commit()

        db.refresh(conversation)

        return conversation

    # ------------------------------------------------------------
    # TOUCH CONVERSATION
    # ------------------------------------------------------------

    def touch_conversation(
        self,
        db: Session,
        conversation: ChatConversation,
    ) -> ChatConversation:

        conversation.updated_at = datetime.now(UTC)

        db.commit()

        db.refresh(conversation)

        return conversation

    # ------------------------------------------------------------
    # DELETE CONVERSATION
    # ------------------------------------------------------------

    def delete_conversation(
        self,
        db: Session,
        conversation: ChatConversation,
    ) -> None:

        db.delete(conversation)

        db.commit()

    # ============================================================
    # MESSAGES
    # ============================================================

    # ------------------------------------------------------------
    # CREATE MESSAGE
    # ------------------------------------------------------------

    def create_message(
        self,
        db: Session,
        conversation_id: UUID,
        role: str,
        content: str,
    ) -> ChatMessage:

        message = ChatMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        db.add(message)

        db.commit()

        db.refresh(message)

        return message

    # ------------------------------------------------------------
    # GET ALL MESSAGES
    # ------------------------------------------------------------

    def get_messages(
        self,
        db: Session,
        conversation_id: UUID,
    ) -> list[ChatMessage]:

        statement = (
            select(ChatMessage)
            .where(
                ChatMessage.conversation_id
                == conversation_id
            )
            .order_by(
                ChatMessage.created_at.asc()
            )
        )

        return list(
            db.scalars(statement)
        )

    # ------------------------------------------------------------
    # GET RECENT MESSAGES
    # ------------------------------------------------------------

    def get_recent_messages(
        self,
        db: Session,
        conversation_id: UUID,
        limit: int = 10,
    ) -> list[ChatMessage]:

        statement = (
            select(ChatMessage)
            .where(
                ChatMessage.conversation_id
                == conversation_id
            )
            .order_by(
                ChatMessage.created_at.desc()
            )
            .limit(limit)
        )

        messages = list(
            db.scalars(statement)
        )

        # Database returns newest -> oldest.
        # LLM requires oldest -> newest.
        messages.reverse()

        return messages


chat_repository = ChatRepository()