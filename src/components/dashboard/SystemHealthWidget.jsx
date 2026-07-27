import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const SystemHealthWidget = ({ status = 'Healthy', sx = {} }) => {
  const services = [
    { name: 'Firebase Auth', status: 'Online' },
    { name: 'Firestore Database', status: 'Connected' },
    { name: 'Notifications Service', status: 'Active' },
    { name: 'Cloud Storage', status: 'Operational' },
  ];

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${BORROW_COLORS.border}`,
        backgroundColor: BORROW_COLORS.surface,
        boxShadow: BORROW_COLORS.cardShadow,
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              System Operational Status
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              Infrastructure & Database Diagnostics
            </Typography>
          </Box>
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label="Overall Health: 100%"
            sx={{
              backgroundColor: BORROW_COLORS.successLight,
              color: BORROW_COLORS.success,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1.5 }}>
          {services.map((svc) => (
            <Box
              key={svc.name}
              sx={{
                p: 1.25,
                borderRadius: '8px',
                backgroundColor: BORROW_COLORS.background,
                border: `1px solid ${BORROW_COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: BORROW_COLORS.success,
                  boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)',
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary, display: 'block' }} noWrap>
                  {svc.name}
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.success, fontSize: '0.6875rem', fontWeight: 600 }}>
                  {svc.status}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SystemHealthWidget;
