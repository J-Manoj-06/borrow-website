import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const ExportDialog = ({ open, onClose }) => {
  const { exportReport } = useAnalytics();

  const [reportType, setReportType] = useState('Top Books');
  const [formatType, setFormatType] = useState('CSV');

  const handleConfirmExport = () => {
    exportReport(reportType, formatType);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Export Analytics & Audit Reports"
      subtitle="Select report topic and file format to export official library records."
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={handleConfirmExport}
            startIcon={<FileDownloadIcon />}
          >
            Export Report
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
        {/* Report Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Select Target Report Topic *
          </Typography>
          <TextField
            select
            fullWidth
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="Top Books">Top 10 Most Borrowed Books</MenuItem>
            <MenuItem value="Top Students">Top Student Borrowers Leaderboard</MenuItem>
            <MenuItem value="Overdue Books">Active Overdue Books Audit</MenuItem>
            <MenuItem value="Category Usage">Subject Category Usage & Share</MenuItem>
            <MenuItem value="Department Usage">Department Borrowing Distribution</MenuItem>
          </TextField>
        </Box>

        {/* Format Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Export File Format *
          </Typography>

          <RadioGroup value={formatType} onChange={(e) => setFormatType(e.target.value)}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              <Box
                onClick={() => setFormatType('CSV')}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `2px solid ${formatType === 'CSV' ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
                  backgroundColor: formatType === 'CSV' ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TableChartIcon sx={{ color: BORROW_COLORS.success }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    CSV Data File
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                    Excel & Sheets compatible
                  </Typography>
                </Box>
              </Box>

              <Box
                onClick={() => setFormatType('PDF')}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `2px solid ${formatType === 'PDF' ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
                  backgroundColor: formatType === 'PDF' ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <PictureAsPdfIcon sx={{ color: BORROW_COLORS.error }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Printable PDF Document
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                    Official PDF view & print
                  </Typography>
                </Box>
              </Box>
            </Box>
          </RadioGroup>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default ExportDialog;
