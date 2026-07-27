import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const DashboardCard = ({
  title,
  value,
  subtitle,
  trend,
  trendIsPositive = true,
  icon: Icon,
  iconBgColor = BORROW_COLORS.primarySurface,
  iconColor = BORROW_COLORS.primary,
  onClick,
  sx = {},
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BORROW_COLORS.surface,
        borderRadius: '12px',
        border: `1px solid ${BORROW_COLORS.border}`,
        boxShadow: BORROW_COLORS.cardShadow,
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          borderColor: '#CBD5E1',
          boxShadow: BORROW_COLORS.cardShadowHover,
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: BORROW_COLORS.textSecondary }}>
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: iconBgColor,
                color: iconColor,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
          )}
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 1, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>

        {(trend || subtitle) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {trend && (
              <Chip
                size="small"
                icon={trendIsPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                label={trend}
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: trendIsPositive ? BORROW_COLORS.successLight : BORROW_COLORS.errorLight,
                  color: trendIsPositive ? BORROW_COLORS.success : BORROW_COLORS.error,
                  '& .MuiChip-icon': {
                    color: trendIsPositive ? BORROW_COLORS.success : BORROW_COLORS.error,
                    fontSize: 14,
                  },
                }}
              />
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
