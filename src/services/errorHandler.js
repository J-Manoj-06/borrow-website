import toast from 'react-hot-toast';
import { logEvent, LOG_CATEGORIES } from './loggerService';

export const ERROR_TYPES = {
  VALIDATION: 'Validation Error',
  AUTH: 'Authentication Error',
  PERMISSION: 'Permission Denied',
  FIRESTORE: 'Database Exception',
  STORAGE: 'Storage Exception',
  CLOUD_FUNCTION: 'Backend Function Error',
  NETWORK: 'Network Timeout',
  UNEXPECTED: 'Unexpected Exception',
};

/**
 * Classify raw error object into structured error category
 */
export const classifyError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNEXPECTED, message: 'An unknown error occurred.' };

  const message = error.message || String(error);
  const code = error.code || '';

  if (code.includes('auth/') || message.includes('auth')) {
    return { type: ERROR_TYPES.AUTH, message: 'Authentication failed. Please verify your credentials or sign in again.' };
  }
  if (code.includes('permission-denied') || message.includes('permission')) {
    return { type: ERROR_TYPES.PERMISSION, message: 'Access Denied: You do not have permission to perform this action.' };
  }
  if (code.includes('unavailable') || message.includes('offline') || message.includes('network')) {
    return { type: ERROR_TYPES.NETWORK, message: 'Network connection lost. Operations are queued offline.' };
  }
  if (code.includes('storage/')) {
    return { type: ERROR_TYPES.STORAGE, message: 'Storage operation failed. Verify file size and format restrictions.' };
  }
  if (code.includes('functions/')) {
    return { type: ERROR_TYPES.CLOUD_FUNCTION, message: 'Cloud Function backend service returned an error.' };
  }

  return { type: ERROR_TYPES.FIRESTORE, message: message || 'Database request failed.' };
};

/**
 * Global Error Handler Toast Dispatcher & Logger
 */
export const handleGlobalError = (error, contextAction = 'Operation') => {
  const classified = classifyError(error);

  logEvent(
    LOG_CATEGORIES.ERROR,
    `Failed ${contextAction}: ${classified.message}`,
    { originalError: error?.message || error, code: error?.code },
    'error'
  );

  toast.error(`${classified.type}: ${classified.message}`);
  return classified;
};

/**
 * Exponential Backoff Retry Helper
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelayMs = 1000) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
