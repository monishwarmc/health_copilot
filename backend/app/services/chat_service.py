from uuid import UUID

from sqlalchemy.orm import Session

from app.core.logging import logger
from app.exceptions.weight import (
    ResourceNotFoundException,
)
from app.models.user import User
from app.rag.context import build_rag_context
from app.rag.llm import generate_response
from app.repositories.chat_repository import (
    chat_repository,
)
from app.schemas.chat import (
    AIAction,
    ChatConversationDeleteResponse,
    ChatConversationDetailResponse,
    ChatConversationListResponse,
    ChatConversationResponse,
    ChatConversationTitleUpdateRequest,
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
)
from app.services.chat_context_service import (
    chat_context_service,
)


# ============================================================
# CHAT TITLE GENERATION
# ============================================================

def generate_chat_title(
    message: str,
) -> str:
    """
    Generate a short human-readable title from
    the first user message.
    """

    title = message.strip()

    # --------------------------------------------------------
    # Empty message
    # --------------------------------------------------------

    if not title:

        return "New Chat"

    # --------------------------------------------------------
    # Normalize whitespace
    # --------------------------------------------------------

    title = " ".join(
        title.split()
    )

    # --------------------------------------------------------
    # Remove common conversational prefixes
    # --------------------------------------------------------

    prefixes = [
        "hey",
        "hi",
        "hello",
        "please",
        "can you",
        "could you",
        "i want to know",
        "i want to ask",
        "tell me",
    ]

    lowered = title.lower()

    for prefix in prefixes:

        if lowered.startswith(
            prefix + " "
        ):

            title = title[
                len(prefix):
            ].strip()

            break

    # --------------------------------------------------------
    # Capitalize first character
    # --------------------------------------------------------

    if title:

        title = (
            title[0].upper()
            + title[1:]
        )

    # --------------------------------------------------------
    # Limit title length
    # --------------------------------------------------------

    max_length = 60

    if len(title) > max_length:

        title = (
            title[:max_length]
            .rsplit(" ", 1)[0]
        )

        title += "..."

    return title


# ============================================================
# CHAT SERVICE
# ============================================================

class ChatService:

    # ========================================================
    # SEND MESSAGE
    # ========================================================

    def send_message(
        self,
        db: Session,
        current_user: User,
        request: ChatRequest,
    ) -> ChatResponse:

        # ====================================================
        # 1. GET OR CREATE CONVERSATION
        # ====================================================

        conversation = None
        is_new_conversation = False

        if request.conversation_id:

            conversation = (
                chat_repository.get_conversation(
                    db=db,
                    conversation_id=(
                        request.conversation_id
                    ),
                    user_id=current_user.id,
                )
            )

            if conversation is None:

                raise ResourceNotFoundException(
                    "conversation"
                )

        else:

            is_new_conversation = True

            conversation = (
                chat_repository.create_conversation(
                    db=db,
                    user_id=current_user.id,
                    title="New Chat",
                )
            )

        # ====================================================
        # 2. LOAD RECENT HISTORY
        # ====================================================

        MAX_HISTORY_MESSAGES = 5

        recent_messages = (
            chat_repository.get_recent_messages(
                db=db,
                conversation_id=conversation.id,
                limit=MAX_HISTORY_MESSAGES,
            )
        )

        history = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in recent_messages
        ]

        # ====================================================
        # 3. BUILD USER CONTEXT
        # ====================================================

        user_context = (
            chat_context_service.build_user_context(
                db=db,
                current_user=current_user,
            )
        )

        # ====================================================
        # 4. BUILD RAG CONTEXT
        # ====================================================

        knowledge_context = build_rag_context(
            query=request.message,
            n_results=1,
        )

        # ====================================================
        # 5. COMBINE CONTEXT
        # ====================================================

        context = f"""
================ USER DATA ================

{user_context}

================ HEALTH KNOWLEDGE ================

{knowledge_context}
""".strip()

        # ====================================================
        # 6. SYSTEM INSTRUCTION
        # ====================================================

        system_instruction = """
You are Health Copilot, an AI health and fitness assisting friend.

You are helping the currently authenticated user.

Use the supplied USER DATA to answer personalized questions.

Use the supplied HEALTH KNOWLEDGE when relevant.

Never invent user data.

Never invent database records.

Never invent UUIDs.

Never expose another user's information.

If information is missing or ambiguous, ask the user.

You can interact conversationally.

If you need information that is not present in the user's
database/context, ask the user for it instead of inventing it.

If the user wants to create, update, or delete Health Copilot
data, propose an action instead of executing it.

The AI does not directly modify the database.

The backend executes actions only after explicit user
confirmation.

Speak naturally and conversationally, like a helpful friend.

You may use appropriate emojis and symbols when they improve
the conversation, but do not overuse them.

Always follow the structured response model.
""".strip()

        # ====================================================
        # 7. CALL LLM
        # ====================================================

        ai_response = generate_response(
            question=request.message,
            history=history,
            system_instruction=system_instruction,
            context=context,
        )

        # ====================================================
        # 8. EXTRACT AI RESPONSE
        # ====================================================

        message_text = (
            ai_response.message
        )

        action = (
            AIAction.model_validate(
                ai_response.action
            )
            if ai_response.action
            else None
        )

        # ====================================================
        # 9. SAVE USER MESSAGE
        # ====================================================

        chat_repository.create_message(
            db=db,
            conversation_id=conversation.id,
            role="user",
            content=request.message,
        )

        # ====================================================
        # 10. GENERATE TITLE FOR NEW CONVERSATION
        # ====================================================

        if is_new_conversation:

            title = generate_chat_title(
                request.message
            )

            chat_repository.update_title(
                db=db,
                conversation=conversation,
                title=title,
            )

        # ====================================================
        # 11. SAVE ASSISTANT MESSAGE
        # ====================================================

        assistant_message = (
            chat_repository.create_message(
                db=db,
                conversation_id=conversation.id,
                role="assistant",
                content=message_text,
            )
        )

        # ====================================================
        # 12. UPDATE CONVERSATION TIMESTAMP
        # ====================================================

        chat_repository.touch_conversation(
            db=db,
            conversation=conversation,
        )

        # ====================================================
        # 13. LOG
        # ====================================================

        logger.info(
            "Chat message processed: %s",
            current_user.email,
        )

        # ====================================================
        # 14. RETURN
        # ====================================================

        return ChatResponse(
            conversation_id=conversation.id,
            message=(
                ChatMessageResponse.model_validate(
                    assistant_message
                )
            ),
            action=action,
        )

    # ========================================================
    # GET CONVERSATIONS
    # ========================================================

    def get_conversations(
        self,
        db: Session,
        current_user: User,
    ) -> ChatConversationListResponse:

        conversations = (
            chat_repository.get_conversations(
                db=db,
                user_id=current_user.id,
            )
        )

        return ChatConversationListResponse(
            items=[
                ChatConversationResponse.model_validate(
                    conversation
                )
                for conversation in conversations
            ],
            total=len(conversations),
        )

    # ========================================================
    # GET CONVERSATION
    # ========================================================

    def get_conversation(
        self,
        db: Session,
        current_user: User,
        conversation_id: UUID,
    ) -> ChatConversationDetailResponse:

        conversation = (
            chat_repository.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user.id,
            )
        )

        if conversation is None:

            raise ResourceNotFoundException(
                "conversation"
            )

        messages = (
            chat_repository.get_messages(
                db=db,
                conversation_id=conversation.id,
            )
        )

        return ChatConversationDetailResponse(
            id=conversation.id,
            title=conversation.title,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            messages=[
                ChatMessageResponse.model_validate(
                    message
                )
                for message in messages
            ],
        )

    # ========================================================
    # GET CONVERSATION MESSAGES
    # ========================================================

    def get_messages(
        self,
        db: Session,
        current_user: User,
        conversation_id: UUID,
    ) -> list[ChatMessageResponse]:

        conversation = (
            chat_repository.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user.id,
            )
        )

        if conversation is None:

            raise ResourceNotFoundException(
                "conversation"
            )

        messages = (
            chat_repository.get_messages(
                db=db,
                conversation_id=conversation.id,
            )
        )

        return [
            ChatMessageResponse.model_validate(
                message
            )
            for message in messages
        ]

    # ========================================================
    # UPDATE CONVERSATION TITLE
    # ========================================================

    def update_title(
        self,
        db: Session,
        current_user: User,
        conversation_id: UUID,
        request: ChatConversationTitleUpdateRequest,
    ) -> ChatConversationResponse:

        conversation = (
            chat_repository.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user.id,
            )
        )

        if conversation is None:

            raise ResourceNotFoundException(
                "conversation"
            )

        title = request.title.strip()

        if not title:

            raise ValueError(
                "Conversation title cannot be empty."
            )

        conversation = (
            chat_repository.update_title(
                db=db,
                conversation=conversation,
                title=title,
            )
        )

        logger.info(
            "Chat title updated: %s",
            current_user.email,
        )

        return ChatConversationResponse.model_validate(
            conversation
        )

    # ========================================================
    # DELETE CONVERSATION
    # ========================================================

    def delete_conversation(
        self,
        db: Session,
        current_user: User,
        conversation_id: UUID,
    ) -> ChatConversationDeleteResponse:

        conversation = (
            chat_repository.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user.id,
            )
        )

        if conversation is None:

            raise ResourceNotFoundException(
                "conversation"
            )

        chat_repository.delete_conversation(
            db=db,
            conversation=conversation,
        )

        logger.info(
            "Chat conversation deleted: %s",
            current_user.email,
        )

        return ChatConversationDeleteResponse(
            success=True,
            message=(
                "Conversation deleted successfully."
            ),
        )


# ============================================================
# SERVICE INSTANCE
# ============================================================

chat_service = ChatService()