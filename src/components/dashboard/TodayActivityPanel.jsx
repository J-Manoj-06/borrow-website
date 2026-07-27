import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const TodayActivityPanel = ({
  todayIssues = 0,
  todayReturns = 0,
  todayStudents = 0,
  pendingRequests = 0,
  sx = {},
}) => {
  const metrics = [
    {
      title: 'Issued Today',
      value: todayIssues,
      icon: MenuBookIcon,
      bgColor: BORROW_COLORS.primarySurface,
      color: BORROW_COLORS.primary,
    },
    {
      title: 'Returned Today',
      value: todayReturns,
      icon: AssignmentReturnIcon,
      bgColor: BORROW_COLORS.successLight,
      color: BORROW_COLORS.success,
    },
    {
      title: 'New Students',
      value: todayStudents,
      icon: PeopleIcon,
      bgColor: 'rgba(139, 92, 246, 0.1)',
      color: '#8B5CF6',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: PendingActionsIcon,
      bgColor: BORROW_COLORS.warningLight,
      color: BORROW_COLORS.warning,
    },
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
          Today's Operational Summary
        </Typography>
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mb: 2 }}>
          Activity performed during current shift
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Box
                key={m.title}
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: BORROW_COLORS.background,
                  border: `1px solid ${BORROW_COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '6px',
                    backgroundColor: m.bgColor,
                    color: m.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>

                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.125rem', color: BORROW_COLORS.textPrimary, lineHeight: 1.1 }}>
                    {m.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontSize: '0.71875rem' }}>
                    {m.title}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TodayActivityPanel;
