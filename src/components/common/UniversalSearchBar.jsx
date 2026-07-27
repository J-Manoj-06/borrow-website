import React from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const UniversalSearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search by title, author, ID...',
  shortcutHint = 'Ctrl + K',
  onClick,
  fullWidth = false,
  width = { xs: '100%', sm: 320, md: 380 },
  sx = {},
}) => {
  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: BORROW_COLORS.surface,
        border: `1px solid ${BORROW_COLORS.border}`,
        borderRadius: '8px',
        px: 1.5,
        py: 0.5,
        width: fullWidth ? '100%' : width,
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          borderColor: BORROW_COLORS.textMuted,
        },
        '&:focus-within': {
          borderColor: BORROW_COLORS.primary,
          boxShadow: '0 0 0 1px #2563EB',
        },
        cursor: onClick ? 'pointer' : 'text',
        ...sx,
      }}
    >
      <SearchIcon sx={{ color: BORROW_COLORS.textMuted, mr: 1, fontSize: 18 }} />
      <InputBase
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label="Universal Search"
        readOnly={Boolean(onClick)}
        sx={{
          flexGrow: 1,
          fontSize: '0.875rem',
          color: BORROW_COLORS.textPrimary,
          '& input::placeholder': {
            color: BORROW_COLORS.textMuted,
            opacity: 1,
          },
        }}
      />

      {value ? (
        <IconButton
          size="small"
          onClick={handleClear}
          aria-label="Clear search"
          sx={{ p: 0.25, color: BORROW_COLORS.textMuted, '&:hover': { color: BORROW_COLORS.textPrimary } }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      ) : (
        shortcutHint && (
          <Typography
            variant="caption"
            sx={{
              px: 0.75,
              py: 0.25,
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: BORROW_COLORS.textMuted,
              backgroundColor: BORROW_COLORS.background,
              border: `1px solid ${BORROW_COLORS.border}`,
              borderRadius: '4px',
              userSelect: 'none',
              ml: 1,
            }}
          >
            {shortcutHint}
          </Typography>
        )
      )}
    </Box>
  );
};

export default UniversalSearchBar;
