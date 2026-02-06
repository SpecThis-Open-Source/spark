import { ConversationMeta } from '../shared/types';

export class SidebarController {
  private listEl: HTMLElement;
  private activeId: string | null = null;
  private onSelect: ((id: string) => void) | null = null;
  private onDelete: ((id: string) => void) | null = null;
  private onNewChat: (() => void) | null = null;

  constructor(listEl: HTMLElement) {
    this.listEl = listEl;
  }

  setOnSelect(cb: (id: string) => void): void {
    this.onSelect = cb;
  }

  setOnDelete(cb: (id: string) => void): void {
    this.onDelete = cb;
  }

  setOnNewChat(cb: () => void): void {
    this.onNewChat = cb;
  }

  setActiveId(id: string | null): void {
    this.activeId = id;
    this.updateActiveHighlight();
  }

  async refreshList(): Promise<void> {
    try {
      const conversations = await window.electronAPI.listConversations();
      this.renderList(conversations);
    } catch {
      // Silent fail
    }
  }

  triggerNewChat(): void {
    this.onNewChat?.();
  }

  private renderList(conversations: ConversationMeta[]): void {
    this.listEl.innerHTML = '';
    for (const conv of conversations) {
      const li = document.createElement('li');
      li.className = 'conversation-item';
      if (conv.id === this.activeId) {
        li.classList.add('active');
      }
      li.dataset.id = conv.id;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'conversation-item-title';
      titleSpan.textContent = conv.title;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'conversation-item-delete';
      deleteBtn.textContent = '\u00d7';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onDelete?.(conv.id);
      });

      li.appendChild(titleSpan);
      li.appendChild(deleteBtn);
      li.addEventListener('click', () => this.onSelect?.(conv.id));

      this.listEl.appendChild(li);
    }
  }

  private updateActiveHighlight(): void {
    const items = this.listEl.querySelectorAll('.conversation-item');
    for (const item of items) {
      const el = item as HTMLElement;
      if (el.dataset.id === this.activeId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  }
}
