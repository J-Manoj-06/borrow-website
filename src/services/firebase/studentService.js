import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { logActivityRecord } from './activityService';

const STUDENTS_COLLECTION = 'students';

/**
  Subscribe to Real-Time Students Snapshot
 */
export const subscribeToStudents = (callback) => {
  const q = query(collection(db, STUDENTS_COLLECTION), orderBy('fullName', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const students = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt || new Date().toISOString(),
      }));
      callback(students);
    },
    (error) => {
      console.error('Firestore real-time students subscription error:', error);
      callback([]);
    }
  );
};

/**
  Create New Student Profile in Firestore
 */
export const createStudent = async (studentData) => {
  const payload = {
    ...studentData,
    status: studentData.status || 'Active',
    borrowedCount: studentData.borrowedCount || 0,
    totalBorrowedCount: studentData.totalBorrowedCount || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), payload);

  await logActivityRecord({
    user: 'Librarian',
    action: 'registered student profile for',
    target: studentData.fullName,
    type: 'add',
  });

  return { id: docRef.id, ...studentData };
};

/**
  Update Student Profile in Firestore
 */
export const updateStudent = async (id, updateFields) => {
  const studentRef = doc(db, STUDENTS_COLLECTION, id);
  await updateDoc(studentRef, {
    ...updateFields,
    updatedAt: serverTimestamp(),
  });
  return true;
};

/**
  Delete Student Profile from Firestore
 */
export const deleteStudent = async (id, fullName = 'Student') => {
  await deleteDoc(doc(db, STUDENTS_COLLECTION, id));
  await logActivityRecord({
    user: 'Librarian',
    action: 'deleted student profile',
    target: fullName,
    type: 'delete',
  });
  return true;
};
