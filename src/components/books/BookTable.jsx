import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomTable, { StatusChip } from '../common/CustomTable';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import StatusBadge from '../common/StatusBadge';
import SmartImage from '../common/SmartImage';
import { useBooks } from '../../hooks/useBooks';

export const BookTable = ({
  onEdit,
  selectedBookIds = [],
  onToggleSelectBook,
  onToggleSelectAll,
}) => {
  const {
    filteredBooks,
    loading,
    selectBookForDetails,
    archiveBook,
    restoreBook,
    deleteBook,
    duplicateBook,
  } = useBooks();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuBook, setActiveMenuBook] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleMenuOpen = (event, book) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveMenuBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuBook(null);
  };

  const handleActionClick = (action) => {
    const targetBook = activeMenuBook;
    handleMenuClose();

    if (!targetBook) return;

    if (action === 'view') {
      selectBookForDetails(targetBook);
    } else if (action === 'edit') {
      onEdit(targetBook);
    } else if (action === 'duplicate') {
      duplicateBook(targetBook);
    } else if (action === 'archive') {
      archiveBook(targetBook.id);
    } else if (action === 'restore') {
      restoreBook(targetBook.id);
    } else if (action === 'delete') {
      setActiveMenuBook(targetBook);
      setDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (activeMenuBook) {
      deleteBook(activeMenuBook.id);
    }
    setDeleteConfirmOpen(false);
    setActiveMenuBook(null);
  };

  const allPageIds = filteredBooks.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((b) => b.id);
  const isAllPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedBookIds.includes(id));

  const columns = [
    {
      id: 'select',
      label: (
        <Checkbox
          size="small"
          checked={isAllPageSelected}
          indeterminate={selectedBookIds.length > 0 && !isAllPageSelected}
          onChange={() => onToggleSelectAll && onToggleSelectAll(allPageIds)}
          sx={{ p: 0, color: BORROW_COLORS.textMuted }}
        />
      ),
      minWidth: 40,
      width: 40,
      format: (_, row) => (
        <Checkbox
          size="small"
          checked={selectedBookIds.includes(row.id)}
          onChange={() => onToggleSelectBook && onToggleSelectBook(row.id)}
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 0, color: BORROW_COLORS.textMuted }}
        />
      ),
    },
    {
      id: 'coverUrl',
      label: 'Cover',
      minWidth: 60,
      format: (val, row) => (
        <Box
          sx={{
            width: 36,
            height: 48,
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#F1F5F9',
            border: `1px solid ${BORROW_COLORS.border}`,
          }}
        >
          <SmartImage
            src={val}
            alt={row.title}
            preset="thumbnail"
            fallbackType="bookCover"
            width={36}
            height={48}
          />
        </Box>
      ),
    },
    {
      id: 'title',
      label: 'Title & Author',
      minWidth: 240,
      format: (val, row) => (
        <Box
          onClick={() => selectBookForDetails(row)}
          sx={{ cursor: 'pointer', '&:hover': { color: BORROW_COLORS.primary } }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            by {row.author || 'Unknown Author'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: '4px', border: `1px solid ${BORROW_COLORS.border}`, backgroundColor: BORROW_COLORS.background, fontWeight: 600, color: BORROW_COLORS.textSecondary }}>
          {val || 'General'}
        </Typography>
      ),
    },
    {
      id: 'isbn',
      label: 'ISBN',
      minWidth: 130,
      format: (val) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, color: BORROW_COLORS.textSecondary }}>
          {val}
        </Typography>
      ),
    },
    {
      id: 'copies',
      label: 'Copies (Avail / Total)',
      minWidth: 160,
      format: (_, row) => {
        const avail = row.availableCopies ?? 0;
        const total = row.totalCopies ?? 1;
        return (
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            <StatusBadge status={avail > 0 ? 'Available' : 'Borrowed'} label={`${avail} avail`} size="small" />
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              / {total}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (val) => <StatusBadge status={val || 'Available'} size="small" />,
    },
    {
      id: 'updatedAt',
      label: 'Last Updated',
      minWidth: 120,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
          {val ? format(new Date(val), 'dd MMM yyyy') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 60,
      align: 'right',
      format: (_, row) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <CustomTable
        columns={columns}
        data={filteredBooks}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyType="books"
        emptyTitle="No Books Found"
        emptyDescription="There are no books matching your current search or active filters."
      />

      {/* Row Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '8px',
            minWidth: 170,
            boxShadow: BORROW_COLORS.cardShadowHover,
            border: `1px solid ${BORROW_COLORS.border}`,
          },
        }}
      >
        <MenuItem onClick={() => handleActionClick('view')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          View Details
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('edit')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Edit Record
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('duplicate')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><FileCopyOutlinedIcon fontSize="small" /></ListItemIcon>
          Duplicate Record
        </MenuItem>

        {activeMenuBook?.isArchived ? (
          <MenuItem onClick={() => handleActionClick('restore')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.success }}>
            <ListItemIcon><UnarchiveOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.success }} /></ListItemIcon>
            Restore Book
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleActionClick('archive')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.warning }}>
            <ListItemIcon><ArchiveOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.warning }} /></ListItemIcon>
            Archive Book
          </MenuItem>
        )}

        <MenuItem onClick={() => handleActionClick('delete')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.error }}>
          <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.error }} /></ListItemIcon>
          Delete Permanently
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <CustomDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Permanent Deletion"
        subtitle={`Are you sure you want to permanently delete "${activeMenuBook?.title}" and all its physical copy records? This action cannot be undone.`}
        actions={
          <>
            <CustomButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="danger" onClick={handleConfirmDelete}>
              Delete Permanently
            </CustomButton>
          </>
        }
      />
    </>
  );
};

export default BookTable;
