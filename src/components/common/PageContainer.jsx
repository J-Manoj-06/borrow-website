import React from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const PageContainer = ({ children, title, subtitle, breadcrumbs = [], actions, sx = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1600, margin: '0 auto', ...sx }}>
        {/* Breadcrumbs if provided */}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />}
            sx={{ mb: 1.5 }}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return isLast ? (
                <Typography key={idx} variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600 }}>
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={idx}
                  underline="hover"
                  color="inherit"
                  href={crumb.path}
                  sx={{ fontSize: '0.8rem', color: BORROW_COLORS.textSecondary, fontWeight: 500 }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Page Header */}
        {(title || actions) && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 3.5,
            }}
          >
            <Box>
              {title && (
                <Typography variant="h2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>{actions}</Box>}
          </Box>
        )}

        {children}
      </Box>
    </motion.div>
  );
};

export default PageContainer;
