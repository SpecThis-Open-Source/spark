import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { Conversation } from '../../src/shared/types';

// Mock electron app module
vi.mock('electron', () => ({
  app: { getPath: () => '/tmp' },
}));

// Mock logger
vi.mock('../../src/main/services/logger', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Import after mocks are set up
import { StorageService } from '../../src/main/services/storage';

let tmpDir: string;
let storage: StorageService;

const testConversation: Conversation = {
  id: 'test-conv-1',
  title: 'Test Conversation',
  messages: [
    { role: 'user', content: 'Hello', timestamp: 1000 },
    { role: 'assistant', content: 'Hi there!', timestamp: 2000 },
  ],
  createdAt: 1000,
  updatedAt: 2000,
};

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
  storage = new StorageService(tmpDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('saveConversation', () => {
  it('creates a JSON file', async () => {
    await storage.saveConversation(testConversation);
    const filePath = path.join(tmpDir, `${testConversation.id}.json`);
    const stat = await fs.stat(filePath);
    expect(stat.isFile()).toBe(true);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed.id).toBe('test-conv-1');
    expect(parsed.title).toBe('Test Conversation');
  });
});

describe('loadConversation', () => {
  it('returns the saved conversation', async () => {
    await storage.saveConversation(testConversation);
    const loaded = await storage.loadConversation('test-conv-1');
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe('test-conv-1');
    expect(loaded!.title).toBe('Test Conversation');
    expect(loaded!.messages.length).toBe(2);
    expect(loaded!.messages[0].content).toBe('Hello');
  });

  it('returns null for non-existent id', async () => {
    const loaded = await storage.loadConversation('nonexistent-id');
    expect(loaded).toBeNull();
  });
});

describe('listConversations', () => {
  it('returns metadata sorted by updatedAt desc', async () => {
    const conv1: Conversation = {
      id: 'conv-a',
      title: 'Older Chat',
      messages: [{ role: 'user', content: 'Hi', timestamp: 1000 }],
      createdAt: 1000,
      updatedAt: 1000,
    };
    const conv2: Conversation = {
      id: 'conv-b',
      title: 'Newer Chat',
      messages: [
        { role: 'user', content: 'Hey', timestamp: 2000 },
        { role: 'assistant', content: 'Hello!', timestamp: 2001 },
      ],
      createdAt: 2000,
      updatedAt: 2000,
    };
    await storage.saveConversation(conv1);
    await storage.saveConversation(conv2);
    const list = await storage.listConversations();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe('conv-b');
    expect(list[0].title).toBe('Newer Chat');
    expect(list[0].messageCount).toBe(2);
    expect(list[1].id).toBe('conv-a');
    expect(list[1].messageCount).toBe(1);
  });

  it('returns empty array for empty directory', async () => {
    const list = await storage.listConversations();
    expect(list).toEqual([]);
  });
});

describe('deleteConversation', () => {
  it('removes the file', async () => {
    await storage.saveConversation(testConversation);
    await storage.deleteConversation('test-conv-1');
    const loaded = await storage.loadConversation('test-conv-1');
    expect(loaded).toBeNull();
  });
});
