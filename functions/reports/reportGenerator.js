const { db, FieldValue } = require('../utils/admin');

/**
 * Generate and Cache Daily & Executive Statistics Report Documents in Firestore
 */
const generateDailyStatsCache = async () => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  try {
    const booksSnap = await db.collection('books').where('isArchived', '==', false).get();
    const totalTitles = booksSnap.size;

    let totalCopies = 0;
    let availableCopies = 0;
    let borrowedCopies = 0;
    let reservedCopies = 0;
    let damagedCopies = 0;
    let lostCopies = 0;

    booksSnap.docs.forEach((docSnap) => {
      const b = docSnap.data();
      totalCopies += Number(b.totalCopies || 0);
      availableCopies += Number(b.availableCopies || 0);
      borrowedCopies += Number(b.borrowedCopies || 0);
      reservedCopies += Number(b.reservedCopies || 0);
      damagedCopies += Number(b.damagedCopies || 0);
      lostCopies += Number(b.lostCopies || 0);
    });

    const studentsSnap = await db.collection('students').get();
    const totalStudents = studentsSnap.size;

    const txnsSnap = await db.collection('transactions').get();
    const activeLoans = txnsSnap.docs.filter((d) => d.data().status === 'Issued' || d.data().status === 'Overdue').length;

    const overdueCount = txnsSnap.docs.filter((d) => {
      const data = d.data();
      return (data.status === 'Issued' || data.status === 'Overdue') && data.dueDate && new Date(data.dueDate) < now;
    }).length;

    const requestsSnap = await db.collection('borrowRequests').get();
    const pendingRequests = requestsSnap.docs.filter((d) => d.data().status === 'Pending').length;
    const expiredReservations = requestsSnap.docs.filter((d) => d.data().status === 'Expired').length;

    const dailySummaryDoc = {
      date: todayStr,
      totalTitles,
      totalCopies,
      availableCopies,
      borrowedCopies,
      reservedCopies,
      damagedCopies,
      lostCopies,
      totalStudents,
      activeLoans,
      overdueCount,
      pendingRequests,
      expiredReservations,
      generatedAt: now.toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Write to reports/dailySummary and reports/executiveSummary
    await db.collection('reports').doc('dailySummary').set(dailySummaryDoc);
    await db.collection('reports').doc('executiveSummary').set(dailySummaryDoc);

    console.log(`Successfully generated daily & executive stats cache for ${todayStr}:`, dailySummaryDoc);
    return dailySummaryDoc;
  } catch (err) {
    console.error('generateDailyStatsCache failed:', err);
    throw err;
  }
};

module.exports = {
  generateDailyStatsCache,
};
