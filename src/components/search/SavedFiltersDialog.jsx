import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const SavedFiltersDialog = ({ open, onClose }) => {
  const { savedFilters, createSavedFilter, deleteSavedFilter } = useGlobalSearch();

  const [filterName, setFilterName] = useState('');
  const [targetModule, setTargetModule] = useState('Students');

  const handleSave = () => {
    if (!filterName.trim()) return;
    createSavedFilter(filterName, targetModule, { sample: true });
    setFilterName('');
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Saved Smart Filter Presets"
      subtitle="Save complex multi-criteria filters for instant 1-click execution across modules."
      actions={
        <CustomButton variant="outlined" onClick={onClose}>
          Close
        </CustomButton>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
        {/* Create Saved Filter Form */}
        <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: BORROW_COLORS.textPrimary }}>
            Save Current Filter as Preset
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Filter Preset Name (e.g. Overdue CS Students)"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />

            <TextField
              select
              size="small"
              value={targetModule}
              onChange={(e) => setTargetModule(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="Books">Books</MenuItem>
              <MenuItem value="Students">Students</MenuItem>
              <MenuItem value="Requests">Requests</MenuItem>
              <MenuItem value="Returns">Returns</MenuItem>
            </TextField>

            <CustomButton
              variant="contained"
              size="small"
              startIcon={<BookmarkAddIcon />}
              disabled={!filterName.trim()}
              onClick={handleSave}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Save
            </CustomButton>
          </Box>
        </Box>

        {/* Existing Saved Filter Presets List */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textSecondary, mb: 1 }}>
            MY SAVED PRESETS ({savedFilters.length})
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {savedFilters.map((preset) => (
              <Box
                key={preset.id}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${BORROW_COLORS.border}`,
                  backgroundColor: BORROW_COLORS.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                      {preset.name}
                    </Typography>
                    <Chip label={preset.module} size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.675rem' }} />
                  </Box>

                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                    Criteria: {JSON.stringify(preset.criteria)}
                  </Typography>
                </Box>

                <IconButton size="small" onClick={() => deleteSavedFilter(preset.id)} sx={{ color: BORROW_COLORS.error }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default SavedFiltersDialog;
