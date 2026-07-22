import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  subscribeToSettings,
  updateSettingsSection,
  exportSettingsJSON,
  importSettingsJSON,
  resetSettingsToDefault,
} from '../services/firebase/settingsService';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_BORROW_RULES,
  DEFAULT_RETURN_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_ACADEMIC_YEARS,
} from '../models/settingsModel';
import useActivity from '../hooks/useActivity';
import { ACTIVITY_TYPES, MODULE_TYPES } from '../models/activityModel';

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: DEFAULT_GENERAL_SETTINGS,
    borrowRules: DEFAULT_BORROW_RULES,
    returnRules: DEFAULT_RETURN_RULES,
    notifications: DEFAULT_NOTIFICATION_SETTINGS,
    categories: DEFAULT_CATEGORIES,
    departments: DEFAULT_DEPARTMENTS,
    academicYears: DEFAULT_ACADEMIC_YEARS,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  const { logActivity } = useActivity();

  // Subscribe to real-time Firestore settings
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSettings((data) => {
      setSettings((prev) => ({ ...prev, ...data }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update Section Helper with Auto-Save status badge
  const updateSection = useCallback(
    async (sectionKey, newSectionData, sectionName = 'Settings') => {
      setSaveStatus('saving');
      try {
        const oldVal = settings[sectionKey];
        await updateSettingsSection(sectionKey, newSectionData);
        setSaveStatus('saved');

        // Telemetry logging
        logActivity(
          ACTIVITY_TYPES.SETTINGS_CHANGED,
          MODULE_TYPES.SETTINGS,
          `Updated ${sectionName}`,
          `SETT-${sectionKey.toUpperCase()}`,
          oldVal,
          newSectionData
        ).catch(console.warn);

        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        setSaveStatus('error');
        toast.error(`Failed to save ${sectionName}`);
      }
    },
    [settings, logActivity]
  );

  // Section Specific Savers
  const updateGeneralSettings = useCallback((data) => updateSection('general', data, 'General Library Info'), [updateSection]);
  const updateBorrowRules = useCallback((data) => updateSection('borrowRules', data, 'Borrow Loan Rules'), [updateSection]);
  const updateReturnRules = useCallback((data) => updateSection('returnRules', data, 'Return & Fine Policies'), [updateSection]);
  const updateNotificationSettings = useCallback((data) => updateSection('notifications', data, 'Notification Delivery Preferences'), [updateSection]);
  const updateCategories = useCallback((data) => updateSection('categories', data, 'Subject Categories'), [updateSection]);
  const updateDepartments = useCallback((data) => updateSection('departments', data, 'University Departments'), [updateSection]);
  const updateAcademicYears = useCallback((data) => updateSection('academicYears', data, 'Academic Years'), [updateSection]);

  // JSON Backup Actions
  const exportBackup = useCallback(() => {
    exportSettingsJSON();
    toast.success('Downloaded complete settings configuration JSON!');
  }, []);

  const importBackup = useCallback(async (jsonString) => {
    try {
      const parsed = await importSettingsJSON(jsonString);
      setSettings(parsed);
      toast.success('Successfully imported settings backup!');
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const resetDefaults = useCallback(async () => {
    const initial = await resetSettingsToDefault();
    setSettings(initial);
    toast.success('Reset system settings to factory defaults.');
  }, []);

  const value = {
    settings,
    general: settings.general || DEFAULT_GENERAL_SETTINGS,
    borrowRules: settings.borrowRules || DEFAULT_BORROW_RULES,
    returnRules: settings.returnRules || DEFAULT_RETURN_RULES,
    notifications: settings.notifications || DEFAULT_NOTIFICATION_SETTINGS,
    categories: settings.categories || DEFAULT_CATEGORIES,
    departments: settings.departments || DEFAULT_DEPARTMENTS,
    academicYears: settings.academicYears || DEFAULT_ACADEMIC_YEARS,
    loading,
    activeTab,
    setActiveTab,
    saveStatus,
    updateGeneralSettings,
    updateBorrowRules,
    updateReturnRules,
    updateNotificationSettings,
    updateCategories,
    updateDepartments,
    updateAcademicYears,
    exportBackup,
    importBackup,
    resetDefaults,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
