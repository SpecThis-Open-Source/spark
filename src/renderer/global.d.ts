import type {
  ApiKeyStatus,
  Conversation,
  ConversationMeta,
  SendMessageRequest,
  StreamChunkEvent,
} from '../shared/types';

interface ElectronAPI {
  platform: string;
  sendMessage: (
    request: SendMessageRequest,
    onChunk: (chunk: StreamChunkEvent) => void,
  ) => Promise<void>;
  stopGeneration: () => Promise<void>;
  listConversations: () => Promise<ConversationMeta[]>;
  loadConversation: (id: string) => Promise<Conversation | null>;
  saveConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  getApiKeyStatus: () => Promise<ApiKeyStatus>;
  setApiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
