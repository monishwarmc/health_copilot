from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ChatConversationDeleteResponse,
    ChatConversationDetailResponse,
    ChatConversationListResponse,
    ChatConversationResponse,
    ChatConversationTitleUpdateRequest,
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ExecuteChatActionRequest,
    ExecuteChatActionResponse,
)
from app.services.chat_action_service import (
    chat_action_service,
)
from app.services.chat_service import (
    chat_service,
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


# ============================================================
# SEND MESSAGE
# ============================================================

@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def send_chat_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> ChatResponse:

    try:

        return chat_service.send_message(
            db=db,
            current_user=current_user,
            request=request,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


# ============================================================
# GET ALL CONVERSATIONS
# ============================================================

@router.get(
    "/conversations",
    response_model=ChatConversationListResponse,
    status_code=status.HTTP_200_OK,
)
def get_chat_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> ChatConversationListResponse:

    return chat_service.get_conversations(
        db=db,
        current_user=current_user,
    )


# ============================================================
# GET SINGLE CONVERSATION
# ============================================================

@router.get(
    "/conversations/{conversation_id}",
    response_model=ChatConversationDetailResponse,
    status_code=status.HTTP_200_OK,
)
def get_chat_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> ChatConversationDetailResponse:

    try:

        return chat_service.get_conversation(
            db=db,
            current_user=current_user,
            conversation_id=conversation_id,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


# ============================================================
# GET CONVERSATION MESSAGES
# ============================================================

@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[ChatMessageResponse],
    status_code=status.HTTP_200_OK,
)
def get_chat_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> list[ChatMessageResponse]:

    try:

        return chat_service.get_messages(
            db=db,
            current_user=current_user,
            conversation_id=conversation_id,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


# ============================================================
# UPDATE CONVERSATION TITLE
# ============================================================

@router.patch(
    "/conversations/{conversation_id}",
    response_model=ChatConversationResponse,
    status_code=status.HTTP_200_OK,
)
def update_chat_title(
    conversation_id: UUID,
    request: ChatConversationTitleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> ChatConversationResponse:

    try:

        return chat_service.update_title(
            db=db,
            current_user=current_user,
            conversation_id=conversation_id,
            request=request,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


# ============================================================
# DELETE CONVERSATION
# ============================================================

@router.delete(
    "/conversations/{conversation_id}",
    response_model=ChatConversationDeleteResponse,
    status_code=status.HTTP_200_OK,
)
def delete_chat_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> ChatConversationDeleteResponse:

    try:

        return chat_service.delete_conversation(
            db=db,
            current_user=current_user,
            conversation_id=conversation_id,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


# ============================================================
# EXECUTE CONFIRMED ACTION
# ============================================================

@router.post(
    "/actions",
    response_model=ExecuteChatActionResponse,
    status_code=status.HTTP_200_OK,
)
def execute_chat_action(
    request: ExecuteChatActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> ExecuteChatActionResponse:

    try:

        return chat_action_service.execute(
            db=db,
            user=current_user,
            request=request,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )