export const IPC_CHANNELS = {
  SEND_MESSAGE: 'chat:send-message',
  STOP_GENERATION: 'chat:stop-generation',
  CONVERSATIONS_LIST: 'conversations:list',
  CONVERSATIONS_LOAD: 'conversations:load',
  CONVERSATIONS_SAVE: 'conversations:save',
  CONVERSATIONS_DELETE: 'conversations:delete',
  CONFIG_GET_API_KEY_STATUS: 'config:get-api-key-status',
  CONFIG_SET_API_KEY: 'config:set-api-key',
} as const;

export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
export const DEFAULT_MAX_TOKENS = 4096;
export const APP_NAME = 'AI Client';
export const CHATS_DIR_NAME = 'chats';
export const CONFIG_FILE_NAME = 'config.json';
