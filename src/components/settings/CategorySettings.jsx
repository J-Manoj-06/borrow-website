import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSettings } from '../../hooks/useSettings';
import CustomButton from '../common/CustomButton';

export const CategorySettings = () => {
  const { categories, updateCategories } = useSettings();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = {
      id: `CAT-${Date.now()}`,
      name: newCategoryName.trim(),
      active: true,
    };
    updateCategories([...categories, newCat]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (id) => {
    updateCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Subject Categories Manager
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage catalog subject classifications used for book inventory and search filters.
        </Typography>
      </Box>

      {/* Add New Category Bar */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="New Category Name (e.g. Cyber Security)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <CustomButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!newCategoryName.trim()}
          onClick={handleAddCategory}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add Category
        </CustomButton>
      </Box>

      {/* Existing Categories List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {categories.map((cat) => (
          <Box
            key={cat.id}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {cat.name}
              </Typography>
              <Chip label="Active" size="small" color="success" sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700 }} />
            </Box>

            <IconButton size="small" onClick={() => handleDeleteCategory(cat.id)} sx={{ color: '#EF4444' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CategorySettings;
