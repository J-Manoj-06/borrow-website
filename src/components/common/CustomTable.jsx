import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import EmptyState from './EmptyState';

export const CustomTable = ({
  columns = [],
  data = [],
  loading = false,
  page = 0,
  rowsPerPage = 5,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  emptyType = 'books',
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no records matching your criteria.',
}) => {
  const displayData = totalCount !== undefined
    ? data
    : data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const count = totalCount !== undefined ? totalCount : data.length;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        border: `1px solid ${BORROW_COLORS.border}`,
        borderRadius: '16px',
        backgroundColor: BORROW_COLORS.surface,
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="custom data table">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  style={{ minWidth: col.minWidth, width: col.width }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" width="80%" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <EmptyState
                    type={emptyType}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, rowIndex) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.id || rowIndex}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.02)',
                    },
                  }}
                >
                  {columns.map((col) => {
                    const value = row[col.id];
                    return (
                      <TableCell key={col.id} align={col.align || 'left'}>
                        {col.format ? col.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <Box sx={{ borderTop: `1px solid ${BORROW_COLORS.border}` }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </Box>
      )}
    </Paper>
  );
};

export const StatusChip = ({ status }) => {
  let color = BORROW_COLORS.textSecondary;
  let bg = '#F1F5F9';

  const normalized = String(status).toLowerCase();

  if (['active', 'approved', 'available', 'returned', 'completed'].includes(normalized)) {
    color = BORROW_COLORS.success;
    bg = BORROW_COLORS.successLight;
  } else if (['pending', 'in progress', 'borrowed', 'issued'].includes(normalized)) {
    color = BORROW_COLORS.warning;
    bg = BORROW_COLORS.warningLight;
  } else if (['overdue', 'rejected', 'cancelled', 'lost', 'failed'].includes(normalized)) {
    color = BORROW_COLORS.error;
    bg = BORROW_COLORS.errorLight;
  }

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: bg,
        color: color,
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        px: 0.5,
      }}
    />
  );
};

export default CustomTable;
