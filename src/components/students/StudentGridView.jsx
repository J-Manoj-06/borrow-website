import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';

// Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const StudentGridView = ({
  students = [],
  selectedIds = [],
  onToggleSelect,
  onSelectProfile,
  onIssueBook,
  onEdit,
  onNotify,
  onToggleBlock,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuStudent, setActiveMenuStudent] = useState(null);

  const handleMenuOpen = (event, student) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveMenuStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuStudent(null);
  };

  const handleAction = (action) => {
    const student = activeMenuStudent;
    handleMenuClose();
    if (!student) return;

    if (action === 'view') onSelectProfile(student);
    else if (action === 'issue') onIssueBook(student);
    else if (action === 'edit') onEdit(student);
    else if (action === 'notify') onNotify(student);
    else if (action === 'block') onToggleBlock(student);
    else if (action === 'delete') onDelete(student);
  };

  return (
    <>
      <Grid container spacing={2.5}>
        {students.map((st) => {
          const isSelected = selectedIds.includes(st.id);
          const activeLoans = st.borrowedCount || 0;
          const status = st.hasOverdue ? 'Overdue' : st.computedStatus || st.status || 'Active';

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={st.id}>
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
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onToggleSelect(st.id)}
                    sx={{ p: 0.5, color: BORROW_COLORS.textMuted }}
                  />
                </Box>

                <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    {/* Header Action & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, pl: 4 }}>
                      <StatusBadge status={status} size="small" />
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, st)} sx={{ p: 0.25, color: BORROW_COLORS.textMuted }}>
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>

                    {/* Student Info */}
                    <Box
                      onClick={() => onSelectProfile(st)}
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', mb: 1.5 }}
                    >
                      <Avatar
                        src={st.avatarUrl || ''}
                        alt={st.fullName || st.name}
                        sx={{ width: 56, height: 56, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '1.25rem', mb: 1 }}
                      >
                        {(st.fullName || st.name || 'S')[0]}
                      </Avatar>

                      <Typography variant="h6" noWrap sx={{ fontWeight: 600, fontSize: '0.9375rem', color: BORROW_COLORS.textPrimary, width: '100%' }}>
                        {st.fullName || st.name}
                      </Typography>

                      <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                        Reg No: {st.registerNumber}
                      </Typography>

                      <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mt: 0.25 }}>
                        {st.department || 'Computer Science'} • Year {st.year || '3'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Active Books Pill & Quick Action Buttons */}
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${BORROW_COLORS.border}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
                        Active Loans
                      </Typography>
                      <StatusBadge status={activeLoans > 0 ? 'Borrowed' : 'Available'} label={`${activeLoans} active books`} size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <CustomButton
                        variant="secondary"
                        size="small"
                        onClick={() => onSelectProfile(st)}
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{ flex: 1 }}
                      >
                        Profile
                      </CustomButton>

                      <CustomButton
                        variant="outline"
                        size="small"
                        onClick={() => onIssueBook(st)}
                        startIcon={<MenuBookOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{ flex: 1 }}
                      >
                        Issue
                      </CustomButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Row / Card Context Menu */}
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
        <MenuItem onClick={() => handleAction('view')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          View Profile
        </MenuItem>

        <MenuItem onClick={() => handleAction('issue')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><MenuBookOutlinedIcon fontSize="small" /></ListItemIcon>
          Issue Book
        </MenuItem>

        <MenuItem onClick={() => handleAction('notify')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><NotificationsOutlinedIcon fontSize="small" /></ListItemIcon>
          Send Notification
        </MenuItem>

        <MenuItem onClick={() => handleAction('edit')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Edit Details
        </MenuItem>

        <MenuItem onClick={() => handleAction('block')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.warning }}>
          <ListItemIcon><BlockOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.warning }} /></ListItemIcon>
          {activeMenuStudent?.computedStatus === 'Blocked' ? 'Unblock Student' : 'Deactivate / Block'}
        </MenuItem>

        <MenuItem onClick={() => handleAction('delete')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.error }}>
          <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.error }} /></ListItemIcon>
          Delete Member
        </MenuItem>
      </Menu>
    </>
  );
};

export default StudentGridView;
