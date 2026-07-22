import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
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
const LOCAL_SETTINGS_KEY = 'borrow_admin_local_settings_config';

const getInitialCombinedSettings = () => ({
  general: DEFAULT_GENERAL_SETTINGS,
  borrowRules: DEFAULT_BORROW_RULES,
  returnRules: DEFAULT_RETURN_RULES,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  categories: DEFAULT_CATEGORIES,
  departments: DEFAULT_DEPARTMENTS,
  academicYears: DEFAULT_ACADEMIC_YEARS,
});

const getLocalSettings = () => {
  const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getInitialCombinedSettings();
    }
  }
  const initial = getInitialCombinedSettings();
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(initial));
  return initial;
};

/**
 * Subscribe to Real-Time Settings Snapshot
 */
export const subscribeToSettings = (callback) => {
  if (isFirebaseConfigured) {
    try {
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
          console.warn('Firestore settings snapshot error, using local fallback:', error);
          callback(getLocalSettings());
        }
      );
    } catch (err) {
      console.warn('Firestore settings subscription failed:', err);
    }
  }

  callback(getLocalSettings());
  return () => {};
};

/**
 * Save Specific Settings Section
 */
export const updateSettingsSection = async (sectionKey, newSectionData) => {
  const current = getLocalSettings();
  const updatedAll = {
    ...current,
    [sectionKey]: newSectionData,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, SETTINGS_DOC_PATH);
      await setDoc(docRef, updatedAll, { merge: true });
    } catch (err) {
      console.warn('Firestore update settings section failed:', err);
    }
  }

  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updatedAll));
  return updatedAll;
};

/**
 * Export Complete Configuration JSON
 */
export const exportSettingsJSON = () => {
  const data = getLocalSettings();
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
 * Import Settings JSON
 */
export const importSettingsJSON = async (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (isFirebaseConfigured) {
      const docRef = doc(db, SETTINGS_DOC_PATH);
      await setDoc(docRef, parsed, { merge: true });
    }
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    throw new Error('Invalid JSON settings backup file formatting.');
  }
};

/**
 * Reset Settings to Factory Defaults
 */
export const resetSettingsToDefault = async () => {
  const initial = getInitialCombinedSettings();
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, SETTINGS_DOC_PATH);
      await setDoc(docRef, initial);
    } catch (err) {
      console.warn('Firestore reset settings failed:', err);
    }
  }
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(initial));
  return initial;
};
