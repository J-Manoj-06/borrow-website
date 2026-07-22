/**
 * Global Search Indexing Service & Filter Preset Manager
 */

const RECENT_SEARCHES_KEY = 'borrow_admin_recent_searches';
const SAVED_FILTERS_KEY = 'borrow_admin_saved_filters';

/**
 * Fetch Recent Searches from LocalStorage
 */
export const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : ['Clean Code', 'Alex Rivera', 'CPY-235088-001', 'Computer Science'];
  } catch {
    return ['Clean Code', 'Alex Rivera', 'CPY-235088-001'];
  }
};

/**
 * Save Query to Recent Searches
 */
export const saveRecentSearch = (queryStr) => {
  if (!queryStr || !queryStr.trim()) return;
  const current = getRecentSearches();
  const filtered = current.filter((q) => q.toLowerCase() !== queryStr.toLowerCase().trim());
  const updated = [queryStr.trim(), ...filtered].slice(0, 8);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
};

/**
 * Fetch Saved Custom Filters
 */
export const getSavedFilters = () => {
  try {
    const stored = localStorage.getItem(SAVED_FILTERS_KEY);
    return stored
      ? JSON.parse(stored)
      : [
          { id: 'SF-01', name: 'Overdue CS Students', module: 'Students', criteria: { department: 'Computer Science', hasOverdueOnly: true } },
          { id: 'SF-02', name: 'High Priority Pending Requests', module: 'Requests', criteria: { status: 'Pending', priority: 'High' } },
        ];
  } catch {
    return [];
  }
};

/**
 * Save Custom Filter Preset
 */
export const saveCustomFilterPreset = (name, module, criteria) => {
  const current = getSavedFilters();
  const newPreset = {
    id: `SF-${Date.now()}`,
    name,
    module,
    criteria,
    createdAt: new Date().toISOString(),
  };
  const updated = [newPreset, ...current];
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Delete Saved Filter Preset
 */
export const deleteSavedFilterPreset = (id) => {
  const current = getSavedFilters();
  const updated = current.filter((f) => f.id !== id);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Universal Multi-Module Search Indexer
 */
export const searchAllModules = (query, { books = [], students = [], requests = [], transactions = [], notifications = [], activities = [] }) => {
  if (!query || !query.trim()) {
    return {
      books: [],
      students: [],
      requests: [],
      transactions: [],
      notifications: [],
      activities: [],
      totalMatches: 0,
    };
  }

  const q = query.toLowerCase().trim();

  // Search Books & Physical Copies
  const matchingBooks = books
    .filter((b) => {
      const matchTitle = b.title?.toLowerCase().includes(q);
      const matchAuthor = b.author?.toLowerCase().includes(q);
      const matchIsbn = b.isbn?.toLowerCase().includes(q);
      const matchCategory = b.category?.toLowerCase().includes(q);
      const matchPublisher = b.publisher?.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchIsbn || matchCategory || matchPublisher;
    })
    .slice(0, 4);

  // Search Students
  const matchingStudents = students
    .filter((s) => {
      const matchName = (s.fullName || s.name)?.toLowerCase().includes(q);
      const matchReg = s.registerNumber?.toLowerCase().includes(q);
      const matchDept = s.department?.toLowerCase().includes(q);
      const matchEmail = s.email?.toLowerCase().includes(q);
      return matchName || matchReg || matchDept || matchEmail;
    })
    .slice(0, 4);

  // Search Borrow Requests
  const matchingRequests = requests
    .filter((r) => {
      const matchId = (r.id || r.requestId)?.toLowerCase().includes(q);
      const matchStudent = r.studentName?.toLowerCase().includes(q);
      const matchBook = r.bookTitle?.toLowerCase().includes(q);
      const matchStatus = r.status?.toLowerCase().includes(q);
      return matchId || matchStudent || matchBook || matchStatus;
    })
    .slice(0, 4);

  // Search Issue & Return Transactions
  const matchingTransactions = transactions
    .filter((t) => {
      const matchTxnId = (t.id || t.transactionId)?.toLowerCase().includes(q);
      const matchCopy = t.bookCopyId?.toLowerCase().includes(q);
      const matchStudent = t.studentName?.toLowerCase().includes(q);
      const matchBook = t.bookTitle?.toLowerCase().includes(q);
      return matchTxnId || matchCopy || matchStudent || matchBook;
    })
    .slice(0, 4);

  // Search Notifications & Announcements
  const matchingNotifications = notifications
    .filter((n) => {
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchMsg = n.message?.toLowerCase().includes(q);
      const matchType = n.type?.toLowerCase().includes(q);
      return matchTitle || matchMsg || matchType;
    })
    .slice(0, 3);

  // Search Activity Logs
  const matchingActivities = activities
    .filter((a) => {
      const matchType = a.activityType?.toLowerCase().includes(q);
      const matchBy = a.performedBy?.toLowerCase().includes(q);
      const matchDoc = a.affectedDocumentName?.toLowerCase().includes(q);
      return matchType || matchBy || matchDoc;
    })
    .slice(0, 3);

  const totalMatches =
    matchingBooks.length +
    matchingStudents.length +
    matchingRequests.length +
    matchingTransactions.length +
    matchingNotifications.length +
    matchingActivities.length;

  return {
    books: matchingBooks,
    students: matchingStudents,
    requests: matchingRequests,
    transactions: matchingTransactions,
    notifications: matchingNotifications,
    activities: matchingActivities,
    totalMatches,
  };
};
