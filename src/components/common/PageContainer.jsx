import React from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import PageHeader from './PageHeader';

export const PageContainer = ({
  children,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  searchComponent,
  filterComponent,
  maxWidth = 1500,
  sx = {},
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, maxWidth, margin: '0 auto', ...sx }}>
        {/* Breadcrumbs if provided */}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: BORROW_COLORS.textMuted }} />}
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
                  sx={{ fontSize: '0.8125rem', color: BORROW_COLORS.textSecondary, fontWeight: 500 }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Standardized Page Header */}
        {(title || actions || searchComponent || filterComponent) && (
          <PageHeader
            title={title}
            subtitle={subtitle}
            actionButton={actions}
            searchComponent={searchComponent}
            filterComponent={filterComponent}
          />
        )}

        {children}
      </Box>
    </motion.div>
  );
};

export default PageContainer;
