import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Icons
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CloseIcon from '@mui/icons-material/Close';

export const CirculationBulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  onBulkReturn,
  onBulkExport,
  onBulkPrintReceipt,
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
          {selectedCount} record{selectedCount > 1 ? 's' : ''} selected
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
        <Tooltip title="Bulk Process Check-in Returns">
          <IconButton size="small" onClick={onBulkReturn} sx={{ color: '#22C55E', '&:hover': { color: '#4ADE80' } }}>
            <AssignmentReturnOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export Circulation Log (CSV)">
          <IconButton size="small" onClick={onBulkExport} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Bulk Print Checkout Receipts">
          <IconButton size="small" onClick={onBulkPrintReceipt} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notify Students via Mobile App">
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

export default CirculationBulkActionBar;
