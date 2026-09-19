import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel = env.nodeEnv === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function formatLine(level: LogLevel, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  const base = `[${ts}] ${level.toUpperCase().padEnd(5)} ${message}`;
  if (meta === undefined) return base;
  if (meta instanceof Error) {
    return `${base} ${meta.stack || meta.message}`;
  }
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return `${base} ${String(meta)}`;
  }
}

function write(level: LogLevel, message: string, meta?: unknown) {
  if (!shouldLog(level)) return;
  const line = formatLine(level, message, meta);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
