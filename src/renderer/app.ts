import { ChatController } from './chat-controller';
import { SidebarController } from './sidebar-controller';
import { SettingsController } from './settings-controller';

function init(): void {
  const messageListEl = document.getElementById('message-list')!;
  const inputEl = document.getElementById('message-input') as HTMLTextAreaElement;
  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
  const newChatBtn = document.getElementById('new-chat-btn') as HTMLButtonElement;
  const conversationListEl = document.getElementById('conversation-list')!;

  const chat = new ChatController(messageListEl);
  const sidebar = new SidebarController(conversationListEl);
  const settings = new SettingsController();

  // Wire sidebar events
  sidebar.setOnSelect(async (id) => {
    const conv = await window.electronAPI.loadConversation(id);
    if (conv) {
      chat.loadConversation(conv);
      sidebar.setActiveId(conv.id);
    }
  });

  sidebar.setOnDelete(async (id) => {
    await window.electronAPI.deleteConversation(id);
    if (chat.getConversation()?.id === id) {
      startNewChat();
    }
    sidebar.refreshList();
  });

  sidebar.setOnNewChat(() => startNewChat());
  newChatBtn.addEventListener('click', () => startNewChat());

  // Wire chat events
  chat.setOnConversationUpdated(() => {
    sidebar.refreshList();
  });

  // Wire settings
  settings.setOnKeySaved(() => {
    // Key saved — could refresh status indicators
  });

  // Send message
  async function handleSend(): Promise<void> {
    const text = inputEl.value;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    await chat.sendMessage(text);
  }

  sendBtn.addEventListener('click', handleSend);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 150) + 'px';
  });

  function startNewChat(): void {
    const conv = chat.newConversation();
    sidebar.setActiveId(conv.id);
    sidebar.refreshList();
    inputEl.focus();
  }

  // Initial load
  sidebar.refreshList();
  startNewChat();
  checkApiKey();
}

async function checkApiKey(): Promise<void> {
  try {
    const status = await window.electronAPI.getApiKeyStatus();
    if (!status.isSet) {
      document.getElementById('settings-panel')!.classList.remove('hidden');
    }
  } catch {
    // Silent fail
  }
}

document.addEventListener('DOMContentLoaded', init);
