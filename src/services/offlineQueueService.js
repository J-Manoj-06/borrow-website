import toast from 'react-hot-toast';
import { logEvent, LOG_CATEGORIES } from './loggerService';

const QUEUE_STORAGE_KEY = 'borrow_offline_action_queue';

/**
 * Read persistent offline action queue
 */
export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Persist queue array to localStorage
 */
const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline queue:', err);
  }
};

/**
 * Enqueue an offline mutation action
 */
export const enqueueOfflineAction = (actionType, payload) => {
  const queue = getOfflineQueue();
  const actionItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    actionType,
    payload,
    timestamp: new Date().toISOString(),
  };

  queue.push(actionItem);
  saveOfflineQueue(queue);

  logEvent(
    LOG_CATEGORIES.INVENTORY,
    `Queued offline action "${actionType}"`,
    { queueSize: queue.length },
    'warn'
  );

  toast.success(`Offline: Action queued (${queue.length} pending sync)`);
  return actionItem;
};

/**
 * Replay and synchronize queued offline actions when network recovers
 */
export const processOfflineQueue = async (executorMap = {}) => {
  const queue = getOfflineQueue();
  if (!queue.length) return;

  logEvent(LOG_CATEGORIES.INVENTORY, `Processing ${queue.length} offline queued actions...`, {}, 'info');
  toast.loading(`Syncing ${queue.length} queued offline actions...`, { id: 'offline-sync' });

  const remainingQueue = [];
  let successCount = 0;

  for (const item of queue) {
    const executor = executorMap[item.actionType];
    if (typeof executor === 'function') {
      try {
        await executor(item.payload);
        successCount++;
      } catch (err) {
        console.error(`Failed to replay offline action ${item.actionType}:`, err);
        remainingQueue.push(item);
      }
    } else {
      console.warn(`No executor found for offline action ${item.actionType}`);
    }
  }

  saveOfflineQueue(remainingQueue);

  toast.dismiss('offline-sync');
  if (successCount > 0) {
    toast.success(`Successfully synchronized ${successCount} offline actions!`);
  }
};

/**
 * Clear all queued offline actions
 */
export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
};
