import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import { ClaudeClient } from './services/claude-client';
import { StorageService } from './services/storage';
import { SendMessageRequest, StreamChunkEvent, Conversation } from '../shared/types';
import { hasApiKey, setApiKey, getModel, getBaseUrl } from './services/config';
import * as log from './services/logger';

const TAG = 'ipc';

interface Services {
  claudeClient: ClaudeClient | null;
  storage: StorageService;
}

export function registerIpcHandlers(services: Services): void {
  const { storage } = services;

  ipcMain.handle(IPC_CHANNELS.SEND_MESSAGE, async (event, request: SendMessageRequest) => {
    if (!services.claudeClient) {
      log.warn(TAG, 'Send message called without configured API key');
      return { error: 'API key not configured' };
    }

    const window = BrowserWindow.fromWebContents(event.sender);
    log.debug(TAG, `Sending message (${request.messages.length} messages in context)`);
    const generator = services.claudeClient.sendMessage(request.messages);

    for await (const chunk of generator) {
      sendStreamChunk(window, chunk);
    }

    return { error: null };
  });

  ipcMain.handle(IPC_CHANNELS.STOP_GENERATION, async () => {
    log.debug(TAG, 'Stop generation requested');
    services.claudeClient?.stopGeneration();
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATIONS_LIST, async () => {
    return storage.listConversations();
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATIONS_LOAD, async (_event, id: string) => {
    return storage.loadConversation(id);
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATIONS_SAVE, async (_event, conversation: Conversation) => {
    return storage.saveConversation(conversation);
  });

  ipcMain.handle(IPC_CHANNELS.CONVERSATIONS_DELETE, async (_event, id: string) => {
    return storage.deleteConversation(id);
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_GET_API_KEY_STATUS, async () => {
    const isSet = hasApiKey();
    log.debug(TAG, `API key status check: isSet=${isSet}`);
    return { isSet, isValid: isSet };
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET_API_KEY, async (_event, key: string) => {
    log.info(TAG, 'CONFIG_SET_API_KEY received');
    const result = setApiKey(key);
    if (result.success) {
      services.claudeClient = new ClaudeClient(key, getModel(), getBaseUrl());
      log.info(TAG, 'ClaudeClient re-created');
    } else {
      log.warn(TAG, `setApiKey failed: ${result.error}`);
    }
    return result;
  });
}

function sendStreamChunk(window: BrowserWindow | null, chunk: StreamChunkEvent): void {
  window?.webContents.send('chat:stream-chunk', chunk);
}
