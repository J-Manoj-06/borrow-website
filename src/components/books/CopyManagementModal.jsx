import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { COPY_STATUSES, COPY_CONDITIONS } from '../../models/bookModel';
import { useBooks } from '../../hooks/useBooks';

export const CopyManagementModal = ({ open, onClose, copy, bookTitle }) => {
  const { updateCopyStatus } = useBooks();

  const [status, setStatus] = useState(COPY_STATUSES.AVAILABLE);
  const [condition, setCondition] = useState(COPY_CONDITIONS.GOOD);
  const [shelfLocation, setShelfLocation] = useState('');
  const [rackNumber, setRackNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (copy) {
      setStatus(copy.status || COPY_STATUSES.AVAILABLE);
      setCondition(copy.condition || COPY_CONDITIONS.GOOD);
      setShelfLocation(copy.shelfLocation || '');
      setRackNumber(copy.rackNumber || '');
      setNotes(copy.notes || '');
    }
  }, [copy]);

  if (!copy) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateCopyStatus(copy.copyId || copy.id, status, condition, shelfLocation, rackNumber, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={`Manage Physical Copy ${copy.copyId || copy.id}`}
      subtitle={`Title: "${bookTitle || 'Book Title'}" • Update physical status, condition, shelf & rack location.`}
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton variant="contained" loading={loading} onClick={handleSubmit}>
            Save Copy Changes
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Physical Copy Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value={COPY_STATUSES.AVAILABLE}>Available on Shelf</MenuItem>
              <MenuItem value={COPY_STATUSES.BORROWED}>Borrowed by Student</MenuItem>
              <MenuItem value={COPY_STATUSES.RESERVED}>Reserved</MenuItem>
              <MenuItem value={COPY_STATUSES.DAMAGED}>Damaged</MenuItem>
              <MenuItem value={COPY_STATUSES.LOST}>Lost / Unaccounted</MenuItem>
              <MenuItem value={COPY_STATUSES.MAINTENANCE}>Under Maintenance</MenuItem>
              <MenuItem value={COPY_STATUSES.ARCHIVED}>Archived</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Physical Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <MenuItem value={COPY_CONDITIONS.NEW}>New</MenuItem>
              <MenuItem value={COPY_CONDITIONS.GOOD}>Good</MenuItem>
              <MenuItem value={COPY_CONDITIONS.FAIR}>Fair</MenuItem>
              <MenuItem value={COPY_CONDITIONS.DAMAGED}>Damaged</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shelf Location"
              placeholder="e.g. CS-04"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rack Number"
              placeholder="e.g. R-02"
              value={rackNumber}
              onChange={(e) => setRackNumber(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Librarian Condition Notes"
              placeholder="Record any wear, spine damage, or location notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>
    </CustomDialog>
  );
};

export default CopyManagementModal;
