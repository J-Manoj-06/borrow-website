import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import HistoryIcon from '@mui/icons-material/History';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TuneIcon from '@mui/icons-material/Tune';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import { StatusChip } from '../common/CustomTable';
import CustomButton from '../common/CustomButton';
import { useQRCode } from '../../hooks/useQRCode';
import CopyManagementModal from './CopyManagementModal';
import ProtectedPermission from '../rbac/ProtectedPermission';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../models/rbacModel';

export const BookDetailsDrawer = ({ open, onClose, book, copies = [], onEdit, onArchive, onRestore }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCopyForEdit, setSelectedCopyForEdit] = useState(null);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { openQrPreview, openPrintLabelsModal, openCopyHistory, downloadSinglePng } = useQRCode();

  if (!book) return null;

  const galleryImages = book.imageGallery && book.imageGallery.length > 0
    ? book.imageGallery
    : [book.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'];

  const handleOpenCopyModal = (copy) => {
    setSelectedCopyForEdit(copy);
    setCopyModalOpen(true);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 540, md: 640 },
            p: 0,
            backgroundColor: BORROW_COLORS.surface,
          },
        }}
      >
        {/* Top Sticky Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${BORROW_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: BORROW_COLORS.surface,
            zIndex: 10,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            Book Details & Physical Copies
          </Typography>
          <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer Scrollable Content */}
        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
          {/* Main Book Card Banner */}
          <Box sx={{ display: 'flex', gap: 2.5, mb: 3 }}>
            <Box
              onClick={() => setLightboxIndex(0)}
              sx={{
                width: 120,
                height: 165,
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.15)',
                border: `1px solid ${BORROW_COLORS.border}`,
                backgroundColor: '#F1F5F9',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <img
                src={book.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                sx={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#FFFFFF', p: 0.5 }}
              >
                <ZoomInIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <StatusChip status={book.status} />
                <Chip label={book.category} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                {book.recommendedReading && (
                  <Chip label="Recommended" size="small" color="primary" sx={{ fontWeight: 700 }} />
                )}
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
                {book.title}
              </Typography>

              <Typography variant="subtitle1" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                By {book.author}
              </Typography>

              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                <strong>ISBN:</strong> {book.isbn} &nbsp;|&nbsp; <strong>Publisher:</strong> {book.publisher || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* Action Button Bar */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            <ProtectedPermission module={PERMISSION_MODULES.BOOKS} action={PERMISSION_ACTIONS.EDIT}>
              <CustomButton
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  onClose();
                  onEdit(book);
                }}
              >
                Edit Title Details
              </CustomButton>
            </ProtectedPermission>

            <CustomButton
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() =>
                openPrintLabelsModal(
                  copies.length > 0
                    ? copies
                    : [{ id: `CPY-${book.isbn.replace(/[^0-9X]/gi, '').slice(-6)}-001`, copyId: `CPY-${book.isbn.replace(/[^0-9X]/gi, '').slice(-6)}-001` }],
                  book.title
                )
              }
            >
              Bulk Print QR Labels
            </CustomButton>

            <ProtectedPermission module={PERMISSION_MODULES.BOOKS} action={PERMISSION_ACTIONS.DELETE}>
              {book.isArchived ? (
                <CustomButton variant="outlined" color="success" onClick={() => onRestore(book.id)}>
                  Restore to Active
                </CustomButton>
              ) : (
                <CustomButton
                  variant="outlined"
                  color="error"
                  startIcon={<ArchiveIcon />}
                  onClick={() => onArchive(book.id)}
                >
                  Archive Title
                </CustomButton>
              )}
            </ProtectedPermission>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Tabs: Info vs Physical Copies vs Gallery */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ mb: 2, borderBottom: `1px solid ${BORROW_COLORS.border}` }}
          >
            <Tab label="Metadata & Location" sx={{ fontWeight: 700 }} />
            <Tab label={`Gallery (${galleryImages.length})`} sx={{ fontWeight: 700 }} />
            <Tab label={`Physical Copies (${copies.length || book.totalCopies})`} sx={{ fontWeight: 700 }} />
          </Tabs>

          {/* Tab 0: Metadata */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
                  Synopsis & Description
                </Typography>
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, lineHeight: 1.6 }}>
                  {book.description || 'No description available for this catalog entry.'}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
                      DEFAULT SHELF / LOCATION
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                      {book.shelfNumber || 'CS-01'} (Rack {book.rackNumber || 'R-01'})
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
                      INVENTORY COUNTS
                    </Typography>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                      Available: <strong>{book.availableCopies ?? 0}</strong> / Total: <strong>{book.totalCopies ?? 0}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 1: Image Gallery Grid */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, mb: 1.5, display: 'block' }}>
                All catalog images on record for this book title (Click image to open fullscreen preview):
              </Typography>

              <Grid container spacing={1.5}>
                {galleryImages.map((url, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <Box
                      onClick={() => setLightboxIndex(idx)}
                      sx={{
                        height: 140,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#E2E8F0',
                        border: `1px solid ${BORROW_COLORS.border}`,
                        cursor: 'pointer',
                        position: 'relative',
                        boxShadow: BORROW_COLORS.cardShadow,
                        '&:hover': { borderColor: BORROW_COLORS.primary },
                      }}
                    >
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {idx === 0 && (
                        <Chip
                          label="Primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            backgroundColor: BORROW_COLORS.primary,
                            color: '#FFFFFF',
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Tab 2: Physical Copies Breakdown */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, mb: 1, display: 'block' }}>
                Individually tracked physical copy records and status lifecycle:
              </Typography>

              {(copies.length > 0
                ? copies
                : Array.from({ length: book.totalCopies }).map((_, i) => ({
                    id: `CPY-${book.isbn.replace(/[^0-9X]/gi, '').slice(-6)}-${String(i + 1).padStart(3, '0')}`,
                    copyId: `CPY-${book.isbn.replace(/[^0-9X]/gi, '').slice(-6)}-${String(i + 1).padStart(3, '0')}`,
                    status: i < (book.borrowedCopies || 0) ? 'Borrowed' : 'Available',
                    condition: 'Good',
                    shelfLocation: book.shelfNumber || 'CS-01',
                    rackNumber: book.rackNumber || 'R-01',
                  }))
              ).map((copy) => (
                <Box
                  key={copy.id || copy.copyId}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: BORROW_COLORS.surface,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: BORROW_COLORS.primary, fontFamily: 'monospace' }}
                    >
                      {copy.copyId || copy.id}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                      Condition: <strong>{copy.condition || 'Good'}</strong> &nbsp;|&nbsp; {copy.shelfLocation || book.shelfNumber || 'CS-01'} (Rack {copy.rackNumber || book.rackNumber || 'R-01'})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StatusChip status={copy.status || 'Available'} />

                    <ProtectedPermission module={PERMISSION_MODULES.BOOKS} action={PERMISSION_ACTIONS.EDIT}>
                      <Tooltip title="Manage Copy Status & Location">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenCopyModal(copy)}
                          sx={{ color: BORROW_COLORS.primary }}
                        >
                          <TuneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ProtectedPermission>

                    <Tooltip title="View Large QR Code">
                      <IconButton
                        size="small"
                        onClick={() => openQrPreview(copy, book.title)}
                        sx={{ color: BORROW_COLORS.primary }}
                      >
                        <QrCode2Icon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Download QR PNG">
                      <IconButton
                        size="small"
                        onClick={() => downloadSinglePng(copy, book.title)}
                        sx={{ color: BORROW_COLORS.textSecondary }}
                      >
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="View Copy Lifecycle History">
                      <IconButton
                        size="small"
                        onClick={() => openCopyHistory(copy)}
                        sx={{ color: BORROW_COLORS.textSecondary }}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Copy Management Dialog Modal */}
      <CopyManagementModal
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        copy={selectedCopyForEdit}
        bookTitle={book.title}
      />

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <Dialog fullScreen open={lightboxIndex !== null} onClose={() => setLightboxIndex(null)}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              onClick={() => setLightboxIndex(null)}
              sx={{ position: 'absolute', top: 16, right: 16, color: '#FFFFFF', zIndex: 10 }}
            >
              <CloseIcon />
            </IconButton>

            {galleryImages.length > 1 && (
              <IconButton
                onClick={() => setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                sx={{ position: 'absolute', left: 24, color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            )}

            <img
              src={galleryImages[lightboxIndex]}
              alt="Gallery Fullscreen"
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }}
            />

            {galleryImages.length > 1 && (
              <IconButton
                onClick={() => setLightboxIndex((prev) => (prev + 1) % galleryImages.length)}
                sx={{ position: 'absolute', right: 24, color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}
          </Box>
        </Dialog>
      )}
    </>
  );
};

export default BookDetailsDrawer;
