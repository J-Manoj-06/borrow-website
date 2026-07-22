import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import PrintIcon from '@mui/icons-material/Print';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { useQRCode } from '../../hooks/useQRCode';
import { generateQRCodeSVG } from '../../services/qrCodeService';

export const PrintLabelDialog = ({ open, onClose }) => {
  const { batchCopiesList, targetBookTitle, printLabels } = useQRCode();
  const [selectedIds, setSelectedIds] = useState(batchCopiesList.map((c) => c.id || c.copyId));

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(batchCopiesList.map((c) => c.id || c.copyId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    const toPrint = batchCopiesList.filter((c) => selectedIds.includes(c.id || c.copyId));
    printLabels(toPrint, targetBookTitle);
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Bulk Print QR Sticky Labels"
      subtitle={`Select copies of "${targetBookTitle}" to generate print-ready sticky barcode labels.`}
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            disabled={selectedIds.length === 0}
            onClick={handlePrint}
          >
            Print {selectedIds.length} Labels
          </CustomButton>
        </>
      }
    >
      <Box sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedIds.length === batchCopiesList.length}
                onChange={(e) => handleToggleSelectAll(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Select All ({batchCopiesList.length} Copies)
              </Typography>
            }
          />
        </Box>

        <Grid container spacing={2} sx={{ maxHeight: 360, overflowY: 'auto', p: 1 }}>
          {batchCopiesList.map((copy) => {
            const cid = copy.id || copy.copyId;
            const isSelected = selectedIds.includes(cid);

            return (
              <Grid item xs={6} sm={4} key={cid}>
                <Box
                  onClick={() => handleToggleId(cid)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{ width: 70, height: 70, mb: 1 }}
                    dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(cid, 70) }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.primary, fontFamily: 'monospace' }}>
                    {cid}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </CustomDialog>
  );
};

export default PrintLabelDialog;
