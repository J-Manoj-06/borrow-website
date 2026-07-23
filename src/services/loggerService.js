/**
 * Structured Logging Engine with Credential Sanitization
 */

export const LOG_CATEGORIES = {
  AUTH: 'AUTH',
  INVENTORY: 'INVENTORY',
  BORROW: 'BORROW',
  STORAGE: 'STORAGE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  QR: 'QR',
  REPORTS: 'REPORTS',
  ERROR: 'ERROR',
  PERFORMANCE: 'PERFORMANCE',
};

const logBuffer = [];
const MAX_LOG_BUFFER_SIZE = 100;

/**
 * Sanitize sensitive values (passwords, tokens, keys)
 */
const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized = Array.isArray(payload) ? [...payload] : { ...payload };

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('apikey')
    ) {
      sanitized[key] = '***[REDACTED]***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Format and record structured log entry
 */
export const logEvent = (category, action, details = {}, level = 'info') => {
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    category: category || LOG_CATEGORIES.INVENTORY,
    action,
    level,
    details: sanitizePayload(details),
  };

  logBuffer.unshift(logEntry);
  if (logBuffer.length > MAX_LOG_BUFFER_SIZE) {
    logBuffer.pop();
  }

  // Output to browser console with category styling
  const style =
    level === 'error'
      ? 'color: #EF4444; font-weight: bold;'
      : level === 'warn'
      ? 'color: #F59E0B; font-weight: bold;'
      : 'color: #2563EB; font-weight: bold;';

  console.log(`%c[${logEntry.category}] ${logEntry.action}`, style, logEntry.details);

  return logEntry;
};

export const getLogBuffer = () => [...logBuffer];
export const clearLogBuffer = () => {
  logBuffer.length = 0;
};
