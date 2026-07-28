import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import HistoryIcon from '@mui/icons-material/History';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';

export const RecentScansPanel = ({ recentScans = [], onReopenScan, sx = {} }) => {
  if (recentScans.length === 0) return null;

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${BORROW_COLORS.border}`,
        backgroundColor: BORROW_COLORS.surface,
        boxShadow: BORROW_COLORS.cardShadow,
        mt: 3,
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <HistoryIcon sx={{ fontSize: 18, color: BORROW_COLORS.textMuted }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
            Recent Scans History
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {recentScans.slice(0, 5).map((scan, idx) => (
            <Box
              key={idx}
              onClick={() => onReopenScan && onReopenScan(scan)}
              sx={{
                p: 1.25,
                borderRadius: '8px',
                backgroundColor: BORROW_COLORS.background,
                border: `1px solid ${BORROW_COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                '&:hover': {
                  borderColor: BORROW_COLORS.primary,
                  backgroundColor: BORROW_COLORS.primarySurface,
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem', color: BORROW_COLORS.textPrimary }}>
                  {scan.bookTitle || scan.studentName || scan.copyId}
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>
                  {scan.copyId || scan.registerNumber} • {scan.scannedTime ? new Date(scan.scannedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </Typography>
              </Box>

              <StatusBadge status={scan.status || 'Verified'} size="small" />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentScansPanel;
