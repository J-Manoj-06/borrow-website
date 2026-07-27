import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const PageHeader = ({
  title,
  subtitle,
  searchComponent,
  filterComponent,
  actionButton,
  extraActions,
  sx = {},
}) => {
  return (
    <Box sx={{ mb: 3.5, ...sx }}>
      {/* Top Row: Title + Primary Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: (searchComponent || filterComponent) ? 2.5 : 0,
        }}
      >
        <Box>
          {title && (
            <Typography variant="h2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, letterSpacing: '-0.02em' }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {(actionButton || extraActions) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {extraActions}
            {actionButton}
          </Box>
        )}
      </Box>

      {/* Middle Row: Universal Search */}
      {searchComponent && <Box sx={{ mb: filterComponent ? 2 : 0 }}>{searchComponent}</Box>}

      {/* Bottom Row: Universal Filter Bar */}
      {filterComponent && <Box>{filterComponent}</Box>}
    </Box>
  );
};

export default PageHeader;
