import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import toast from 'react-hot-toast';

// Icons
import TableRowsIcon from '@mui/icons-material/TableRows';
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from '@mui/icons-material/Add';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import UniversalSearchBar from '../../components/common/UniversalSearchBar';
import UniversalFilterBar from '../../components/common/UniversalFilterBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ProtectedPermission from '../../components/rbac/ProtectedPermission';

import BookTable from '../../components/books/BookTable';
import BookGridView from '../../components/books/BookGridView';
import BulkActionBar from '../../components/books/BulkActionBar';
import BookForm from '../../components/books/BookForm';
import BookDetailsDrawer from '../../components/books/BookDetailsDrawer';

import { useBooks } from '../../hooks/useBooks';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../models/rbacModel';
import { exportToCSV } from '../../services/exportService';

export const BooksPage = () => {
  const {
    books,
    filteredBooks,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    addBook,
    updateBook,
    archiveBook,
    restoreBook,
    deleteBook,
    duplicateBook,
    selectedBook,
    selectedBookCopies,
    drawerOpen,
    setDrawerOpen,
    formModalOpen,
    setFormModalOpen,
    editingBook,
    setEditingBook,
    selectBookForDetails,
  } = useBooks();

  // Local View Toggle State ('table' | 'grid')
  const [viewMode, setViewMode] = useState('table');

  // Multi-Select Bulk Selection State
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  // Category Options
  const categoryOptions = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Engineering',
    'Fiction',
    'Non-Fiction',
  ];

  const availabilityOptions = [
    { label: 'In Stock (Available)', value: 'In Stock' },
    { label: 'Out of Stock (Issued)', value: 'Out of Stock' },
  ];

  const sortOptions = [
    { label: 'Newest Added', value: 'Newest' },
    { label: 'Oldest', value: 'Oldest' },
    { label: 'Title (A-Z)', value: 'Alphabetical' },
    { label: 'Most Borrowed', value: 'Most Borrowed' },
  ];

  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenAddForm = () => {
    setEditingBook(null);
    setFormModalOpen(true);
  };

  const handleOpenEditForm = (book) => {
    setEditingBook(book);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData, coverFile) => {
    if (editingBook) {
      await updateBook(editingBook.id, formData, coverFile);
    } else {
      await addBook(formData, coverFile);
    }
  };

  // Bulk Selection Logic
  const handleToggleSelectBook = (id) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (pageIds) => {
    const isAllSelected = pageIds.every((id) => selectedBookIds.includes(id));
    if (isAllSelected) {
      setSelectedBookIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedBookIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedBookIds([]);
  };

  // Bulk Operations Actions
  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently delete ${selectedBookIds.length} selected books?`)) return;
    try {
      for (const id of selectedBookIds) {
        await deleteBook(id);
      }
      setSelectedBookIds([]);
      toast.success('Selected books permanently deleted.');
    } catch {
      toast.error('Failed to delete selected books.');
    }
  };

  const handleBulkArchive = async () => {
    try {
      for (const id of selectedBookIds) {
        await archiveBook(id);
      }
      setSelectedBookIds([]);
      toast.success('Selected books archived.');
    } catch {
      toast.error('Failed to archive books.');
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredBooks.filter((b) => selectedBookIds.includes(b.id));
    const exportRows = (selectedData.length > 0 ? selectedData : filteredBooks).map((b) => ({
      Title: b.title,
      Author: b.author,
      ISBN: b.isbn,
      Category: b.category,
      TotalCopies: b.totalCopies || 1,
      AvailableCopies: b.availableCopies || 0,
      Status: b.status || 'Available',
    }));
    exportToCSV(exportRows, `Books_Inventory_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Books export file generated!');
  };

  // Last Updated Timestamp
  const lastUpdated = useMemo(() => {
    if (!books || books.length === 0) return 'Just now';
    const latest = [...books].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0];
    return latest?.updatedAt ? new Date(latest.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';
  }, [books]);

  return (
    <PageContainer
      title="Books Inventory"
      subtitle={`Total Books: ${books.length} titles in catalog • Last Updated: ${lastUpdated}`}
      actions={
        <ProtectedPermission module={PERMISSION_MODULES.BOOKS} action={PERMISSION_ACTIONS.CREATE}>
          <CustomButton variant="primary" startIcon={<AddIcon />} onClick={handleOpenAddForm}>
            + Add Book
          </CustomButton>
        </ProtectedPermission>
      }
    >
      {/* 1. Universal Search Bar & View Switcher Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <UniversalSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search by Title, Author, ISBN, Category, Publisher, or Keywords..."
          width="100%"
          sx={{ flexGrow: 1 }}
        />

        {/* View Switcher (Table / Grid Toggle) */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newView) => newView && setViewMode(newView)}
          size="small"
          aria-label="View Mode Switcher"
          sx={{ backgroundColor: BORROW_COLORS.surface, alignSelf: { xs: 'flex-end', sm: 'center' } }}
        >
          <ToggleButton value="table" aria-label="Table View">
            <Tooltip title="Table View">
              <TableRowsIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Grid View">
            <Tooltip title="Grid View">
              <GridViewIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 2. Universal Filter Bar */}
      <UniversalFilterBar
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        categoryOptions={categoryOptions}
        availabilityOptions={availabilityOptions}
        sortOptions={sortOptions}
      />

      {/* 3. Main Data Content View (Table vs Grid with Skeleton Loaders) */}
      {loading ? (
        <SkeletonLoader type={viewMode === 'grid' ? 'grid' : 'table'} rows={8} count={8} />
      ) : viewMode === 'grid' ? (
        <BookGridView
          books={filteredBooks}
          selectedBookIds={selectedBookIds}
          onToggleSelectBook={handleToggleSelectBook}
          onSelectDetails={selectBookForDetails}
          onEdit={handleOpenEditForm}
          onDuplicate={duplicateBook}
          onArchive={archiveBook}
          onRestore={restoreBook}
          onDelete={deleteBook}
        />
      ) : (
        <BookTable
          onEdit={handleOpenEditForm}
          selectedBookIds={selectedBookIds}
          onToggleSelectBook={handleToggleSelectBook}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}

      {/* 4. Sticky Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedBookIds.length}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        onBulkExport={handleBulkExport}
      />

      {/* --- DRAWERS & MODALS --- */}

      {/* Add / Edit Book Dialog */}
      <BookForm
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingBook}
        isEditing={Boolean(editingBook)}
      />

      {/* Book Details Side Drawer */}
      <BookDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        book={selectedBook}
        copies={selectedBookCopies}
        onEdit={handleOpenEditForm}
        onArchive={archiveBook}
        onRestore={restoreBook}
      />
    </PageContainer>
  );
};

export default BooksPage;
