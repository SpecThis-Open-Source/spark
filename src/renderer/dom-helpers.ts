import { ChatMessage } from '../shared/types';

export function renderMessage(message: ChatMessage): HTMLDivElement {
  const div = document.createElement('div');
  div.className = `message message-${message.role}`;
  div.textContent = message.content;
  return div;
}

export function renderMessageList(container: HTMLElement, messages: ChatMessage[]): void {
  container.innerHTML = '';
  for (const msg of messages) {
    container.appendChild(renderMessage(msg));
  }
  scrollToBottom(container);
}

export function scrollToBottom(container: HTMLElement): void {
  container.scrollTop = container.scrollHeight;
}

export function showTypingIndicator(container: HTMLElement): HTMLDivElement {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    indicator.appendChild(dot);
  }
  container.appendChild(indicator);
  scrollToBottom(container);
  return indicator;
}

export function removeTypingIndicator(): void {
  const indicator = document.getElementById('typing-indicator');
  indicator?.remove();
}

export function setInputEnabled(enabled: boolean): void {
  const input = document.getElementById('message-input') as HTMLTextAreaElement;
  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
  input.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

export function updateEmptyState(messageCount: number): void {
  const emptyState = document.getElementById('empty-state')!;
  const messageList = document.getElementById('message-list')!;
  if (messageCount === 0) {
    emptyState.classList.remove('hidden');
    messageList.style.display = 'none';
  } else {
    emptyState.classList.add('hidden');
    messageList.style.display = 'flex';
  }
}

export function appendStreamingText(container: HTMLElement, text: string): HTMLDivElement {
  let streamDiv = document.getElementById('streaming-message') as HTMLDivElement | null;
  if (!streamDiv) {
    streamDiv = document.createElement('div');
    streamDiv.className = 'message message-assistant';
    streamDiv.id = 'streaming-message';
    container.appendChild(streamDiv);
  }
  streamDiv.textContent += text;
  scrollToBottom(container);
  return streamDiv;
}

export function finalizeStreamingMessage(): void {
  const streamDiv = document.getElementById('streaming-message');
  if (streamDiv) {
    streamDiv.removeAttribute('id');
  }
}

export function showError(message: string): void {
  const banner = document.getElementById('error-banner')!;
  banner.innerHTML = '';
  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'error-dismiss';
  dismissBtn.textContent = '\u00d7';
  dismissBtn.addEventListener('click', () => banner.classList.add('hidden'));
  banner.appendChild(textSpan);
  banner.appendChild(dismissBtn);
  banner.classList.remove('hidden');
}

export function hideError(): void {
  const banner = document.getElementById('error-banner')!;
  banner.classList.add('hidden');
}
