import { test, expect } from '@playwright/test';
import { launchApp, closeApp, AppContext } from './helpers/electron-app';

let ctx: AppContext;

test.beforeEach(async () => {
  ctx = await launchApp();
});

test.afterEach(async () => {
  await closeApp(ctx);
});

test('app window is visible with correct title', async () => {
  const title = await ctx.page.title();
  expect(title).toBe('AI Client');

  const isVisible = await ctx.app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win?.isVisible();
  });
  expect(isVisible).toBe(true);
});

test('sidebar renders with new chat button', async () => {
  const sidebar = ctx.page.locator('#sidebar');
  await expect(sidebar).toBeVisible();

  const newChatBtn = ctx.page.locator('#new-chat-btn');
  await expect(newChatBtn).toBeVisible();
  await expect(newChatBtn).toHaveText('+ New Chat');
});

test('chat area renders with input', async () => {
  const chatArea = ctx.page.locator('#chat-area');
  await expect(chatArea).toBeVisible();

  const input = ctx.page.locator('#message-input');
  await expect(input).toBeVisible();

  const sendBtn = ctx.page.locator('#send-btn');
  await expect(sendBtn).toBeVisible();
});

test('settings button is present in header', async () => {
  const settingsBtn = ctx.page.locator('#settings-btn');
  await expect(settingsBtn).toBeVisible();
  await expect(settingsBtn).toHaveText('Settings');
});

test('empty state or message list is shown', async () => {
  // Either empty state is visible or message list exists
  const emptyState = ctx.page.locator('#empty-state');
  const messageList = ctx.page.locator('#message-list');
  const emptyVisible = await emptyState.isVisible();
  const listExists = await messageList.count();
  expect(emptyVisible || listExists > 0).toBe(true);
});
