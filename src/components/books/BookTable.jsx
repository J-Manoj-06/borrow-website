import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
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
import { useBooks } from '../../hooks/useBooks';

export const BookTable = ({ onEdit }) => {
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const columns = [
    {
      id: 'coverUrl',
      label: 'Cover',
      minWidth: 70,
      format: (val, row) => (
        <Box
          sx={{
            width: 44,
            height: 60,
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#F1F5F9',
            border: `1px solid ${BORROW_COLORS.border}`,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
          }}
        >
          <img
            src={val || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
            alt={row.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ),
    },
    {
      id: 'title',
      label: 'Title & Author',
      minWidth: 260,
      format: (val, row) => (
        <Box
          onClick={() => selectBookForDetails(row)}
          sx={{ cursor: 'pointer', '&:hover': { color: BORROW_COLORS.primary } }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            by {row.author}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 160,
      format: (val) => (
        <Chip
          label={val}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.75rem', borderColor: BORROW_COLORS.border }}
        />
      ),
    },
    {
      id: 'isbn',
      label: 'ISBN',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: BORROW_COLORS.textSecondary }}>
          {val}
        </Typography>
      ),
    },
    {
      id: 'copies',
      label: 'Copies (Tot / Avail / Borr)',
      minWidth: 180,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Chip
            label={`${row.availableCopies} avail`}
            size="small"
            sx={{
              backgroundColor: row.availableCopies > 0 ? BORROW_COLORS.successLight : BORROW_COLORS.errorLight,
              color: row.availableCopies > 0 ? BORROW_COLORS.success : BORROW_COLORS.error,
              fontWeight: 700,
              fontSize: '0.725rem',
            }}
          />
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            / {row.totalCopies} total
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (val) => <StatusChip status={val} />,
    },
    {
      id: 'updatedAt',
      label: 'Last Updated',
      minWidth: 130,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
          {val ? format(new Date(val), 'dd MMM yyyy') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 70,
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
        emptyDescription="There are no books matching your current search or filter criteria."
      />

      {/* Row Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '12px',
            minWidth: 180,
            boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.12)',
            border: `1px solid ${BORROW_COLORS.border}`,
          },
        }}
      >
        <MenuItem onClick={() => handleActionClick('view')}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          View Details
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('edit')}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Edit Record
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('duplicate')}>
          <ListItemIcon><FileCopyOutlinedIcon fontSize="small" /></ListItemIcon>
          Duplicate Record
        </MenuItem>

        {activeMenuBook?.isArchived ? (
          <MenuItem onClick={() => handleActionClick('restore')} sx={{ color: BORROW_COLORS.success }}>
            <ListItemIcon><UnarchiveOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.success }} /></ListItemIcon>
            Restore Book
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleActionClick('archive')} sx={{ color: BORROW_COLORS.warning }}>
            <ListItemIcon><ArchiveOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.warning }} /></ListItemIcon>
            Archive Book
          </MenuItem>
        )}

        <MenuItem onClick={() => handleActionClick('delete')} sx={{ color: BORROW_COLORS.error }}>
          <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.error }} /></ListItemIcon>
          Delete Permanently
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Modal */}
      <CustomDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Permanent Deletion"
        subtitle={`Are you sure you want to permanently delete "${activeMenuBook?.title}" and all its physical copy records? This action cannot be undone.`}
        actions={
          <>
            <CustomButton variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="contained" color="error" onClick={handleConfirmDelete}>
              Delete Permanently
            </CustomButton>
          </>
        }
      />
    </>
  );
};

export default BookTable;
