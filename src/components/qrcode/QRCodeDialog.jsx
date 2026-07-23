import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import CodeIcon from '@mui/icons-material/Code';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { generateQRCodeSVG } from '../../services/qrCodeService';
import { StatusChip } from '../common/CustomTable';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { useQRCode } from '../../hooks/useQRCode';

export const QRCodeDialog = ({ open, onClose }) => {
  const { selectedCopyForQr, targetBookTitle, downloadSinglePng, downloadSingleSvg, printLabels } = useQRCode();

  if (!selectedCopyForQr) return null;

  const copyId = selectedCopyForQr.copyId || selectedCopyForQr.id;

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Physical Copy QR Code Label"
      subtitle="Encapsulates unique Copy ID payload for mobile scanner verification & physical book stickers."
      actions={
        <>
          <CustomButton variant="outlined" startIcon={<PrintIcon />} onClick={() => printLabels([selectedCopyForQr], targetBookTitle)}>
            Print Label
          </CustomButton>
          <CustomButton variant="outlined" startIcon={<CodeIcon />} onClick={() => downloadSingleSvg(selectedCopyForQr, targetBookTitle)}>
            SVG
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={() => downloadSinglePng(selectedCopyForQr, targetBookTitle)}
          >
            PNG
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, textAlign: 'center' }}>
        {/* Large QR SVG Container */}
        <Box
          sx={{
            p: 3,
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: `2px solid ${BORROW_COLORS.primary}`,
            mb: 2.5,
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
          }}
          dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(copyId, 220) }}
        />

        <Typography variant="h4" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
          {copyId}
        </Typography>

        <Typography variant="subtitle1" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, mb: 1 }}>
          {targetBookTitle}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
          <StatusChip status={selectedCopyForQr.status || 'Available'} />
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            Condition: <strong>{selectedCopyForQr.condition || 'New'}</strong> • Location: <strong>{selectedCopyForQr.shelfLocation || 'CS-01'}</strong>
          </Typography>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default QRCodeDialog;
