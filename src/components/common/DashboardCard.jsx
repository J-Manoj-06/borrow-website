import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { BORROW_COLORS } from '../../theme/borrowTheme';

const MotionCard = motion.create(Card);

export const DashboardCard = ({
  title,
  value,
  subtitle,
  trend,
  trendIsPositive = true,
  icon: Icon,
  iconBgColor = 'rgba(37, 99, 235, 0.1)',
  iconColor = BORROW_COLORS.primary,
  onClick,
}) => {
  return (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        background: BORROW_COLORS.surface,
        borderRadius: '16px',
        border: `1px solid ${BORROW_COLORS.border}`,
        p: 0.5,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: BORROW_COLORS.textSecondary }}>
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: iconBgColor,
                color: iconColor,
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Box>
          )}
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 1 }}>
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend && (
            <Chip
              size="small"
              icon={trendIsPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
              label={trend}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                backgroundColor: trendIsPositive ? BORROW_COLORS.successLight : BORROW_COLORS.errorLight,
                color: trendIsPositive ? BORROW_COLORS.success : BORROW_COLORS.error,
                '& .MuiChip-icon': {
                  color: trendIsPositive ? BORROW_COLORS.success : BORROW_COLORS.error,
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
      </CardContent>
    </MotionCard>
  );
};

export default DashboardCard;
