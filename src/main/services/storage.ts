import { app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import { Conversation, ConversationMeta } from '../../shared/types';
import { CHATS_DIR_NAME } from '../../shared/constants';
import * as log from './logger';

const TAG = 'storage';

export class StorageService {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? path.join(app.getPath('userData'), CHATS_DIR_NAME);
  }

  async ensureDir(): Promise<void> {
    await fs.mkdir(this.basePath, { recursive: true });
  }

  async listConversations(): Promise<ConversationMeta[]> {
    await this.ensureDir();
    const files = await fs.readdir(this.basePath);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const metas: ConversationMeta[] = [];
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(this.basePath, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const conv: Conversation = JSON.parse(data);
        metas.push({
          id: conv.id,
          title: conv.title,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages.length,
        });
      } catch {
        // Skip corrupted files
      }
    }

    log.debug(TAG, `Listed ${metas.length} conversations`);
    return metas.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async loadConversation(id: string): Promise<Conversation | null> {
    try {
      const filePath = path.join(this.basePath, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Conversation;
    } catch {
      return null;
    }
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(this.basePath, `${conversation.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
    log.debug(TAG, `Saved conversation ${conversation.id}`);
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const filePath = path.join(this.basePath, `${id}.json`);
      await fs.unlink(filePath);
      log.debug(TAG, `Deleted conversation ${id}`);
    } catch {
      // File may not exist
    }
  }
}
