import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import BookStatistics from '../../components/books/BookStatistics';
import BookTable from '../../components/books/BookTable';
import BookForm from '../../components/books/BookForm';
import BookDetailsDrawer from '../../components/books/BookDetailsDrawer';
import BookFilters from '../../components/books/BookFilters';
import ProtectedPermission from '../../components/rbac/ProtectedPermission';
import { useBooks } from '../../hooks/useBooks';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../models/rbacModel';

export const BooksPage = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterOptions,
    resetFilters,
    addBook,
    updateBook,
    archiveBook,
    restoreBook,
    selectedBook,
    selectedBookCopies,
    drawerOpen,
    setDrawerOpen,
    formModalOpen,
    setFormModalOpen,
    editingBook,
    setEditingBook,
  } = useBooks();

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeFilterCount = Object.values(filterOptions).filter(
    (v) => v !== 'All' && v !== 'Newest' && v !== false
  ).length;

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

  return (
    <PageContainer
      title="Book Inventory"
      subtitle="Manage your complete library inventory, ISBN records, physical copy counts, and mobile app synchronization."
      actions={
        <ProtectedPermission module={PERMISSION_MODULES.BOOKS} action={PERMISSION_ACTIONS.CREATE}>
          <CustomButton variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddForm}>
            + Add Book
          </CustomButton>
        </ProtectedPermission>
      }
    >
      {/* 1. Inventory Metric Cards */}
      <BookStatistics />

      {/* 2. Search & Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          backgroundColor: BORROW_COLORS.surface,
          p: 2,
          borderRadius: '16px',
          border: `1px solid ${BORROW_COLORS.border}`,
          boxShadow: BORROW_COLORS.cardShadow,
        }}
      >
        {/* Instant Search Bar */}
        <TextField
          placeholder="Search by Title, Author, ISBN, Category, Publisher, or Keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: BORROW_COLORS.primary }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Toggle & Reset */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <CustomButton
            variant="outlined"
            startIcon={
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterListIcon />
              </Badge>
            }
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ borderColor: BORROW_COLORS.border }}
          >
            Filters
          </CustomButton>

          {(searchQuery || activeFilterCount > 0) && (
            <CustomButton variant="text" startIcon={<RestartAltIcon />} onClick={resetFilters}>
              Clear Search
            </CustomButton>
          )}
        </Box>
      </Box>

      {/* 3. Main Book Inventory Data Table */}
      <BookTable onEdit={handleOpenEditForm} />

      {/* --- MODALS & DRAWERS --- */}

      {/* Add / Edit Book Fullscreen Form Dialog */}
      <BookForm
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingBook}
        isEditing={Boolean(editingBook)}
      />

      {/* Book Details & Physical Copies Slide-Over Drawer */}
      <BookDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        book={selectedBook}
        copies={selectedBookCopies}
        onEdit={handleOpenEditForm}
        onArchive={archiveBook}
        onRestore={restoreBook}
      />

      {/* Filter Bottom Sheet / Right Drawer */}
      <BookFilters open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
    </PageContainer>
  );
};

export default BooksPage;
