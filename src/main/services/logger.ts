const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LEVELS;

let currentLevel: LogLevel = 'info';

export function initLogger(): void {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LEVELS) {
    currentLevel = envLevel as LogLevel;
  }
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function timestamp(): string {
  return new Date().toISOString();
}

function format(level: LogLevel, tag: string, message: string): string {
  return `[${timestamp()}] [${level.toUpperCase()}] [${tag}] ${message}`;
}

export function debug(tag: string, message: string): void {
  if (shouldLog('debug')) {
    console.log(format('debug', tag, message));
  }
}

export function info(tag: string, message: string): void {
  if (shouldLog('info')) {
    console.log(format('info', tag, message));
  }
}

export function warn(tag: string, message: string): void {
  if (shouldLog('warn')) {
    console.warn(format('warn', tag, message));
  }
}

export function error(tag: string, message: string): void {
  if (shouldLog('error')) {
    console.error(format('error', tag, message));
  }
}
