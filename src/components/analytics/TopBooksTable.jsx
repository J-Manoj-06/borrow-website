import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CustomTable from '../common/CustomTable';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const TopBooksTable = () => {
  const { topBooks } = useAnalytics();

  const columns = [
    {
      id: 'rank',
      label: 'Rank',
      minWidth: 60,
      format: (_, __, idx) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>
          #{idx + 1}
        </Typography>
      ),
    },
    {
      id: 'coverUrl',
      label: 'Cover',
      minWidth: 65,
      format: (val, row) => (
        <Box
          sx={{
            width: 36,
            height: 48,
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#F1F5F9',
            border: `1px solid ${BORROW_COLORS.border}`,
          }}
        >
          <img
            src={val || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
            alt={row.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ),
    },
    {
      id: 'title',
      label: 'Book Title & Author',
      minWidth: 260,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            by {row.author}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 160,
      format: (val) => <Chip label={val} size="small" variant="outlined" sx={{ fontWeight: 600 }} />,
    },
    {
      id: 'borrowCount',
      label: 'Total Borrows',
      minWidth: 130,
      format: (val) => (
        <Chip
          label={`${val} Borrows`}
          size="small"
          sx={{ backgroundColor: BORROW_COLORS.primaryLight, color: '#FFFFFF', fontWeight: 800 }}
        />
      ),
    },
    {
      id: 'availableCopies',
      label: 'Current Availability',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 700, color: val > 0 ? BORROW_COLORS.success : BORROW_COLORS.error }}>
          {val > 0 ? `${val} copies in shelf` : 'Out of Stock'}
        </Typography>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={topBooks.map((b, i) => ({ ...b, rankIndex: i }))}
      rowsPerPage={10}
      emptyType="books"
      emptyTitle="No Book Telemetry Available"
      emptyDescription="Rankings will update automatically as students begin checking out books."
    />
  );
};

export default TopBooksTable;
