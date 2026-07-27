import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        border: `1px solid ${BORROW_COLORS.border}`,
        borderRadius: '12px',
        backgroundColor: BORROW_COLORS.surface,
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" width="70%" height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant="text" width={colIndex === 0 ? '80%' : '60%'} height={24} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export const CardGridSkeleton = ({ count = 4, xs = 12, sm = 6, md = 3 }) => {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={xs} sm={sm} md={md} key={index}>
          <Card sx={{ p: 0.5, borderRadius: '12px' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton variant="circular" width={36} height={36} />
              </Box>
              <Skeleton variant="text" width="40%" height={36} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="65%" height={18} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const StatsSkeleton = () => <CardGridSkeleton count={4} xs={12} sm={6} md={3} />;

export const PageHeaderSkeleton = () => (
  <Box sx={{ mb: 3.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box sx={{ width: '40%' }}>
        <Skeleton variant="text" width="60%" height={38} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mt: 0.5 }} />
      </Box>
      <Skeleton variant="rounded" width={130} height={38} sx={{ borderRadius: '8px' }} />
    </Box>
    <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: '8px', mt: 2 }} />
  </Box>
);

export const SkeletonLoader = ({ type = 'table', rows = 5, columns = 5, count = 4 }) => {
  if (type === 'card' || type === 'grid') return <CardGridSkeleton count={count} />;
  if (type === 'stats') return <StatsSkeleton />;
  if (type === 'header') return <PageHeaderSkeleton />;
  return <TableSkeleton rows={rows} columns={columns} />;
};

export default SkeletonLoader;
