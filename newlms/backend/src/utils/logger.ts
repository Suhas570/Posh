import fs from 'fs';
import path from 'path';

/**
 * Minimal structured logger. Writes to stdout (captured by the process
 * manager / container logs in production) and additionally appends to a
 * rotating-by-day log file under backend/logs for local audit trails.
 */

const LOG_DIR = path.join(__dirname, '../../logs');

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {
    // best-effort only
  }
}

function writeLine(level: string, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta || {}),
  };
  const line = JSON.stringify(entry);

  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleFn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, meta ? meta : '');

  try {
    ensureLogDir();
    const fileName = `${new Date().toISOString().slice(0, 10)}.log`;
    fs.appendFileSync(path.join(LOG_DIR, fileName), line + '\n');
  } catch {
    // never let logging failures break request handling
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => writeLine('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => writeLine('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => writeLine('error', message, meta),
};
