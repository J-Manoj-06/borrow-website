/**
 * Analytics & Report Aggregation Service
 */

/**
 * Compute Monthly Circulation Trends for Charts
 */
export const computeMonthlyTrends = (transactions = [], requests = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentYear = now.getFullYear();

  // Create monthly structure for the last 6 months
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

  // Populate transactions
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

  // Populate requests
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

  return Object.values(catMap).map((c) => ({
    ...c,
    popularityPercentage: Math.round((c.borrowedCopies / totalBorrowedAll) * 100),
  })).sort((a, b) => b.borrowedCopies - a.borrowedCopies);
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
