export interface ChatRequest {
  conversation_id: string | null;
  message: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatAction {
  type: string;
  requires_confirmation: boolean;
  payload: Record<string, unknown>;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
  action: ChatAction | null;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationListResponse {
  items: ChatConversation[];
  total: number;
}

export interface ChatConversationDetail extends ChatConversation {
  messages: ChatMessage[];
}

export interface ChatConversationTitleUpdateRequest {
  title: string;
}

export interface ChatConversationDeleteResponse {
  success: boolean;
  message: string;
}

export interface ExecuteChatActionRequest {
  conversation_id: string;
  action_type: string;
  payload: Record<string, unknown>;
}

export interface ExecuteChatActionResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown> | null;
}