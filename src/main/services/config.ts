import { app } from 'electron';
import { config } from 'dotenv';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { DEFAULT_MODEL, CONFIG_FILE_NAME } from '../../shared/constants';
import * as log from './logger';

const TAG = 'config';

// Load .env for dev env vars (ANTHROPIC_BASE_URL, ANTHROPIC_MODEL, LOG_LEVEL)
config();

interface AppConfig {
  apiKey?: string;
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), CONFIG_FILE_NAME);
}

function readConfig(): AppConfig {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    return {};
  }
  try {
    const data = readFileSync(configPath, 'utf-8');
    return JSON.parse(data) as AppConfig;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(TAG, `Failed to read config: ${message}`);
    return {};
  }
}

function writeConfig(cfg: AppConfig): void {
  const configPath = getConfigPath();
  log.debug(TAG, `Writing config to ${configPath}`);
  writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
  log.debug(TAG, 'Config written successfully');
}

export function migrateConfig(): void {
  const configPath = getConfigPath();
  if (existsSync(configPath)) {
    log.debug(TAG, 'Config file already exists, skipping migration');
    return;
  }

  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey && envKey.length > 0 && envKey !== 'your-key-here') {
    log.info(TAG, 'Migrating API key from environment to config.json');
    writeConfig({ apiKey: envKey });
  }
}

export function getApiKey(): string | undefined {
  return readConfig().apiKey;
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
}

export function getBaseUrl(): string | undefined {
  return process.env.ANTHROPIC_BASE_URL;
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key.length > 0 && key !== 'your-key-here';
}

export function setApiKey(key: string): { success: boolean; error?: string } {
  log.info(TAG, `setApiKey called (key length=${key.length})`);
  try {
    const cfg = readConfig();
    cfg.apiKey = key;
    writeConfig(cfg);
    log.info(TAG, 'API key saved to config.json');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save key';
    log.error(TAG, `Failed to save API key: ${message}`);
    return { success: false, error: message };
  }
}
