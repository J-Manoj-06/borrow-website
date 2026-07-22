import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useAnalytics } from '../../hooks/useAnalytics';

export const AnalyticsCharts = () => {
  const { monthlyTrends, categoryReport, departmentReport } = useAnalytics();

  // Find max value for monthly chart scaling
  const maxMonthlyVal = Math.max(
    ...monthlyTrends.map((m) => Math.max(m.issued, m.returned, m.requests)),
    10
  );

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Chart 1: Monthly Circulation Trends */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ height: '100%', p: 1 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                  Monthly Circulation Activity
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                  Books issued vs. returned vs. requests over the past 6 months
                </Typography>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: BORROW_COLORS.primary }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Issued</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: BORROW_COLORS.success }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Returned</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: BORROW_COLORS.warning }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Requests</Typography>
                </Box>
              </Box>
            </Box>

            {/* Custom Bar Graph Visualizer */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 220, pt: 2, px: 2, borderBottom: `1px solid ${BORROW_COLORS.border}` }}>
              {monthlyTrends.map((m, idx) => {
                const issuedPct = (m.issued / maxMonthlyVal) * 100;
                const returnedPct = (m.returned / maxMonthlyVal) * 100;
                const reqPct = (m.requests / maxMonthlyVal) * 100;

                return (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 180 }}>
                      {/* Issued Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(issuedPct, 5)}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        style={{
                          width: 14,
                          background: BORROW_COLORS.primaryGradient,
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                      {/* Returned Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(returnedPct, 5)}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 + 0.1 }}
                        style={{
                          width: 14,
                          backgroundColor: BORROW_COLORS.success,
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                      {/* Requests Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(reqPct, 5)}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 + 0.2 }}
                        style={{
                          width: 14,
                          backgroundColor: BORROW_COLORS.warning,
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, color: BORROW_COLORS.textSecondary }}>
                      {m.month}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Chart 2: Category Popularity Breakdown */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ height: '100%', p: 1 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
              Top Borrowed Categories
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mb: 3 }}>
              Popularity share percentage across library subjects
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {categoryReport.slice(0, 5).map((cat, idx) => (
                <Box key={cat.category}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                      {cat.category}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>
                      {cat.popularityPercentage}% ({cat.borrowedCopies} borrowed)
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={cat.popularityPercentage || 10}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background:
                          idx === 0
                            ? BORROW_COLORS.primaryGradient
                            : idx === 1
                            ? 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)'
                            : 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AnalyticsCharts;
