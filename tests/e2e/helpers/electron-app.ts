import { _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';

export interface AppContext {
  app: ElectronApplication;
  page: Page;
}

export async function launchApp(envOverrides?: Record<string, string>): Promise<AppContext> {
  const app = await electron.launch({
    args: [path.join(__dirname, '..', '..', '..')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ...envOverrides,
    },
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');

  // Wait for the app JS to initialize (init() sets #chat-title to 'New Chat')
  await page.waitForFunction(
    () => document.getElementById('chat-title')?.textContent === 'New Chat',
    { timeout: 10000 },
  );

  return { app, page };
}

export async function closeApp(ctx: AppContext): Promise<void> {
  await ctx.app.close();
}
