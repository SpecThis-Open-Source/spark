import { test, expect } from '@playwright/test';
import { launchApp, closeApp, AppContext } from './helpers/electron-app';

let ctx: AppContext;

test.afterEach(async () => {
  if (ctx) {
    await closeApp(ctx);
  }
});

test('settings button opens settings panel', async () => {
  ctx = await launchApp({ ANTHROPIC_API_KEY: 'sk-ant-test-key' });

  const settingsBtn = ctx.page.locator('#settings-btn');
  await settingsBtn.click();

  const settingsPanel = ctx.page.locator('#settings-panel');
  await expect(settingsPanel).toBeVisible();
});

test('settings panel can be closed with cancel', async () => {
  ctx = await launchApp({ ANTHROPIC_API_KEY: 'sk-ant-test-key' });

  const settingsBtn = ctx.page.locator('#settings-btn');
  await settingsBtn.click();

  const settingsPanel = ctx.page.locator('#settings-panel');
  await expect(settingsPanel).toBeVisible();

  const closeBtn = ctx.page.locator('#close-settings-btn');
  await closeBtn.click();
  await expect(settingsPanel).toBeHidden();
});

test('settings panel shows status text when opened', async () => {
  ctx = await launchApp({ ANTHROPIC_API_KEY: 'sk-ant-test-key' });

  const settingsBtn = ctx.page.locator('#settings-btn');
  await settingsBtn.click();

  // Status element should appear and have some text (configured or status message)
  const statusEl = ctx.page.locator('#api-key-status');
  await expect(statusEl).toBeVisible();
  await expect(statusEl).not.toHaveText('', { timeout: 5000 });
});

test('empty save shows validation message', async () => {
  ctx = await launchApp({ ANTHROPIC_API_KEY: 'sk-ant-test-key' });

  const settingsBtn = ctx.page.locator('#settings-btn');
  await settingsBtn.click();

  const saveBtn = ctx.page.locator('#save-key-btn');
  await saveBtn.click();

  const status = ctx.page.locator('#api-key-status');
  await expect(status).toContainText('Please enter an API key', { timeout: 5000 });
});

test('sending message without api key shows error banner', async () => {
  ctx = await launchApp({ ANTHROPIC_API_KEY: '' });

  const input = ctx.page.locator('#message-input');
  await input.fill('Hello');
  await input.press('Enter');

  // Error banner should appear with an error message
  const errorBanner = ctx.page.locator('#error-banner');
  await expect(errorBanner).toBeVisible({ timeout: 10000 });
  // Banner should contain some error text (not empty)
  await expect(errorBanner.locator('span')).not.toHaveText('');
});

test('error banner can be dismissed', async () => {
  ctx = await launchApp({ ANTHROPIC_API_KEY: '' });

  const input = ctx.page.locator('#message-input');
  await input.fill('Hello');
  await input.press('Enter');

  const errorBanner = ctx.page.locator('#error-banner');
  await expect(errorBanner).toBeVisible({ timeout: 10000 });

  const dismissBtn = ctx.page.locator('.error-dismiss');
  await dismissBtn.click();
  await expect(errorBanner).toBeHidden();
});
