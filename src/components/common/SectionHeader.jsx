import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const SectionHeader = ({ title, subtitle, action, sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        ...sx,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default SectionHeader;
