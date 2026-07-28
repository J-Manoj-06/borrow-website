import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
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
import CustomTable from '../common/CustomTable';
import StatusBadge from '../common/StatusBadge';
import { useStudents } from '../../hooks/useStudents';

export const StudentTable = ({
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onIssueBook,
  onEdit,
  onNotify,
  onToggleBlock,
  onDelete,
}) => {
  const {
    filteredStudents,
    loading,
    selectStudentForProfile,
  } = useStudents();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
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

  const handleActionClick = (action) => {
    const student = activeMenuStudent;
    handleMenuClose();
    if (!student) return;

    if (action === 'view') selectStudentForProfile(student);
    else if (action === 'issue') onIssueBook && onIssueBook(student);
    else if (action === 'edit') onEdit && onEdit(student);
    else if (action === 'notify') onNotify && onNotify(student);
    else if (action === 'block') onToggleBlock && onToggleBlock(student);
    else if (action === 'delete') onDelete && onDelete(student);
  };

  const allPageIds = filteredStudents.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((s) => s.id);
  const isAllPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const columns = [
    {
      id: 'select',
      label: (
        <Checkbox
          size="small"
          checked={isAllPageSelected}
          indeterminate={selectedIds.length > 0 && !isAllPageSelected}
          onChange={() => onToggleSelectAll && onToggleSelectAll(allPageIds)}
          sx={{ p: 0, color: BORROW_COLORS.textMuted }}
        />
      ),
      minWidth: 40,
      width: 40,
      format: (_, row) => (
        <Checkbox
          size="small"
          checked={selectedIds.includes(row.id)}
          onChange={() => onToggleSelect && onToggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 0, color: BORROW_COLORS.textMuted }}
        />
      ),
    },
    {
      id: 'fullName',
      label: 'Student Member',
      minWidth: 200,
      format: (val, row) => (
        <Box
          onClick={() => selectStudentForProfile(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
        >
          <Avatar
            src={row.avatarUrl || ''}
            alt={val || row.name}
            sx={{ width: 34, height: 34, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {(val || row.name || 'S')[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.84375rem', color: BORROW_COLORS.textPrimary }}>
              {val || row.name}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
              Reg No: {row.registerNumber}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'department',
      label: 'Department & Year',
      minWidth: 180,
      format: (val, row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
            {val || 'Computer Science'}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            Year {row.year || '3'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Contact Email',
      minWidth: 180,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
          {val || 'student@borrow.edu'}
        </Typography>
      ),
    },
    {
      id: 'borrowedCount',
      label: 'Active Loans',
      minWidth: 110,
      format: (val, row) => {
        const count = val || 0;
        const status = row.hasOverdue ? 'Overdue' : count > 0 ? 'Borrowed' : 'Available';
        return <StatusBadge status={status} label={`${count} active`} size="small" />;
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (_, row) => <StatusBadge status={row.computedStatus || row.status || 'Active'} size="small" />,
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
        data={filteredStudents}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyType="students"
        emptyTitle="No Students Found"
        emptyDescription="Registered students will appear here automatically when they sign up in the mobile app."
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
          View Profile
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('issue')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><MenuBookOutlinedIcon fontSize="small" /></ListItemIcon>
          Issue Book
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('notify')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><NotificationsOutlinedIcon fontSize="small" /></ListItemIcon>
          Send Notification
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('edit')} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Edit Details
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('block')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.warning }}>
          <ListItemIcon><BlockOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.warning }} /></ListItemIcon>
          {activeMenuStudent?.computedStatus === 'Blocked' ? 'Unblock Student' : 'Deactivate / Block'}
        </MenuItem>

        <MenuItem onClick={() => handleActionClick('delete')} sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.error }}>
          <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" sx={{ color: BORROW_COLORS.error }} /></ListItemIcon>
          Delete Member
        </MenuItem>
      </Menu>
    </>
  );
};

export default StudentTable;
