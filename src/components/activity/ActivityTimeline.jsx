import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import format from 'date-fns/format';
import { motion } from 'framer-motion';
import { useActivity } from '../../hooks/useActivity';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const ActivityTimeline = () => {
  const { activities, selectActivityForDetails } = useActivity();

  // Group activities into Today, Yesterday, Last Week, Older
  const todayStr = new Date().toDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toDateString();

  const groups = {
    Today: [],
    Yesterday: [],
    'Earlier This Week': [],
    Older: [],
  };

  activities.forEach((act) => {
    const actDate = new Date(act.createdAt || Date.now());
    const dateStr = actDate.toDateString();

    if (dateStr === todayStr) {
      groups.Today.push(act);
    } else if (dateStr === yesterdayStr) {
      groups.Yesterday.push(act);
    } else if (Date.now() - actDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      groups['Earlier This Week'].push(act);
    } else {
      groups.Older.push(act);
    }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Object.entries(groups).map(([groupTitle, items]) => {
        if (items.length === 0) return null;

        return (
          <Box key={groupTitle}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.primary, mb: 2 }}>
              {groupTitle} ({items.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((act, idx) => (
                <motion.div
                  key={act.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card
                    onClick={() => selectActivityForDetails(act)}
                    sx={{
                      cursor: 'pointer',
                      border: `1px solid ${BORROW_COLORS.border}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: BORROW_COLORS.primary,
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={act.activityType}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 800, fontSize: '0.725rem' }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                            {act.affectedDocumentName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
                          {act.createdAt ? format(new Date(act.createdAt), 'hh:mm:ss a') : ''}
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                        Performed by <strong>{act.performedBy}</strong> ({act.adminEmail}) • Module: {act.module}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActivityTimeline;
