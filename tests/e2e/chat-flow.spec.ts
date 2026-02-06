import { test, expect } from '@playwright/test';
import { launchApp, closeApp, AppContext } from './helpers/electron-app';
import { startMockApi, MockApiServer } from './helpers/mock-api';

let ctx: AppContext;
let mockApi: MockApiServer;

test.beforeEach(async () => {
  mockApi = await startMockApi();
  ctx = await launchApp({
    ANTHROPIC_API_KEY: 'sk-ant-test-key',
    ANTHROPIC_BASE_URL: mockApi.url,
  });
});

test.afterEach(async () => {
  await closeApp(ctx);
  await mockApi.close();
});

test('can type a message in the input', async () => {
  const input = ctx.page.locator('#message-input');
  await input.fill('Hello world');
  await expect(input).toHaveValue('Hello world');
});

test('send button exists and is clickable', async () => {
  const sendBtn = ctx.page.locator('#send-btn');
  await expect(sendBtn).toBeVisible();
  await expect(sendBtn).toBeEnabled();
});

test('typing in input and pressing Enter sends message', async () => {
  const input = ctx.page.locator('#message-input');
  await input.fill('Test message');
  await input.press('Enter');

  // User message should appear in message list
  const userMessage = ctx.page.locator('.message-user');
  await expect(userMessage.first()).toBeVisible({ timeout: 5000 });
  await expect(userMessage.first()).toContainText('Test message');
});

test('shift+enter does not send message', async () => {
  const input = ctx.page.locator('#message-input');
  await input.fill('Line 1');
  await input.press('Shift+Enter');

  // No user message should appear
  const userMessages = ctx.page.locator('.message-user');
  await expect(userMessages).toHaveCount(0);
});

test('empty state hides after sending a message', async () => {
  const input = ctx.page.locator('#message-input');
  await input.fill('Hello');
  await input.press('Enter');

  // Wait for user message to appear
  await expect(ctx.page.locator('.message-user').first()).toBeVisible({ timeout: 5000 });

  // Empty state should be hidden
  const emptyState = ctx.page.locator('#empty-state');
  await expect(emptyState).toBeHidden();
});
