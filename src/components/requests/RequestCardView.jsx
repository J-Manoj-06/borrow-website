import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

// Icons
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const RequestCardView = ({
  requests = [],
  selectedIds = [],
  onToggleSelect,
  onSelectDetails,
  onApprove,
  onReject,
}) => {
  return (
    <Grid container spacing={2.5}>
      {requests.map((req) => {
        const isSelected = selectedIds.includes(req.id);
        const isPending = req.status === 'Pending';

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={req.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                border: isSelected ? `2px solid ${BORROW_COLORS.primary}` : `1px solid ${BORROW_COLORS.border}`,
                backgroundColor: BORROW_COLORS.surface,
                boxShadow: BORROW_COLORS.cardShadow,
                transition: 'all 0.15s ease-in-out',
                position: 'relative',
                '&:hover': {
                  borderColor: '#CBD5E1',
                  boxShadow: BORROW_COLORS.cardShadowHover,
                },
              }}
            >
              {/* Checkbox Header */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 2,
                }}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => onToggleSelect(req.id)}
                  sx={{ p: 0.5, color: BORROW_COLORS.textMuted }}
                />
              </Box>

              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  {/* Top Status & Priority Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <StatusBadge status={req.priority || 'Normal'} size="small" />
                    <StatusBadge status={req.status || 'Pending'} size="small" />
                  </Box>

                  {/* Student Info Row */}
                  <Box
                    onClick={() => onSelectDetails(req)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5, cursor: 'pointer' }}
                  >
                    <Avatar
                      src={req.studentAvatar || ''}
                      alt={req.studentName}
                      sx={{ width: 34, height: 34, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      {(req.studentName || 'S')[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.875rem', color: BORROW_COLORS.textPrimary }}>
                        {req.studentName}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary }}>
                        {req.registerNumber || req.studentId} • {req.department || 'CS'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Requested Book Card */}
                  <Box
                    onClick={() => onSelectDetails(req)}
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      backgroundColor: BORROW_COLORS.background,
                      border: `1px solid ${BORROW_COLORS.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      cursor: 'pointer',
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 44,
                        borderRadius: '4px',
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={req.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                        alt={req.bookTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem', color: BORROW_COLORS.textPrimary }}>
                        {req.bookTitle}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                        by {req.bookAuthor || 'Author'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Footer Controls & Quick Approve / Reject Buttons */}
                <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORROW_COLORS.border}` }}>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block', mb: 1, fontSize: '0.71875rem' }}>
                    Requested: {req.requestDate ? new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {isPending ? (
                      <>
                        <CustomButton
                          variant="primary"
                          size="small"
                          onClick={() => onApprove(req)}
                          startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
                          sx={{ flex: 1, backgroundColor: BORROW_COLORS.success, '&:hover': { backgroundColor: '#15803D' } }}
                        >
                          Approve
                        </CustomButton>

                        <CustomButton
                          variant="danger"
                          size="small"
                          onClick={() => onReject(req)}
                          startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                          sx={{ flex: 1 }}
                        >
                          Reject
                        </CustomButton>
                      </>
                    ) : (
                      <CustomButton
                        variant="secondary"
                        size="small"
                        onClick={() => onSelectDetails(req)}
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                        fullWidth
                      >
                        View Details
                      </CustomButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default RequestCardView;
