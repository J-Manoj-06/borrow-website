import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Icons
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { BORROW_COLORS } from '../../theme/borrowTheme';

export const BulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
  onBulkArchive,
  onBulkPrintQR,
  onBulkChangeCategory,
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
        maxWidth: 800,
        margin: '0 auto -20px auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.84375rem' }}>
          {selectedCount} book{selectedCount > 1 ? 's' : ''} selected
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
        <Tooltip title="Export Selected Books (CSV)">
          <IconButton size="small" onClick={onBulkExport} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Print QR Stickers">
          <IconButton size="small" onClick={onBulkPrintQR} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <QrCode2OutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Change Category">
          <IconButton size="small" onClick={onBulkChangeCategory} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <CategoryOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Archive Selected">
          <IconButton size="small" onClick={onBulkArchive} sx={{ color: '#F59E0B', '&:hover': { color: '#FBBF24' } }}>
            <ArchiveOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Selected Permanently">
          <IconButton size="small" onClick={onBulkDelete} sx={{ color: '#EF4444', '&:hover': { color: '#F87171' } }}>
            <DeleteForeverOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <IconButton size="small" onClick={onClearSelection} sx={{ color: '#64748B', ml: 1 }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default BulkActionBar;
