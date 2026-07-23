import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_BORROW_RULES,
  DEFAULT_RETURN_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_ACADEMIC_YEARS,
} from '../../models/settingsModel';

const SETTINGS_DOC_PATH = 'settings/globalConfig';

const getInitialCombinedSettings = () => ({
  general: DEFAULT_GENERAL_SETTINGS,
  borrowRules: DEFAULT_BORROW_RULES,
  returnRules: DEFAULT_RETURN_RULES,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  categories: DEFAULT_CATEGORIES,
  departments: DEFAULT_DEPARTMENTS,
  academicYears: DEFAULT_ACADEMIC_YEARS,
});

/**
  Subscribe to Real-Time Settings Snapshot from Firestore
 */
export const subscribeToSettings = (callback) => {
  const docRef = doc(db, SETTINGS_DOC_PATH);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        const initial = getInitialCombinedSettings();
        setDoc(docRef, initial).catch(console.warn);
        callback(initial);
      }
    },
    (error) => {
      console.error('Firestore settings real-time subscription error:', error);
      callback(getInitialCombinedSettings());
    }
  );
};

/**
  Save Specific Settings Section in Firestore
 */
export const updateSettingsSection = async (sectionKey, newSectionData) => {
  const docRef = doc(db, SETTINGS_DOC_PATH);
  await setDoc(
    docRef,
    {
      [sectionKey]: newSectionData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return true;
};

/**
  Export Complete Configuration JSON
 */
export const exportSettingsJSON = (currentSettings) => {
  const data = currentSettings || getInitialCombinedSettings();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `Borrow_Library_System_Settings_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
  Import Settings JSON to Firestore
 */
export const importSettingsJSON = async (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    const docRef = doc(db, SETTINGS_DOC_PATH);
    await setDoc(docRef, { ...parsed, updatedAt: serverTimestamp() }, { merge: true });
    return parsed;
  } catch (err) {
    throw new Error('Invalid JSON settings backup file formatting.');
  }
};

/**
  Reset Settings to Factory Defaults in Firestore
 */
export const resetSettingsToDefault = async () => {
  const initial = getInitialCombinedSettings();
  const docRef = doc(db, SETTINGS_DOC_PATH);
  await setDoc(docRef, { ...initial, updatedAt: serverTimestamp() });
  return initial;
};
