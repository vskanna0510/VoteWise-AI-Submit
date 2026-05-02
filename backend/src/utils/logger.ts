/* Tiny structured logger - no external deps. */
type Level = 'debug' | 'info' | 'warn' | 'error';

const colors: Record<Level, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const reset = '\x1b[0m';

const log = (level: Level, msg: unknown, ...rest: unknown[]) => {
  const ts = new Date().toISOString();
  const tag = `${colors[level]}[${level.toUpperCase()}]${reset}`;
  // eslint-disable-next-line no-console
  console.log(`${ts} ${tag} ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`, ...rest);
};

export const logger = {
  debug: (msg: unknown, ...rest: unknown[]) => log('debug', msg, ...rest),
  info: (msg: unknown, ...rest: unknown[]) => log('info', msg, ...rest),
  warn: (msg: unknown, ...rest: unknown[]) => log('warn', msg, ...rest),
  error: (msg: unknown, ...rest: unknown[]) => log('error', msg, ...rest),
};
