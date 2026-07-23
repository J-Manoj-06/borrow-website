const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { db, FieldValue } = require('../utils/admin');
const { logServerActivity } = require('../utils/activity');

/**
 * Server-side Trigger: Recalculates parent Book document counts whenever a physical copy doc changes
 */
const onBookCopyStatusChanged = onDocumentWritten('bookCopies/{copyId}', async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();

  const bookId = afterData?.bookId || beforeData?.bookId;
  if (!bookId) return;

  try {
    const copiesSnap = await db.collection('bookCopies').where('bookId', '==', bookId).get();

    let availableCopies = 0;
    let borrowedCopies = 0;
    let reservedCopies = 0;
    let damagedCopies = 0;
    let lostCopies = 0;
    let archivedCopies = 0;
    let maintenanceCopies = 0;
    let totalCopies = 0;

    copiesSnap.docs.forEach((docSnap) => {
      const c = docSnap.data();
      if (c.status === 'Archived') {
        archivedCopies += 1;
      } else {
        totalCopies += 1;
        if (c.status === 'Available') availableCopies += 1;
        if (c.status === 'Borrowed') borrowedCopies += 1;
        if (c.status === 'Reserved') reservedCopies += 1;
        if (c.status === 'Damaged') damagedCopies += 1;
        if (c.status === 'Lost') lostCopies += 1;
        if (c.status === 'Under Maintenance') maintenanceCopies += 1;
      }
    });

    const bookRef = db.collection('books').doc(bookId);
    const bookSnap = await bookRef.get();

    if (bookSnap.exists) {
      const isArchived = Boolean(bookSnap.data().isArchived);

      let status = 'Available';
      if (isArchived) {
        status = 'Archived';
      } else if (availableCopies > 0) {
        status = 'Available';
      } else if (borrowedCopies > 0 || reservedCopies > 0) {
        status = 'Out of Stock';
      } else {
        status = 'Unavailable';
      }

      await bookRef.update({
        totalCopies,
        availableCopies,
        borrowedCopies,
        reservedCopies,
        damagedCopies,
        lostCopies,
        archivedCopies,
        maintenanceCopies,
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`Server synced inventory counts for book ${bookId}: Available=${availableCopies}, Borrowed=${borrowedCopies}`);
    }
  } catch (err) {
    console.error(`Inventory sync trigger failed for book ${bookId}:`, err);
  }
});

module.exports = {
  onBookCopyStatusChanged,
};
