import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_STUDENTS } from '../../models/studentModel';

const STUDENTS_COLLECTION = 'students';
const LOCAL_STUDENTS_KEY = 'borrow_admin_local_students';

const getLocalStudents = () => {
  const stored = localStorage.getItem(LOCAL_STUDENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_STUDENTS;
    }
  }
  localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(INITIAL_MOCK_STUDENTS));
  return INITIAL_MOCK_STUDENTS;
};

/**
 * Subscribe to Real-Time Students Snapshot
 */
export const subscribeToStudents = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, STUDENTS_COLLECTION), orderBy('fullName', 'asc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const students = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(students);
        },
        (error) => {
          console.warn('Firestore student snapshot error, using local fallback:', error);
          callback(getLocalStudents());
        }
      );
    } catch (err) {
      console.warn('Firestore student subscription failed:', err);
    }
  }

  const localData = getLocalStudents();
  callback(localData);

  return () => {};
};
