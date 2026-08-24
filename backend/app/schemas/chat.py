from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# AI ACTION
# ============================================================

class AIAction(BaseModel):

    type: str

    requires_confirmation: bool = True

    payload: dict


# ============================================================
# AI RESPONSE
# ============================================================

class AIChatResponse(BaseModel):

    message: str

    action: AIAction | None = None


# ============================================================
# CHAT REQUEST
# ============================================================

class ChatRequest(BaseModel):

    conversation_id: UUID | None = None

    message: str = Field(
        min_length=1,
        max_length=10000,
    )


# ============================================================
# CHAT MESSAGE RESPONSE
# ============================================================

class ChatMessageResponse(BaseModel):

    id: UUID

    role: str

    content: str

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# ============================================================
# CHAT RESPONSE
# ============================================================

class ChatResponse(BaseModel):

    conversation_id: UUID

    message: ChatMessageResponse

    action: AIAction | None = None


# ============================================================
# CONVERSATION RESPONSE
# ============================================================

class ChatConversationResponse(BaseModel):

    id: UUID

    title: str

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ChatConversationDetailResponse(
    ChatConversationResponse
):

    messages: list[ChatMessageResponse]


class ChatConversationListResponse(BaseModel):

    items: list[ChatConversationResponse]

    total: int


# ============================================================
# UPDATE CONVERSATION TITLE
# ============================================================

class ChatConversationTitleUpdateRequest(BaseModel):

    title: str = Field(
        min_length=1,
        max_length=200,
    )


# ============================================================
# DELETE CONVERSATION RESPONSE
# ============================================================

class ChatConversationDeleteResponse(BaseModel):

    success: bool

    message: str


# ============================================================
# EXECUTE CHAT ACTION
# ============================================================

class ExecuteChatActionRequest(BaseModel):

    conversation_id: UUID

    action_type: str

    payload: dict


class ExecuteChatActionResponse(BaseModel):

    success: bool

    message: str

    data: dict | None = None