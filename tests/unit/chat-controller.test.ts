import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatController } from '../../src/renderer/chat-controller';
import { Conversation } from '../../src/shared/types';

const mockElectronAPI = {
  sendMessage: vi.fn().mockResolvedValue(undefined),
  stopGeneration: vi.fn().mockResolvedValue(undefined),
  listConversations: vi.fn().mockResolvedValue([]),
  loadConversation: vi.fn().mockResolvedValue(null),
  saveConversation: vi.fn().mockResolvedValue(undefined),
  deleteConversation: vi.fn().mockResolvedValue(undefined),
  getApiKeyStatus: vi.fn().mockResolvedValue({ isSet: true, isValid: true }),
  setApiKey: vi.fn().mockResolvedValue({ success: true }),
  platform: 'darwin',
};

beforeEach(() => {
  document.body.innerHTML = `
    <div id="message-list"></div>
    <textarea id="message-input"></textarea>
    <button id="send-btn"></button>
    <div id="empty-state"></div>
    <div id="error-banner" class="hidden"></div>
    <h2 id="chat-title"></h2>
  `;
  (window as any).electronAPI = mockElectronAPI;
  vi.clearAllMocks();

  // Mock crypto.randomUUID
  vi.stubGlobal('crypto', {
    randomUUID: vi.fn().mockReturnValue('test-uuid-1234'),
  });
});

describe('newConversation', () => {
  it('returns conversation with "New Chat" title and empty messages', () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    const conv = controller.newConversation();
    expect(conv.title).toBe('New Chat');
    expect(conv.messages).toEqual([]);
  });

  it('sets #chat-title to "New Chat"', () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    controller.newConversation();
    const titleEl = document.getElementById('chat-title')!;
    expect(titleEl.textContent).toBe('New Chat');
  });

  it('shows empty state', () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    controller.newConversation();
    const emptyState = document.getElementById('empty-state')!;
    expect(emptyState.classList.contains('hidden')).toBe(false);
  });
});

describe('sendMessage', () => {
  it('does nothing when text is empty', async () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    await controller.sendMessage('');
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
  });

  it('does nothing when text is whitespace only', async () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    await controller.sendMessage('   ');
    expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
  });

  it('adds user message to conversation', async () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    await controller.sendMessage('hello');
    const conv = controller.getConversation();
    expect(conv).not.toBeNull();
    expect(conv!.messages.length).toBe(1);
    expect(conv!.messages[0].role).toBe('user');
    expect(conv!.messages[0].content).toBe('hello');
  });

  it('calls window.electronAPI.sendMessage', async () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    await controller.sendMessage('hello');
    expect(mockElectronAPI.sendMessage).toHaveBeenCalledTimes(1);
  });
});

describe('getConversation', () => {
  it('returns null before any conversation', () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    expect(controller.getConversation()).toBeNull();
  });
});

describe('loadConversation', () => {
  it('renders messages and updates title', () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    const conv: Conversation = {
      id: 'conv-1',
      title: 'Test Chat',
      messages: [
        { role: 'user', content: 'Hi', timestamp: 1000 },
        { role: 'assistant', content: 'Hello!', timestamp: 2000 },
      ],
      createdAt: 1000,
      updatedAt: 2000,
    };
    controller.loadConversation(conv);
    const messages = messageListEl.querySelectorAll('.message');
    expect(messages.length).toBe(2);
    const titleEl = document.getElementById('chat-title')!;
    expect(titleEl.textContent).toBe('Test Chat');
  });
});

describe('isStreaming', () => {
  it('returns false initially', () => {
    const messageListEl = document.getElementById('message-list')!;
    const controller = new ChatController(messageListEl);
    expect(controller.isStreaming()).toBe(false);
  });
});
