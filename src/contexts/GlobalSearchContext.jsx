import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import useBooks from '../hooks/useBooks';
import useStudents from '../hooks/useStudents';
import useTransactions from '../hooks/useTransactions';
import useBorrowRequests from '../hooks/useBorrowRequests';
import useNotifications from '../hooks/useNotifications';
import useActivity from '../hooks/useActivity';
import {
  searchAllModules,
  getRecentSearches,
  saveRecentSearch,
  getSavedFilters,
  saveCustomFilterPreset,
  deleteSavedFilterPreset,
} from '../services/globalSearchService';
import toast from 'react-hot-toast';

export const GlobalSearchContext = createContext(null);

export const GlobalSearchProvider = ({ children }) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [savedFiltersDialogOpen, setSavedFiltersDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [savedFilters, setSavedFilters] = useState(getSavedFilters());

  const { books } = useBooks();
  const { students } = useStudents();
  const { transactions } = useTransactions();
  const { requests } = useBorrowRequests();
  const { notifications } = useNotifications();
  const { activities } = useActivity();

  // Listen to Global Ctrl + K or Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live search results across all modules
  const searchResults = useMemo(() => {
    return searchAllModules(searchQuery, {
      books,
      students,
      requests,
      transactions,
      notifications,
      activities,
    });
  }, [searchQuery, books, students, requests, transactions, notifications, activities]);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const handleSelectRecentSearch = useCallback((queryStr) => {
    setSearchQuery(queryStr);
  }, []);

  const handleCommitSearch = useCallback((queryStr) => {
    saveRecentSearch(queryStr);
    setRecentSearches(getRecentSearches());
  }, []);

  const handleCreateSavedFilter = useCallback((name, module, criteria) => {
    const updated = saveCustomFilterPreset(name, module, criteria);
    setSavedFilters(updated);
    toast.success(`Saved custom filter preset "${name}"!`);
  }, []);

  const handleDeleteSavedFilter = useCallback((id) => {
    const updated = deleteSavedFilterPreset(id);
    setSavedFilters(updated);
    toast.success('Removed saved filter preset.');
  }, []);

  const value = {
    commandPaletteOpen,
    setCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    searchQuery,
    setSearchQuery,
    searchResults,
    recentSearches,
    selectRecentSearch: handleSelectRecentSearch,
    commitSearch: handleCommitSearch,
    savedFilters,
    savedFiltersDialogOpen,
    setSavedFiltersDialogOpen,
    createSavedFilter: handleCreateSavedFilter,
    deleteSavedFilter: handleDeleteSavedFilter,
  };

  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>;
};
