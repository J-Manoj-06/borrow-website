import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const RequestLifecycleTimeline = ({ request, sx = {} }) => {
  if (!request) return null;

  const currentStatus = request.status || 'Pending';

  const steps = [
    {
      id: 'requested',
      label: 'Requested',
      timestamp: request.requestDate,
      completed: true,
    },
    {
      id: 'approved',
      label: 'Approved',
      timestamp: request.approvedDate,
      completed: ['Approved', 'Issued', 'Returned', 'Completed'].includes(currentStatus),
    },
    {
      id: 'issued',
      label: 'Issued',
      timestamp: request.issueDate,
      completed: ['Issued', 'Returned', 'Completed'].includes(currentStatus),
    },
    {
      id: 'returned',
      label: 'Returned',
      timestamp: request.returnDate,
      completed: ['Returned', 'Completed'].includes(currentStatus),
    },
  ];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '8px',
        backgroundColor: BORROW_COLORS.background,
        border: `1px solid ${BORROW_COLORS.border}`,
        ...sx,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary, mb: 1.5 }}>
        Request Lifecycle Timeline
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                {step.completed ? (
                  <CheckCircleIcon sx={{ fontSize: 20, color: BORROW_COLORS.success }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: BORROW_COLORS.textMuted }} />
                )}

                <Typography variant="caption" sx={{ fontWeight: 600, mt: 0.5, color: step.completed ? BORROW_COLORS.textPrimary : BORROW_COLORS.textMuted, fontSize: '0.71875rem' }}>
                  {step.label}
                </Typography>

                <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, fontSize: '0.65rem' }}>
                  {step.timestamp ? new Date(step.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </Typography>
              </Box>

              {!isLast && (
                <Box
                  sx={{
                    height: 2,
                    flex: 1,
                    backgroundColor: steps[idx + 1].completed ? BORROW_COLORS.success : BORROW_COLORS.border,
                    mt: -2.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export default RequestLifecycleTimeline;
