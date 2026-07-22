import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSettings } from '../../hooks/useSettings';

export const AcademicYearSettings = () => {
  const { academicYears } = useSettings();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Academic Years Manager
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Standard university academic year classifications for student members.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {academicYears.map((yr) => (
          <Box
            key={yr.id}
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
              {yr.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AcademicYearSettings;
