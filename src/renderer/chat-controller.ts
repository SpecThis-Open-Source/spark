import { ChatMessage, Conversation, StreamChunkEvent } from '../shared/types';
import {
  renderMessageList,
  showTypingIndicator,
  removeTypingIndicator,
  setInputEnabled,
  updateEmptyState,
  appendStreamingText,
  finalizeStreamingMessage,
  showError,
} from './dom-helpers';

export class ChatController {
  private conversation: Conversation | null = null;
  private messageListEl: HTMLElement;
  private isGenerating = false;
  private onConversationUpdated: ((conv: Conversation) => void) | null = null;

  constructor(messageListEl: HTMLElement) {
    this.messageListEl = messageListEl;
  }

  setOnConversationUpdated(cb: (conv: Conversation) => void): void {
    this.onConversationUpdated = cb;
  }

  getConversation(): Conversation | null {
    return this.conversation;
  }

  isStreaming(): boolean {
    return this.isGenerating;
  }

  loadConversation(conversation: Conversation): void {
    this.conversation = conversation;
    renderMessageList(this.messageListEl, conversation.messages);
    updateEmptyState(conversation.messages.length);
    this.updateTitle();
  }

  newConversation(): Conversation {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.conversation = conv;
    renderMessageList(this.messageListEl, []);
    updateEmptyState(0);
    this.updateTitle();
    return conv;
  }

  async sendMessage(text: string): Promise<void> {
    if (!text.trim() || this.isGenerating) return;

    if (!this.conversation) {
      this.newConversation();
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    this.conversation!.messages.push(userMsg);
    this.conversation!.updatedAt = Date.now();

    if (this.conversation!.messages.length === 1) {
      this.conversation!.title = text.trim().slice(0, 50);
      this.updateTitle();
    }

    renderMessageList(this.messageListEl, this.conversation!.messages);
    updateEmptyState(this.conversation!.messages.length);
    this.isGenerating = true;
    setInputEnabled(false);
    showTypingIndicator(this.messageListEl);

    let assistantText = '';

    try {
      await window.electronAPI.sendMessage(
        {
          conversationId: this.conversation!.id,
          messages: this.conversation!.messages,
        },
        (chunk: StreamChunkEvent) => {
          this.handleStreamChunk(chunk, (text) => {
            assistantText += text;
          });
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      showError(msg);
    }

    this.finishGeneration(assistantText);
  }

  async stopGeneration(): Promise<void> {
    if (this.isGenerating) {
      await window.electronAPI.stopGeneration();
    }
  }

  private handleStreamChunk(chunk: StreamChunkEvent, onText: (text: string) => void): void {
    if (chunk.type === 'text' && chunk.text) {
      removeTypingIndicator();
      appendStreamingText(this.messageListEl, chunk.text);
      onText(chunk.text);
    } else if (chunk.type === 'error') {
      showError(chunk.error ?? 'An error occurred');
    }
  }

  private finishGeneration(assistantText: string): void {
    removeTypingIndicator();
    finalizeStreamingMessage();
    this.isGenerating = false;
    setInputEnabled(true);

    if (assistantText) {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
      };
      this.conversation!.messages.push(assistantMsg);
      this.conversation!.updatedAt = Date.now();
      this.saveConversation();
    }
  }

  private async saveConversation(): Promise<void> {
    if (!this.conversation) return;
    try {
      await window.electronAPI.saveConversation(this.conversation);
      this.onConversationUpdated?.(this.conversation);
    } catch {
      // Silent fail for save
    }
  }

  private updateTitle(): void {
    const titleEl = document.getElementById('chat-title');
    if (titleEl && this.conversation) {
      titleEl.textContent = this.conversation.title;
    }
  }
}
