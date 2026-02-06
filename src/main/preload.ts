import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { SendMessageRequest, StreamChunkEvent, Conversation } from '../shared/types';

let streamChunkCallback: ((chunk: StreamChunkEvent) => void) | null = null;

ipcRenderer.on('chat:stream-chunk', (_event, chunk: StreamChunkEvent) => {
  streamChunkCallback?.(chunk);
});

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  sendMessage: async (
    request: SendMessageRequest,
    onChunk: (chunk: StreamChunkEvent) => void,
  ): Promise<void> => {
    streamChunkCallback = onChunk;
    try {
      const result = await ipcRenderer.invoke(IPC_CHANNELS.SEND_MESSAGE, request);
      if (result?.error) {
        onChunk({ type: 'error', error: result.error });
      }
    } finally {
      streamChunkCallback = null;
    }
  },

  stopGeneration: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.STOP_GENERATION);
  },

  listConversations: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATIONS_LIST);
  },

  loadConversation: (id: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATIONS_LOAD, id);
  },

  saveConversation: (conversation: Conversation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATIONS_SAVE, conversation);
  },

  deleteConversation: (id: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONVERSATIONS_DELETE, id);
  },

  getApiKeyStatus: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET_API_KEY_STATUS);
  },

  setApiKey: (key: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET_API_KEY, key);
  },
});
