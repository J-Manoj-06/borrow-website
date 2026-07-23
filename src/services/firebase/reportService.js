/**
 * Analytics & Report Aggregation Service
 */

/**
 * Filter items by date timeframe selection
 */
export const filterReportDataByTime = (data = [], dateKey = 'createdAt', timeframe = 'ALL') => {
  if (!timeframe || timeframe === 'ALL') return data;
  const now = new Date();

  return data.filter((item) => {
    if (!item[dateKey]) return false;
    const itemDate = new Date(item[dateKey]);

    switch (timeframe) {
      case 'TODAY':
        return itemDate.toDateString() === now.toDateString();
      case 'YESTERDAY': {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        return itemDate.toDateString() === yest.toDateString();
      }
      case 'LAST_7_DAYS': {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return itemDate >= sevenDaysAgo;
      }
      case 'LAST_30_DAYS': {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return itemDate >= thirtyDaysAgo;
      }
      case 'THIS_MONTH':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      case 'THIS_YEAR':
        return itemDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
};

/**
 * Compute Executive Dashboard Real-Time Health Metrics & System Alert Indicators
 */
export const computeExecutiveHealthMetrics = (
  books = [],
  transactions = [],
  requests = [],
  students = []
) => {
  const now = new Date();
  const todayStr = now.toDateString();

  let totalTitles = books.length;
  let totalCopies = 0;
  let availableCopies = 0;
  let borrowedCopies = 0;
  let reservedCopies = 0;
  let damagedCopies = 0;
  let lostCopies = 0;

  books.forEach((b) => {
    totalCopies += Number(b.totalCopies || 0);
    availableCopies += Number(b.availableCopies || 0);
    borrowedCopies += Number(b.borrowedCopies || 0);
    reservedCopies += Number(b.reservedCopies || 0);
    damagedCopies += Number(b.damagedCopies || 0);
    lostCopies += Number(b.lostCopies || 0);
  });

  const activeLoans = transactions.filter((t) => t.status === 'Issued' || t.status === 'Overdue');
  const overdueCount = transactions.filter((t) => {
    return (t.status === 'Issued' || t.status === 'Overdue') && t.dueDate && new Date(t.dueDate) < now;
  }).length;

  const todayIssues = transactions.filter(
    (t) => t.issueDate && new Date(t.issueDate).toDateString() === todayStr
  ).length;

  const todayReturns = transactions.filter(
    (t) => t.returnDate && new Date(t.returnDate).toDateString() === todayStr
  ).length;

  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
  const expiredReservations = requests.filter((r) => r.status === 'Expired').length;

  // Real-Time System Alerts
  const alerts = [];
  if (overdueCount > 5) {
    alerts.push({ id: 'overdue-high', type: 'error', message: `High Overdue Alert: ${overdueCount} loans are past due deadline.` });
  }
  if (availableCopies < 10 && totalCopies > 0) {
    alerts.push({ id: 'inv-low', type: 'warning', message: `Low Stock Warning: Only ${availableCopies} physical copies are currently available on shelf.` });
  }
  if (pendingRequests > 10) {
    alerts.push({ id: 'pending-backlog', type: 'warning', message: `Request Backlog: ${pendingRequests} borrow requests waiting for librarian approval.` });
  }
  if (damagedCopies > 2) {
    alerts.push({ id: 'damaged-spike', type: 'info', message: `Damaged Inventory Notice: ${damagedCopies} copies marked as damaged.` });
  }

  return {
    totalTitles,
    totalCopies,
    availableCopies,
    borrowedCopies,
    reservedCopies,
    damagedCopies,
    lostCopies,
    activeLoansCount: activeLoans.length,
    overdueCount,
    todayIssues,
    todayReturns,
    pendingRequests,
    expiredReservations,
    totalStudents: students.length,
    alerts,
    systemStatus: overdueCount > 10 ? 'Attention Needed' : 'Healthy',
  };
};

/**
 * Compute Monthly Circulation Trends for Charts
 */
export const computeMonthlyTrends = (transactions = [], requests = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentYear = now.getFullYear();

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${months[d.getMonth()]} ${d.getFullYear() === currentYear ? '' : d.getFullYear()}`.trim();
    monthlyData.push({
      month: monthLabel,
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      issued: 0,
      returned: 0,
      requests: 0,
    });
  }

  transactions.forEach((t) => {
    if (t.issueDate) {
      const issueD = new Date(t.issueDate);
      const match = monthlyData.find((m) => m.monthIndex === issueD.getMonth() && m.year === issueD.getFullYear());
      if (match) match.issued += 1;
    }
    if (t.returnDate) {
      const returnD = new Date(t.returnDate);
      const match = monthlyData.find((m) => m.monthIndex === returnD.getMonth() && m.year === returnD.getFullYear());
      if (match) match.returned += 1;
    }
  });

  requests.forEach((r) => {
    if (r.requestDate) {
      const reqD = new Date(r.requestDate);
      const match = monthlyData.find((m) => m.monthIndex === reqD.getMonth() && m.year === reqD.getFullYear());
      if (match) match.requests += 1;
    }
  });

  return monthlyData;
};

/**
 * Compute Top 10 Most Borrowed Books Ranking
 */
export const computeTopBooks = (books = [], transactions = []) => {
  const countsMap = {};

  transactions.forEach((t) => {
    if (t.bookId) {
      countsMap[t.bookId] = (countsMap[t.bookId] || 0) + 1;
    }
  });

  return books
    .map((b) => ({
      ...b,
      borrowCount: (countsMap[b.id] || 0) + Number(b.borrowedCopies || 0),
    }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 10);
};

/**
 * Compute Top Student Borrowers Leaderboard
 */
export const computeTopStudents = (students = [], transactions = []) => {
  const studentMap = {};

  transactions.forEach((t) => {
    const key = t.studentId || t.registerNumber;
    if (key) {
      if (!studentMap[key]) {
        studentMap[key] = {
          studentId: key,
          name: t.studentName,
          regNo: t.registerNumber,
          department: t.department,
          year: t.year,
          avatar: t.studentAvatar,
          totalBorrowed: 0,
          activeLoans: 0,
        };
      }
      studentMap[key].totalBorrowed += 1;
      if (t.status === 'Issued' || t.status === 'Overdue') {
        studentMap[key].activeLoans += 1;
      }
    }
  });

  return Object.values(studentMap)
    .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
    .slice(0, 10);
};

/**
 * Compute Category Usage Report
 */
export const computeCategoryReport = (books = [], transactions = []) => {
  const catMap = {};

  books.forEach((b) => {
    const cat = b.category || 'Uncategorized';
    if (!catMap[cat]) {
      catMap[cat] = {
        category: cat,
        totalTitles: 0,
        borrowedCopies: 0,
        availableCopies: 0,
      };
    }
    catMap[cat].totalTitles += 1;
    catMap[cat].borrowedCopies += Number(b.borrowedCopies || 0);
    catMap[cat].availableCopies += Number(b.availableCopies || 0);
  });

  const totalBorrowedAll = Object.values(catMap).reduce((sum, c) => sum + c.borrowedCopies, 0) || 1;

  return Object.values(catMap)
    .map((c) => ({
      ...c,
      popularityPercentage: Math.round((c.borrowedCopies / totalBorrowedAll) * 100),
    }))
    .sort((a, b) => b.borrowedCopies - a.borrowedCopies);
};

/**
 * Compute Department Usage Report
 */
export const computeDepartmentReport = (students = [], transactions = []) => {
  const deptMap = {};

  students.forEach((s) => {
    const dept = s.department || 'General';
    if (!deptMap[dept]) {
      deptMap[dept] = {
        department: dept,
        studentCount: 0,
        booksBorrowed: 0,
        topCategory: 'Computer Science',
      };
    }
    deptMap[dept].studentCount += 1;
  });

  transactions.forEach((t) => {
    const dept = t.department || 'General';
    if (!deptMap[dept]) {
      deptMap[dept] = {
        department: dept,
        studentCount: 0,
        booksBorrowed: 0,
        topCategory: t.category || 'Computer Science',
      };
    }
    deptMap[dept].booksBorrowed += 1;
  });

  return Object.values(deptMap).sort((a, b) => b.booksBorrowed - a.booksBorrowed);
};

/**
 * Compute Librarian Processing Performance Leaderboard
 */
export const computeLibrarianAnalytics = (activities = [], transactions = [], requests = []) => {
  const libMap = {};

  activities.forEach((a) => {
    const name = a.user || a.performedBy;
    if (name && name !== 'Student' && name !== 'Cloud Function' && name !== 'Cron Scheduler') {
      if (!libMap[name]) {
        libMap[name] = {
          name,
          issuesProcessed: 0,
          returnsProcessed: 0,
          approvalsCompleted: 0,
          totalActions: 0,
        };
      }
      libMap[name].totalActions += 1;
      if (a.type === 'issue') libMap[name].issuesProcessed += 1;
      if (a.type === 'return') libMap[name].returnsProcessed += 1;
      if (a.type === 'request' && a.action.includes('approved')) libMap[name].approvalsCompleted += 1;
    }
  });

  return Object.values(libMap).sort((a, b) => b.totalActions - a.totalActions);
};
