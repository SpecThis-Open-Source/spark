import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SidebarController } from '../../src/renderer/sidebar-controller';

beforeEach(() => {
  document.body.innerHTML = `<ul id="conversation-list"></ul>`;
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    listConversations: vi.fn().mockResolvedValue([
      { id: '1', title: 'Chat 1', createdAt: 1000, updatedAt: 2000, messageCount: 3 },
      { id: '2', title: 'Chat 2', createdAt: 1000, updatedAt: 1500, messageCount: 1 },
    ]),
  };
});

describe('refreshList', () => {
  it('renders conversation items', async () => {
    const listEl = document.getElementById('conversation-list')!;
    const controller = new SidebarController(listEl);
    await controller.refreshList();
    const items = listEl.querySelectorAll('.conversation-item');
    expect(items.length).toBe(2);
    const titles = listEl.querySelectorAll('.conversation-item-title');
    expect(titles[0].textContent).toBe('Chat 1');
    expect(titles[1].textContent).toBe('Chat 2');
  });
});

describe('setActiveId', () => {
  it('adds "active" class to correct item', async () => {
    const listEl = document.getElementById('conversation-list')!;
    const controller = new SidebarController(listEl);
    await controller.refreshList();
    controller.setActiveId('2');
    const items = listEl.querySelectorAll('.conversation-item');
    expect((items[0] as HTMLElement).classList.contains('active')).toBe(false);
    expect((items[1] as HTMLElement).classList.contains('active')).toBe(true);
  });
});

describe('click handlers', () => {
  it('click on item calls onSelect callback with id', async () => {
    const listEl = document.getElementById('conversation-list')!;
    const controller = new SidebarController(listEl);
    const onSelect = vi.fn();
    controller.setOnSelect(onSelect);
    await controller.refreshList();
    const items = listEl.querySelectorAll('.conversation-item');
    (items[0] as HTMLElement).click();
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('delete button click calls onDelete callback with id', async () => {
    const listEl = document.getElementById('conversation-list')!;
    const controller = new SidebarController(listEl);
    const onDelete = vi.fn();
    controller.setOnDelete(onDelete);
    await controller.refreshList();
    const deleteBtn = listEl.querySelectorAll('.conversation-item-delete');
    (deleteBtn[0] as HTMLElement).click();
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});

describe('triggerNewChat', () => {
  it('calls onNewChat callback', () => {
    const listEl = document.getElementById('conversation-list')!;
    const controller = new SidebarController(listEl);
    const onNewChat = vi.fn();
    controller.setOnNewChat(onNewChat);
    controller.triggerNewChat();
    expect(onNewChat).toHaveBeenCalledTimes(1);
  });
});
