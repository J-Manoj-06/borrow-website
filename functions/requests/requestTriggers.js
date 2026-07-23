const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { db, FieldValue } = require('../utils/admin');
const { sendFCMNotification } = require('../notifications/notificationService');
const { logServerActivity } = require('../utils/activity');
const addHours = require('date-fns/addHours');

/**
 * Server-side Trigger: Executed when a new Borrow Request is created
 */
const onBorrowRequestCreated = onDocumentCreated('borrowRequests/{requestId}', async (event) => {
  const reqData = event.data?.data();
  if (!reqData) return;

  try {
    await logServerActivity({
      user: reqData.studentName || 'Student App',
      action: `submitted new borrow request for book "${reqData.bookTitle}"`,
      target: reqData.requestId || event.params.requestId,
      type: 'request',
    });

    console.log(`New request created: ${reqData.requestId} by student ${reqData.studentId}`);
  } catch (err) {
    console.error('onBorrowRequestCreated trigger failed:', err);
  }
});

/**
 * Server-side Trigger: Executed when a Borrow Request status changes (Approved / Rejected / Issued)
 */
const onBorrowRequestUpdated = onDocumentUpdated('borrowRequests/{requestId}', async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  if (!beforeData || !afterData) return;

  const requestId = event.params.requestId;

  // Handle Request Approval transition
  if (beforeData.status === 'Pending' && afterData.status === 'Approved') {
    try {
      const now = new Date();
      const expiresAt = addHours(now, 48).toISOString();

      // If no copy has been reserved yet, locate and reserve one server-side
      if (!afterData.reservedCopyId) {
        const copiesQuery = await db
          .collection('bookCopies')
          .where('bookId', '==', afterData.bookId)
          .where('status', '==', 'Available')
          .limit(1)
          .get();

        if (!copiesQuery.empty) {
          const copyDoc = copiesQuery.docs[0];
          const copyId = copyDoc.id;

          // Reserve physical copy
          await copyDoc.ref.update({
            status: 'Reserved',
            currentBorrowerId: afterData.studentId,
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Update request doc
          await event.data.after.ref.update({
            reservedCopyId: copyId,
            reservedAt: now.toISOString(),
            reservationExpiresAt: expiresAt,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // Notify Student
      await sendFCMNotification(
        afterData.studentId,
        'Borrow Request Approved! 🎉',
        `Your request for "${afterData.bookTitle}" was approved. Reserved copy ${afterData.reservedCopyId || 'Assigned'}. Collect before 48 hours.`,
        { requestId, status: 'Approved' }
      );

      await logServerActivity({
        user: afterData.approvedBy || 'Librarian Admin',
        action: `approved request & reserved copy for book "${afterData.bookTitle}"`,
        target: requestId,
        type: 'request',
      });
    } catch (err) {
      console.error(`Approval trigger failed for request ${requestId}:`, err);
    }
  }

  // Handle Request Rejection transition
  if (beforeData.status === 'Pending' && afterData.status === 'Rejected') {
    try {
      await sendFCMNotification(
        afterData.studentId,
        'Borrow Request Declined ❌',
        `Your request for "${afterData.bookTitle}" was declined. Reason: ${afterData.rejectionReason || 'Not specified'}.`,
        { requestId, status: 'Rejected' }
      );

      await logServerActivity({
        user: afterData.approvedBy || 'Librarian Admin',
        action: `rejected request (${afterData.rejectionReason || 'No reason'}) for "${afterData.bookTitle}"`,
        target: requestId,
        type: 'request',
      });
    } catch (err) {
      console.error(`Rejection trigger failed for request ${requestId}:`, err);
    }
  }
});

module.exports = {
  onBorrowRequestCreated,
  onBorrowRequestUpdated,
};
