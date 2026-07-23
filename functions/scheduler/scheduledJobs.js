const { onSchedule } = require('firebase-functions/v2/scheduler');
const { db, FieldValue } = require('../utils/admin');
const { sendFCMNotification } = require('../notifications/notificationService');
const { logServerActivity } = require('../utils/activity');
const { generateDailyStatsCache } = require('../reports/reportGenerator');
const addDays = require('date-fns/addDays');
const isSameDay = require('date-fns/isSameDay');

/**
 * Hourly Cron Scheduler: Check Overdue Loans & Flag Warning Notifications
 */
const checkOverdueLoansScheduler = onSchedule('0 * * * *', async (event) => {
  const now = new Date();
  console.log(`[CRON] Running hourly overdue loans check at ${now.toISOString()}`);

  try {
    const q = await db.collection('transactions').where('status', '==', 'Issued').get();
    let overdueCount = 0;

    for (const docSnap of q.docs) {
      const txn = docSnap.data();
      if (txn.dueDate && new Date(txn.dueDate) < now) {
        overdueCount += 1;

        // Push Overdue Warning to Student
        if (txn.studentId) {
          await sendFCMNotification(
            txn.studentId,
            'Book Loan Overdue Warning ⚠️',
            `Your borrowed book "${txn.bookTitle}" (Copy: ${txn.bookCopyId}) was due on ${new Date(txn.dueDate).toLocaleDateString()}. Please return it immediately to avoid fines.`,
            { transactionId: docSnap.id, status: 'Overdue' }
          );
        }
      }
    }

    await logServerActivity({
      user: 'Cron Scheduler',
      action: `executed hourly overdue audit (${overdueCount} overdue loans detected)`,
      target: 'System Scheduler',
      type: 'system',
    });
  } catch (err) {
    console.error('checkOverdueLoansScheduler failed:', err);
  }
});

/**
 * Morning Cron Scheduler (Every day at 8:00 AM): Send Due Reminders for Today & Tomorrow
 */
const sendDueRemindersScheduler = onSchedule('0 8 * * *', async (event) => {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  console.log(`[CRON] Running morning due reminders check at ${now.toISOString()}`);

  try {
    const q = await db.collection('transactions').where('status', '==', 'Issued').get();

    for (const docSnap of q.docs) {
      const txn = docSnap.data();
      if (!txn.dueDate || !txn.studentId) continue;

      const dueObj = new Date(txn.dueDate);

      if (isSameDay(dueObj, now)) {
        await sendStudentReminderNotification(
          txn.studentId,
          'Book Due Today ⏰',
          `Reminder: "${txn.bookTitle}" (Copy: ${txn.bookCopyId}) is due today! Please check it in at the library desk.`,
          docSnap.id
        );
      } else if (isSameDay(dueObj, tomorrow)) {
        await sendStudentReminderNotification(
          txn.studentId,
          'Book Due Tomorrow 📅',
          `Reminder: "${txn.bookTitle}" is due tomorrow (${dueObj.toLocaleDateString()}).`,
          docSnap.id
        );
      }
    }
  } catch (err) {
    console.error('sendDueRemindersScheduler failed:', err);
  }
});

/**
 * Evening Cron Scheduler (Every day at 6:00 PM): Expire Uncollected Physical Copy Reservations
 */
const expireReservationsScheduler = onSchedule('0 18 * * *', async (event) => {
  const now = new Date();
  console.log(`[CRON] Running evening reservation expiration cleanup at ${now.toISOString()}`);

  try {
    const q = await db.collection('borrowRequests').where('status', '==', 'Approved').get();
    let expiredCount = 0;

    for (const docSnap of q.docs) {
      const req = docSnap.data();
      if (req.reservationExpiresAt && new Date(req.reservationExpiresAt) < now) {
        expiredCount += 1;

        // 1. Mark request as Expired
        await docSnap.ref.update({
          status: 'Expired',
          updatedAt: FieldValue.serverTimestamp(),
        });

        // 2. Restore copy to Available
        if (req.reservedCopyId) {
          const copyRef = db.collection('bookCopies').doc(req.reservedCopyId);
          const copySnap = await copyRef.get();
          if (copySnap.exists && copySnap.data().status === 'Reserved') {
            await copyRef.update({
              status: 'Available',
              currentBorrowerId: null,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }

        // 3. Notify student
        if (req.studentId) {
          await sendFCMNotification(
            req.studentId,
            'Reservation Expired ⏳',
            `Your reservation for "${req.bookTitle}" has expired because it was not collected within 48 hours.`,
            { requestId: docSnap.id, status: 'Expired' }
          );
        }
      }
    }

    if (expiredCount > 0) {
      await logServerActivity({
        user: 'Cron Scheduler',
        action: `expired ${expiredCount} uncollected reservations`,
        target: 'System Scheduler',
        type: 'system',
      });
    }
  } catch (err) {
    console.error('expireReservationsScheduler failed:', err);
  }
});

/**
 * Nightly Cron Scheduler (Every day at 12:00 AM Midnight): Generate Daily Analytics Stats Cache
 */
const generateDailyStatsCacheScheduler = onSchedule('0 0 * * *', async (event) => {
  console.log('[CRON] Generating nightly daily summary analytics cache document');
  try {
    await generateDailyStatsCache();
  } catch (err) {
    console.error('generateDailyStatsCacheScheduler failed:', err);
  }
});

module.exports = {
  checkOverdueLoansScheduler,
  sendDueRemindersScheduler,
  expireReservationsScheduler,
  generateDailyStatsCacheScheduler,
};
