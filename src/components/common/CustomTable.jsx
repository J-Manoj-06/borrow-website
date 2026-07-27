import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import PaginationComponent from './PaginationComponent';

export const CustomTable = ({
  columns = [],
  data = [],
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  emptyType = 'books',
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no records matching your active filters.',
  onRowClick,
  sx = {},
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
        borderRadius: '12px',
        backgroundColor: BORROW_COLORS.surface,
        boxShadow: BORROW_COLORS.cardShadow,
        ...sx,
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader role="grid" aria-label="Library Management Data Table">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  style={{ minWidth: col.minWidth, width: col.width }}
                  aria-label={col.label}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage > 5 ? 5 : rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" width="75%" height={22} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ borderBottom: 'none' }}>
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
                  tabIndex={0}
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease-in-out',
                    '&:hover': {
                      backgroundColor: BORROW_COLORS.background,
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

      {onPageChange && !loading && displayData.length > 0 && (
        <PaginationComponent
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Paper>
  );
};

export const StatusChip = StatusBadge;

export default CustomTable;
