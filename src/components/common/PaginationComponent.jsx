import React from 'react';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const PaginationComponent = ({
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderTop: `1px solid ${BORROW_COLORS.border}`,
        backgroundColor: BORROW_COLORS.surface,
        borderRadius: '0 0 12px 12px',
        ...sx,
      }}
    >
      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
        Showing {count > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, count)} of {count} entries
      </Typography>

      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          border: 'none',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.8125rem',
            color: BORROW_COLORS.textSecondary,
          },
          '.MuiTablePagination-select': {
            fontSize: '0.8125rem',
          },
        }}
      />
    </Box>
  );
};

export default PaginationComponent;
