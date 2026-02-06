import { test, expect } from '@playwright/test';
import { launchApp, closeApp, AppContext } from './helpers/electron-app';

let ctx: AppContext;

test.beforeEach(async () => {
  ctx = await launchApp();
});

test.afterEach(async () => {
  await closeApp(ctx);
});

test('new chat button creates a new conversation', async () => {
  // Wait for app to initialize (init sets title to 'New Chat')
  const title = ctx.page.locator('#chat-title');
  await expect(title).toHaveText('New Chat', { timeout: 5000 });

  // Click new chat again
  const newChatBtn = ctx.page.locator('#new-chat-btn');
  await newChatBtn.click();

  // Chat title should still be 'New Chat'
  await expect(title).toHaveText('New Chat');

  // Input should be focused/available
  const input = ctx.page.locator('#message-input');
  await expect(input).toBeVisible();
});

test('clicking new chat multiple times does not crash', async () => {
  const newChatBtn = ctx.page.locator('#new-chat-btn');
  await newChatBtn.click();
  await newChatBtn.click();
  await newChatBtn.click();

  // App should still be functional
  const input = ctx.page.locator('#message-input');
  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();
});

test('conversation list is present in sidebar', async () => {
  const list = ctx.page.locator('#conversation-list');
  await expect(list).toBeVisible();
});

test('sidebar and chat area coexist', async () => {
  const sidebar = ctx.page.locator('#sidebar');
  const chatArea = ctx.page.locator('#chat-area');
  await expect(sidebar).toBeVisible();
  await expect(chatArea).toBeVisible();
});
