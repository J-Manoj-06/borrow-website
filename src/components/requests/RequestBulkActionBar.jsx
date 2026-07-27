import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { BORROW_COLORS } from '../../theme/borrowTheme';

export const RequestBulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  onBulkApprove,
  onBulkReject,
  onBulkExport,
  onBulkNotify,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 24,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        py: 1.25,
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '10px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: 750,
        margin: '0 auto -20px auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.84375rem' }}>
          {selectedCount} request{selectedCount > 1 ? 's' : ''} selected
        </Typography>
        <Button
          size="small"
          onClick={onClearSelection}
          sx={{ color: '#94A3B8', fontSize: '0.75rem', textTransform: 'none', minWidth: 0, p: 0.5 }}
        >
          Deselect All
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Bulk Approve Selected Requests">
          <IconButton size="small" onClick={onBulkApprove} sx={{ color: '#22C55E', '&:hover': { color: '#4ADE80' } }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Bulk Reject Selected Requests">
          <IconButton size="small" onClick={onBulkReject} sx={{ color: '#EF4444', '&:hover': { color: '#F87171' } }}>
            <CancelOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export Requests to CSV">
          <IconButton size="small" onClick={onBulkExport} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notify Selected Students">
          <IconButton size="small" onClick={onBulkNotify} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <IconButton size="small" onClick={onClearSelection} sx={{ color: '#64748B', ml: 1 }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default RequestBulkActionBar;
