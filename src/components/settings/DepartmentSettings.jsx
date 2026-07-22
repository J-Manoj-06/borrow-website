import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSettings } from '../../hooks/useSettings';
import CustomButton from '../common/CustomButton';

export const DepartmentSettings = () => {
  const { departments, updateDepartments } = useSettings();
  const [deptName, setDeptName] = useState('');

  const handleAddDept = () => {
    if (!deptName.trim()) return;
    const newDept = {
      id: `DEP-${Date.now()}`,
      name: deptName.trim(),
    };
    updateDepartments([...departments, newDept]);
    setDeptName('');
  };

  const handleDeleteDept = (id) => {
    updateDepartments(departments.filter((d) => d.id !== id));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          University Departments Manager
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure university faculties used for student registration and department borrowing analytics.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="New Department Name (e.g. Biomedical Engineering)"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
        />
        <CustomButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!deptName.trim()}
          onClick={handleAddDept}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add Department
        </CustomButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {departments.map((dept) => (
          <Box
            key={dept.id}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {dept.name}
            </Typography>

            <IconButton size="small" onClick={() => handleDeleteDept(dept.id)} sx={{ color: '#EF4444' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DepartmentSettings;
