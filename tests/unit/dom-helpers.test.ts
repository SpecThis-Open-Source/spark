import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderMessage,
  renderMessageList,
  showTypingIndicator,
  removeTypingIndicator,
  setInputEnabled,
  updateEmptyState,
  appendStreamingText,
  finalizeStreamingMessage,
  showError,
  hideError,
} from '../../src/renderer/dom-helpers';
import { ChatMessage } from '../../src/shared/types';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="message-list"></div>
    <textarea id="message-input"></textarea>
    <button id="send-btn"></button>
    <div id="empty-state"></div>
    <div id="error-banner" class="hidden"></div>
  `;
});

describe('renderMessage', () => {
  it('creates a div with class "message message-{role}" and correct content', () => {
    const msg: ChatMessage = { role: 'user', content: 'Hello', timestamp: Date.now() };
    const div = renderMessage(msg);
    expect(div.className).toBe('message message-user');
    expect(div.textContent).toBe('Hello');
  });

  it('renders assistant role correctly', () => {
    const msg: ChatMessage = { role: 'assistant', content: 'Hi there', timestamp: Date.now() };
    const div = renderMessage(msg);
    expect(div.className).toBe('message message-assistant');
    expect(div.textContent).toBe('Hi there');
  });
});

describe('renderMessageList', () => {
  it('clears container and renders all messages', () => {
    const container = document.getElementById('message-list')!;
    container.innerHTML = '<div>old content</div>';
    const messages: ChatMessage[] = [
      { role: 'user', content: 'First', timestamp: 1 },
      { role: 'assistant', content: 'Second', timestamp: 2 },
    ];
    renderMessageList(container, messages);
    const children = container.querySelectorAll('.message');
    expect(children.length).toBe(2);
    expect(children[0].textContent).toBe('First');
    expect(children[1].textContent).toBe('Second');
  });
});

describe('showTypingIndicator', () => {
  it('adds typing indicator with 3 dots', () => {
    const container = document.getElementById('message-list')!;
    showTypingIndicator(container);
    const indicator = document.getElementById('typing-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator!.className).toBe('typing-indicator');
    const dots = indicator!.querySelectorAll('.typing-dot');
    expect(dots.length).toBe(3);
  });
});

describe('removeTypingIndicator', () => {
  it('removes the indicator', () => {
    const container = document.getElementById('message-list')!;
    showTypingIndicator(container);
    expect(document.getElementById('typing-indicator')).not.toBeNull();
    removeTypingIndicator();
    expect(document.getElementById('typing-indicator')).toBeNull();
  });
});

describe('setInputEnabled', () => {
  it('disables input and button when false', () => {
    setInputEnabled(false);
    const input = document.getElementById('message-input') as HTMLTextAreaElement;
    const btn = document.getElementById('send-btn') as HTMLButtonElement;
    expect(input.disabled).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it('enables input and button when true', () => {
    setInputEnabled(false);
    setInputEnabled(true);
    const input = document.getElementById('message-input') as HTMLTextAreaElement;
    const btn = document.getElementById('send-btn') as HTMLButtonElement;
    expect(input.disabled).toBe(false);
    expect(btn.disabled).toBe(false);
  });
});

describe('updateEmptyState', () => {
  it('shows empty state and hides message list when count is 0', () => {
    updateEmptyState(0);
    const emptyState = document.getElementById('empty-state')!;
    const messageList = document.getElementById('message-list')!;
    expect(emptyState.classList.contains('hidden')).toBe(false);
    expect(messageList.style.display).toBe('none');
  });

  it('hides empty state and shows message list when count > 0', () => {
    updateEmptyState(1);
    const emptyState = document.getElementById('empty-state')!;
    const messageList = document.getElementById('message-list')!;
    expect(emptyState.classList.contains('hidden')).toBe(true);
    expect(messageList.style.display).toBe('flex');
  });
});

describe('appendStreamingText', () => {
  it('creates streaming div on first call and appends on subsequent', () => {
    const container = document.getElementById('message-list')!;
    appendStreamingText(container, 'Hello');
    const streamDiv = document.getElementById('streaming-message');
    expect(streamDiv).not.toBeNull();
    expect(streamDiv!.textContent).toBe('Hello');
    expect(streamDiv!.className).toBe('message message-assistant');

    appendStreamingText(container, ' World');
    expect(streamDiv!.textContent).toBe('Hello World');
  });
});

describe('finalizeStreamingMessage', () => {
  it('removes the id from streaming div', () => {
    const container = document.getElementById('message-list')!;
    appendStreamingText(container, 'test');
    expect(document.getElementById('streaming-message')).not.toBeNull();
    finalizeStreamingMessage();
    expect(document.getElementById('streaming-message')).toBeNull();
    // The div still exists, just without the id
    const divs = container.querySelectorAll('.message-assistant');
    expect(divs.length).toBe(1);
  });
});

describe('showError', () => {
  it('shows error banner with message text and dismiss button', () => {
    showError('Something went wrong');
    const banner = document.getElementById('error-banner')!;
    expect(banner.classList.contains('hidden')).toBe(false);
    const span = banner.querySelector('span');
    expect(span!.textContent).toBe('Something went wrong');
    const dismissBtn = banner.querySelector('button.error-dismiss');
    expect(dismissBtn).not.toBeNull();
    expect(dismissBtn!.textContent).toBe('\u00d7');
  });
});

describe('hideError', () => {
  it('adds hidden class to banner', () => {
    const banner = document.getElementById('error-banner')!;
    banner.classList.remove('hidden');
    hideError();
    expect(banner.classList.contains('hidden')).toBe(true);
  });
});
