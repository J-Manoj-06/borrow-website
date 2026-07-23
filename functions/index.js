/**
 * Borrow Library Admin Portal - Firebase Cloud Functions Entrypoint
 */

// 1. Inventory & Book Copy Triggers
const { onBookCopyStatusChanged } = require('./books/inventoryTriggers');

// 2. Borrow Request Event Triggers
const { onBorrowRequestCreated, onBorrowRequestUpdated } = require('./requests/requestTriggers');

// 3. Checkout & Return Transaction Event Triggers
const { onTransactionCreated, onTransactionUpdated } = require('./transactions/transactionTriggers');

// 4. Background Cron Schedulers
const {
  checkOverdueLoansScheduler,
  sendDueRemindersScheduler,
  expireReservationsScheduler,
  generateDailyStatsCacheScheduler,
} = require('./scheduler/scheduledJobs');

// 5. Reports & Daily Stats API
const { onRequest } = require('firebase-functions/v2/https');
const { generateDailyStatsCache } = require('./reports/reportGenerator');

const getDailyStatsApi = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.status(204).send('');
    return;
  }

  try {
    const stats = await generateDailyStatsCache();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export all Cloud Functions
module.exports = {
  // Inventory Triggers
  onBookCopyStatusChanged,

  // Request Triggers
  onBorrowRequestCreated,
  onBorrowRequestUpdated,

  // Transaction Triggers
  onTransactionCreated,
  onTransactionUpdated,

  // Cron Schedulers
  checkOverdueLoansScheduler,
  sendDueRemindersScheduler,
  expireReservationsScheduler,
  generateDailyStatsCacheScheduler,

  // REST API Endpoints
  getDailyStatsApi,
};
