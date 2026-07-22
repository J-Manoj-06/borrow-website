import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { BORROW_COLORS } from '../../theme/borrowTheme';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CustomDialog = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
          boxShadow: '0px 20px 40px rgba(15, 23, 42, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          {title && (
            <Typography variant="h4" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: BORROW_COLORS.textSecondary,
              '&:hover': { backgroundColor: '#F1F5F9' },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>{children}</DialogContent>

      {actions && (
        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
