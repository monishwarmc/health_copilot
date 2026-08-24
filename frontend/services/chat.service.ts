import api from "@/lib/api";

import type {
  ChatConversation,
  ChatConversationDeleteResponse,
  ChatConversationDetail,
  ChatConversationListResponse,
  ChatConversationTitleUpdateRequest,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ExecuteChatActionRequest,
  ExecuteChatActionResponse,
} from "@/types/chat";

/**
 * Send a message to Health Copilot.
 */
export const sendChatMessage = async (
  request: ChatRequest,
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>(
    "/chat",
    request,
  );

  return response.data;
};

/**
 * Get all conversations for the authenticated user.
 */
export const getChatConversations =
  async (): Promise<ChatConversationListResponse> => {
    const response =
      await api.get<ChatConversationListResponse>(
        "/chat/conversations",
      );

    return response.data;
  };

/**
 * Get a complete conversation including messages.
 */
export const getChatConversation = async (
  conversationId: string,
): Promise<ChatConversationDetail> => {
  const response =
    await api.get<ChatConversationDetail>(
      `/chat/conversations/${conversationId}`,
    );

  return response.data;
};

/**
 * Get only messages for a conversation.
 */
export const getChatMessages = async (
  conversationId: string,
): Promise<ChatMessage[]> => {
  const response =
    await api.get<ChatMessage[]>(
      `/chat/conversations/${conversationId}/messages`,
    );

  return response.data;
};

/**
 * Rename a conversation.
 */
export const updateChatTitle = async (
  conversationId: string,
  request: ChatConversationTitleUpdateRequest,
): Promise<ChatConversation> => {
  const response =
    await api.patch<ChatConversation>(
      `/chat/conversations/${conversationId}`,
      request,
    );

  return response.data;
};

/**
 * Delete a conversation.
 */
export const deleteChatConversation = async (
  conversationId: string,
): Promise<ChatConversationDeleteResponse> => {
  const response =
    await api.delete<ChatConversationDeleteResponse>(
      `/chat/conversations/${conversationId}`,
    );

  return response.data;
};

/**
 * Execute an AI-proposed action after explicit user confirmation.
 */
export const executeChatAction = async (
  request: ExecuteChatActionRequest,
): Promise<ExecuteChatActionResponse> => {
  const response =
    await api.post<ExecuteChatActionResponse>(
      "/chat/actions",
      request,
    );

  return response.data;
};