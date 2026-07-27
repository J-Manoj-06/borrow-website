import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const ActiveLoansPanel = ({
  activeLoans = [],
  onReturnLoan,
  onRenewLoan,
  sx = {},
}) => {
  if (activeLoans.length === 0) return null;

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${BORROW_COLORS.border}`,
        backgroundColor: BORROW_COLORS.surface,
        boxShadow: BORROW_COLORS.cardShadow,
        mb: 3,
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            Active Loans ({activeLoans.length})
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            Currently issued copies
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Quick Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {activeLoans.map((loan) => {
                const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date();

                return (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {loan.bookTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                        ISBN: {loan.isbn || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                        {loan.issueDate ? new Date(loan.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: isOverdue ? BORROW_COLORS.error : BORROW_COLORS.textPrimary }}>
                        {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '14 Days'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={isOverdue ? 'Overdue' : 'Issued'} size="small" />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <CustomButton
                          variant="secondary"
                          size="small"
                          onClick={() => onReturnLoan && onReturnLoan(loan)}
                          sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                        >
                          Return
                        </CustomButton>

                        <CustomButton
                          variant="outline"
                          size="small"
                          onClick={() => onRenewLoan && onRenewLoan(loan)}
                          sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                        >
                          Renew
                        </CustomButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ActiveLoansPanel;
