import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { StatusChip } from '../common/CustomTable';

export const CopyHistoryDrawer = ({ open, onClose, copy }) => {
  if (!copy) return null;

  const copyId = copy.copyId || copy.id;

  const sampleHistory = [
    {
      event: 'Physical Copy Created & QR Code Generated',
      timestamp: copy.createdAt || new Date('2024-01-15').toISOString(),
      actor: 'System Admin',
    },
    {
      event: 'Checked Out to Student (Alex Rivera)',
      timestamp: new Date('2024-07-21T17:00:00').toISOString(),
      actor: 'Lead Librarian Admin',
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          p: 0,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2Icon sx={{ color: BORROW_COLORS.primary }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
              Physical Copy Audit History
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, fontFamily: 'monospace' }}>
              {copyId}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, overflowY: 'auto' }}>
        {/* Status Card */}
        <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>CURRENT STATUS</Typography>
            <Box sx={{ mt: 0.5 }}>
              <StatusChip status={copy.status || 'Available'} />
            </Box>
          </Box>

          <Chip label={`Condition: ${copy.condition || 'New'}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
        </Box>

        {/* History Timeline */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1.5, display: 'block' }}>
            LIFECYCLE TIMELINE LOGS
          </Typography>

          <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
            {sampleHistory.map((hist, idx) => (
              <Box key={idx} sx={{ mb: idx === sampleHistory.length - 1 ? 0 : 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                  {hist.event}
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                  {format(new Date(hist.timestamp), 'dd MMM yyyy, hh:mm a')} • By {hist.actor}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CopyHistoryDrawer;
