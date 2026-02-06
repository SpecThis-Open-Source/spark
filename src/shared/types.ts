export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ConversationMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export interface SendMessageRequest {
  conversationId: string;
  messages: ChatMessage[];
}

export interface StreamChunkEvent {
  type: 'text' | 'done' | 'error';
  text?: string;
  error?: string;
}

export interface ApiKeyStatus {
  isSet: boolean;
  isValid: boolean;
}
