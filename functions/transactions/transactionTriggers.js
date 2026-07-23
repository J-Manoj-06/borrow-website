const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { db, FieldValue } = require('../utils/admin');
const { sendFCMNotification } = require('../notifications/notificationService');
const { logServerActivity } = require('../utils/activity');

/**
 * Server-side Trigger: Executed when a Checkout Transaction is created
 */
const onTransactionCreated = onDocumentCreated('transactions/{transactionId}', async (event) => {
  const txnData = event.data?.data();
  if (!txnData) return;

  const txnId = event.params.transactionId;

  try {
    // 1. Update physical copy doc to Borrowed if needed
    if (txnData.bookCopyId) {
      const copyRef = db.collection('bookCopies').doc(txnData.bookCopyId);
      const copySnap = await copyRef.get();

      if (copySnap.exists && copySnap.data().status !== 'Borrowed') {
        await copyRef.update({
          status: 'Borrowed',
          currentTransactionId: txnId,
          currentBorrowerId: txnData.studentId,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    // 2. Notify student
    if (txnData.studentId) {
      await sendFCMNotification(
        txnData.studentId,
        'Book Issued Successfully! 📖',
        `You have collected "${txnData.bookTitle}". Return deadline: ${new Date(txnData.dueDate).toLocaleDateString()}.`,
        { transactionId: txnId, status: 'Issued' }
      );
    }

    // 3. Log server audit record
    await logServerActivity({
      user: txnData.issuedBy || 'Librarian Admin',
      action: `issued book copy ${txnData.bookCopyId || ''} to ${txnData.studentName}`,
      target: txnData.bookTitle || txnId,
      type: 'issue',
    });
  } catch (err) {
    console.error(`onTransactionCreated trigger failed for ${txnId}:`, err);
  }
});

/**
 * Server-side Trigger: Executed when a Transaction status changes (e.g., Returned)
 */
const onTransactionUpdated = onDocumentUpdated('transactions/{transactionId}', async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  if (!beforeData || !afterData) return;

  const txnId = event.params.transactionId;

  // Handle Book Returned transition
  if (beforeData.status !== 'Returned' && afterData.status === 'Returned') {
    try {
      const condition = afterData.condition || 'Good';
      let finalCopyStatus = 'Available';
      if (condition === 'Damaged') finalCopyStatus = 'Damaged';
      if (condition === 'Lost') finalCopyStatus = 'Lost';

      // 1. Update physical copy status
      if (afterData.bookCopyId) {
        const copyRef = db.collection('bookCopies').doc(afterData.bookCopyId);
        const copySnap = await copyRef.get();

        if (copySnap.exists) {
          await copyRef.update({
            status: finalCopyStatus,
            condition,
            currentTransactionId: null,
            currentBorrowerId: null,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // 2. Notify student
      if (afterData.studentId) {
        await sendFCMNotification(
          afterData.studentId,
          'Book Returned Successfully! ✅',
          `"${afterData.bookTitle}" has been returned and checked into library inventory. Condition: ${condition}.`,
          { transactionId: txnId, status: 'Returned', condition }
        );
      }

      // 3. Log server activity
      await logServerActivity({
        user: afterData.returnedBy || 'Librarian Admin',
        action: `processed return (Condition: ${condition}) for "${afterData.bookTitle}"`,
        target: txnId,
        type: 'return',
      });
    } catch (err) {
      console.error(`onTransactionUpdated return trigger failed for ${txnId}:`, err);
    }
  }
});

module.exports = {
  onTransactionCreated,
  onTransactionUpdated,
};
