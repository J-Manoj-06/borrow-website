import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const BorrowTrendChart = ({ transactions = [], sx = {} }) => {
  // Generate last 7 days data
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = days.map((date) => {
    const dateStr = date.toDateString();
    const count = transactions.filter((t) => {
      if (!t.issueDate && !t.createdAt) return false;
      const tDate = new Date(t.issueDate || t.createdAt).toDateString();
      return tDate === dateStr;
    }).length;

    return {
      date,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    };
  });

  const maxCount = Math.max(...chartData.map((d) => d.count), 5);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              Books Borrowed
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              Last 7 Days Circulation Trend
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: BORROW_COLORS.primary, backgroundColor: BORROW_COLORS.primarySurface, px: 1, py: 0.5, borderRadius: '6px' }}>
            Total: {chartData.reduce((acc, curr) => acc + curr.count, 0)} loans
          </Typography>
        </Box>

        {/* SVG/Bar Chart */}
        <Box sx={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 1.5, pt: 2, px: 1 }}>
          {chartData.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.count / maxCount) * 100));

            return (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <Tooltip title={`${item.fullDate}: ${item.count} book(s) issued`} arrow>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPercent}%`,
                      backgroundColor: item.count > 0 ? BORROW_COLORS.primary : BORROW_COLORS.borderLight,
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: BORROW_COLORS.primaryDark,
                        transform: 'scaleY(1.04)',
                      },
                    }}
                  />
                </Tooltip>

                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600, fontSize: '0.71875rem' }}>
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BorrowTrendChart;
