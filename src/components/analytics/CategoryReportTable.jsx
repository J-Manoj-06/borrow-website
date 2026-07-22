import React from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import CustomTable from '../common/CustomTable';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const CategoryReportTable = () => {
  const { categoryReport } = useAnalytics();

  const columns = [
    {
      id: 'category',
      label: 'Subject Category',
      minWidth: 200,
      format: (val) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
          {val}
        </Typography>
      ),
    },
    {
      id: 'totalTitles',
      label: 'Catalog Titles',
      minWidth: 130,
      format: (val) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {val} Titles
        </Typography>
      ),
    },
    {
      id: 'borrowedCopies',
      label: 'Borrowed Copies',
      minWidth: 140,
      format: (val) => (
        <Chip
          label={`${val} Out`}
          size="small"
          sx={{ backgroundColor: BORROW_COLORS.infoLight, color: BORROW_COLORS.info, fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'popularityPercentage',
      label: 'Circulation Share',
      minWidth: 180,
      format: (val) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={val || 10}
            sx={{
              width: 80,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: BORROW_COLORS.primary },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>
            {val}%
          </Typography>
        </Box>
      ),
    },
    {
      id: 'availableCopies',
      label: 'Available in Shelf',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.success }}>
          {val} Copies
        </Typography>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={categoryReport}
      rowsPerPage={10}
      emptyType="books"
      emptyTitle="No Category Data"
      emptyDescription="Category distribution will generate once catalog books are added."
    />
  );
};

export default CategoryReportTable;
