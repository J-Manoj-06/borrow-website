import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';

// Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const BookGridView = ({
  books = [],
  selectedBookIds = [],
  onToggleSelectBook,
  onSelectDetails,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  onIssue,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuBook, setActiveMenuBook] = useState(null);

  const handleMenuOpen = (event, book) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveMenuBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuBook(null);
  };

  const handleAction = (action) => {
    const book = activeMenuBook;
    handleMenuClose();
    if (!book) return;

    if (action === 'view') onSelectDetails(book);
    else if (action === 'edit') onEdit(book);
    else if (action === 'duplicate') onDuplicate(book);
    else if (action === 'archive') onArchive(book.id);
    else if (action === 'restore') onRestore(book.id);
    else if (action === 'delete') onDelete(book);
    else if (action === 'issue') onIssue && onIssue(book);
  };

  return (
    <>
      <Grid container spacing={2.5}>
        {books.map((book) => {
          const isSelected = selectedBookIds.includes(book.id);
          const isAvailable = (book.availableCopies ?? 0) > 0;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${BORROW_COLORS.primary}` : `1px solid ${BORROW_COLORS.border}`,
                  backgroundColor: BORROW_COLORS.surface,
                  boxShadow: BORROW_COLORS.cardShadow,
                  transition: 'all 0.15s ease-in-out',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: BORROW_COLORS.cardShadowHover,
                  },
                }}
              >
                {/* Selection Checkbox Header */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '6px',
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onToggleSelectBook(book.id)}
                    sx={{ p: 0.5, color: BORROW_COLORS.textMuted }}
                  />
                </Box>

                {/* Cover Image & Availability Status Badge */}
                <Box
                  onClick={() => onSelectDetails(book)}
                  sx={{
                    height: 180,
                    backgroundColor: '#F1F5F9',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={book.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                    alt={book.title}
                    sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                  />

                  <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                    <StatusBadge status={isAvailable ? 'Available' : 'Borrowed'} size="small" />
                  </Box>
                </Box>

                {/* Book Details */}
                <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box
                        onClick={() => onSelectDetails(book)}
                        sx={{ cursor: 'pointer', flexGrow: 1, minWidth: 0, '&:hover': { color: BORROW_COLORS.primary } }}
                      >
                        <Typography variant="h5" noWrap sx={{ fontWeight: 700, fontSize: '0.9375rem', color: BORROW_COLORS.textPrimary }}>
                          {book.title}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                          by {book.author || 'Unknown Author'}
                        </Typography>
                      </Box>

                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, book)} sx={{ p: 0.25, color: BORROW_COLORS.textMuted }}>
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>

                    <Typography variant="caption" sx={{ mt: 1, display: 'inline-block', px: 1, py: 0.25, borderRadius: '4px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}`, color: BORROW_COLORS.textSecondary, fontWeight: 600, fontSize: '0.6875rem' }}>
                      {book.category || 'General'}
                    </Typography>
                  </Box>

                  {/* Copy Counts & Quick Buttons */}
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORROW_COLORS.border}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
                        Copies
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: isAvailable ? BORROW_COLORS.success : BORROW_COLORS.warning }}>
                        {book.availableCopies ?? 0} / {book.totalCopies ?? 1} available
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <CustomButton
                        variant="secondary"
                        size="small"
                        onClick={() => onSelectDetails(book)}
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{ flex: 1 }}
                      >
                        View
                      </CustomButton>

                      <CustomButton
                        variant="outline"
                        size="small"
                        onClick={() => onEdit(book)}
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{ flex: 1 }}
                      >
                        Edit
                      </CustomButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Row / Card Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '8px',
            minWidth: 160,
            boxShadow: BORROW_COLORS.cardShadowHover,
            border: `1px solid ${BORROW_COLORS.border}`,
          },
        }}
      >
        <MenuItem onClick={() => handleAction('view')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          View Details
        </MenuItem>

        <MenuItem onClick={() => handleAction('edit')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Edit Record
        </MenuItem>

        <MenuItem onClick={() => handleAction('duplicate')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><FileCopyOutlinedIcon fontSize="small" /></ListItemIcon>
          Duplicate
        </MenuItem>

        {activeMenuBook?.isArchived ? (
          <MenuItem onClick={() => handleAction('restore')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.success }}>
            <ListItemIcon><UnarchiveOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.success }} /></ListItemIcon>
            Restore
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction('archive')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.warning }}>
            <ListItemIcon><ArchiveOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.warning }} /></ListItemIcon>
            Archive
          </MenuItem>
        )}

        <MenuItem onClick={() => handleAction('delete')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.error }}>
          <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.error }} /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default BookGridView;
