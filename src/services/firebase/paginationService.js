import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Fetch Paginated Collection using Firestore cursor-based startAfter and limit
 */
export const fetchPaginatedCollection = async ({
  collectionName = 'books',
  pageSize = 10,
  lastDocSnap = null,
  filters = [],
  sortField = 'createdAt',
  sortOrder = 'desc',
}) => {
  try {
    const colRef = collection(db, collectionName);
    const queryConstraints = [];

    // Apply filters
    filters.forEach((f) => {
      if (f.field && f.operator && f.value !== undefined && f.value !== null && f.value !== '') {
        queryConstraints.push(where(f.field, f.operator, f.value));
      }
    });

    // Apply sorting
    if (sortField) {
      queryConstraints.push(orderBy(sortField, sortOrder));
    }

    // Apply cursor pagination
    if (lastDocSnap) {
      queryConstraints.push(startAfter(lastDocSnap));
    }

    // Apply page size limit
    queryConstraints.push(limit(pageSize));

    const q = query(colRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    const newLastDocSnap = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    const hasMore = snapshot.docs.length === pageSize;

    return {
      data,
      lastDocSnap: newLastDocSnap,
      hasMore,
      count: snapshot.docs.length,
    };
  } catch (err) {
    console.error(`fetchPaginatedCollection error for ${collectionName}:`, err);
    throw err;
  }
};
