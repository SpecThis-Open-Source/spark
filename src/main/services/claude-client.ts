import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, StreamChunkEvent } from '../../shared/types';
import { DEFAULT_MAX_TOKENS, DEFAULT_MODEL } from '../../shared/constants';
import * as log from './logger';

const TAG = 'claude-client';

export class ApiKeyError extends Error {
  constructor(message = 'Invalid or missing API key') {
    super(message);
    this.name = 'ApiKeyError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private abortController: AbortController | null = null;

  constructor(apiKey: string, model?: string, baseURL?: string) {
    this.client = new Anthropic({ apiKey, baseURL });
    this.model = model ?? DEFAULT_MODEL;
    log.info(TAG, `Initialized with model=${this.model}`);
  }

  async *sendMessage(
    messages: ChatMessage[],
    options?: { maxTokens?: number },
  ): AsyncGenerator<StreamChunkEvent> {
    this.abortController = new AbortController();
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const apiMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    log.debug(TAG, `Streaming with ${messages.length} messages, maxTokens=${maxTokens}`);

    try {
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: maxTokens,
        messages: apiMessages,
      });

      for await (const event of stream) {
        if (this.abortController.signal.aborted) {
          yield { type: 'done' };
          return;
        }
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { type: 'text', text: event.delta.text };
        }
      }

      yield { type: 'done' };
    } catch (err: unknown) {
      if (this.abortController.signal.aborted) {
        yield { type: 'done' };
        return;
      }
      const classified = classifyError(err);
      log.error(TAG, `Stream error: ${classified.message}`);
      yield { type: 'error', error: classified.message };
    } finally {
      this.abortController = null;
    }
  }

  stopGeneration(): void {
    this.abortController?.abort();
  }
}

function classifyError(err: unknown): Error {
  if (err instanceof Anthropic.AuthenticationError) {
    return new ApiKeyError();
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new RateLimitError();
  }
  if (err instanceof TypeError && (err as Error).message.includes('fetch')) {
    return new NetworkError();
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error('Unknown error');
}
