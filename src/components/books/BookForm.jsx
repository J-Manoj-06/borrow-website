import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import toast from 'react-hot-toast';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import { BOOK_CATEGORIES, BOOK_DEPARTMENTS } from '../../models/bookModel';
import BookImageUploader from './BookImageUploader';
import CustomButton from '../common/CustomButton';

export const BookForm = ({ open, onClose, onSubmit, initialData = null, isEditing = false }) => {
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      subtitle: '',
      author: '',
      publisher: '',
      isbn: '',
      edition: '1st Edition',
      language: 'English',
      category: 'Software Engineering',
      department: 'Computer Science & Engineering',
      shelfNumber: 'CS-01',
      rackNumber: 'R-01',
      publicationYear: new Date().getFullYear(),
      totalCopies: 5,
      description: '',
      keywords: '',
      tags: '',
      recommendedReading: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        author: initialData.author || '',
        publisher: initialData.publisher || '',
        isbn: initialData.isbn || '',
        edition: initialData.edition || '1st Edition',
        language: initialData.language || 'English',
        category: initialData.category || 'Software Engineering',
        department: initialData.department || 'Computer Science & Engineering',
        shelfNumber: initialData.shelfNumber || 'CS-01',
        rackNumber: initialData.rackNumber || 'R-01',
        publicationYear: initialData.publicationYear || new Date().getFullYear(),
        totalCopies: initialData.totalCopies || 5,
        description: initialData.description || '',
        keywords: initialData.keywords ? initialData.keywords.join(', ') : '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        recommendedReading: initialData.recommendedReading ?? true,
      });
      setCoverImageUrl(initialData.coverUrl || '');
    } else {
      reset({
        title: '',
        subtitle: '',
        author: '',
        publisher: '',
        isbn: '',
        edition: '1st Edition',
        language: 'English',
        category: 'Software Engineering',
        department: 'Computer Science & Engineering',
        shelfNumber: 'CS-01',
        rackNumber: 'R-01',
        publicationYear: new Date().getFullYear(),
        totalCopies: 5,
        description: '',
        keywords: '',
        tags: '',
        recommendedReading: true,
      });
      setCoverImageUrl('');
    }
    setSelectedCoverFile(null);
  }, [initialData, reset, open]);

  // Check if a valid image cover is uploaded or present
  const hasCoverImage = Boolean(coverImageUrl || selectedCoverFile);

  const handleFormSubmit = async (formData) => {
    if (!hasCoverImage) {
      toast.error('Book cover image is required! Please upload a cover image before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [];
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        totalCopies: parseInt(formData.totalCopies, 10),
        publicationYear: parseInt(formData.publicationYear, 10),
        keywords: keywordsArray,
        tags: tagsArray,
        coverUrl: coverImageUrl || initialData?.coverUrl || '',
      };

      await onSubmit(payload, selectedCoverFile);
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: BORROW_COLORS.background,
        },
      }}
    >
      {/* Top Header */}
      <DialogTitle
        sx={{
          backgroundColor: BORROW_COLORS.surface,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          py: 2,
          px: { xs: 2, sm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: BORROW_COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <AutoStoriesIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {isEditing ? 'Edit Book Record' : 'Add New Book to Inventory'}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              Every book record requires a mandatory cover image before saving to catalog.
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Main Form Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={3.5}>
            {/* Left Column: Mandatory Image Upload & Copies */}
            <Grid item xs={12} lg={4}>
              <Box
                sx={{
                  backgroundColor: BORROW_COLORS.surface,
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${BORROW_COLORS.border}`,
                  boxShadow: BORROW_COLORS.cardShadow,
                }}
              >
                {/* Mandatory Image Upload Section */}
                <BookImageUploader
                  currentImageUrl={coverImageUrl}
                  onFileSelect={(file) => setSelectedCoverFile(file)}
                  onUrlChange={(url) => setCoverImageUrl(url)}
                  onRemove={() => {
                    setSelectedCoverFile(null);
                    setCoverImageUrl('');
                  }}
                />

                {/* Missing Image Warning Alert */}
                {!hasCoverImage && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px', fontSize: '0.8125rem' }}>
                    <strong>Cover Image Required:</strong> Upload or paste a cover image to enable book saving.
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                    Total Physical Copies *
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    error={Boolean(errors.totalCopies)}
                    helperText={errors.totalCopies?.message || 'Creates individual physical copy records'}
                    {...register('totalCopies', {
                      required: 'Total copies is required',
                      min: { value: 1, message: 'Minimum 1 copy' },
                    })}
                  />
                </Box>

                <Box sx={{ mt: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={initialData?.recommendedReading ?? true}
                        color="primary"
                        {...register('recommendedReading')}
                      />
                    }
                    label="Flag as Recommended Reading in Mobile App"
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Book Catalog Metadata Fields */}
            <Grid item xs={12} lg={8}>
              <Box
                sx={{
                  backgroundColor: BORROW_COLORS.surface,
                  p: { xs: 3, sm: 4 },
                  borderRadius: '12px',
                  border: `1px solid ${BORROW_COLORS.border}`,
                  boxShadow: BORROW_COLORS.cardShadow,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: BORROW_COLORS.textPrimary }}>
                  Book Metadata & Catalog Details
                </Typography>

                <Grid container spacing={2.5}>
                  {/* Title & Subtitle */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Book Title *"
                      error={Boolean(errors.title)}
                      helperText={errors.title?.message}
                      {...register('title', { required: 'Book title is required' })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="ISBN Number *"
                      placeholder="9780132350884"
                      error={Boolean(errors.isbn)}
                      helperText={errors.isbn?.message}
                      {...register('isbn', { required: 'ISBN is required' })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Subtitle (Optional)" {...register('subtitle')} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Author Name(s) *"
                      error={Boolean(errors.author)}
                      helperText={errors.author?.message}
                      {...register('author', { required: 'Author is required' })}
                    />
                  </Grid>

                  {/* Publisher & Year */}
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Publisher" {...register('publisher')} />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField fullWidth label="Edition" {...register('edition')} />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField fullWidth label="Publication Year" type="number" {...register('publicationYear')} />
                  </Grid>

                  {/* Category & Department */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Category *"
                      defaultValue="Software Engineering"
                      error={Boolean(errors.category)}
                      {...register('category', { required: 'Category is required' })}
                    >
                      {BOOK_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Target Department" defaultValue="Computer Science & Engineering" {...register('department')}>
                      {BOOK_DEPARTMENTS.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Shelf & Rack */}
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Shelf Number" placeholder="CS-04" {...register('shelfNumber')} />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Rack Number" placeholder="R-02" {...register('rackNumber')} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Language" defaultValue="English" {...register('language')} />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Book Description & Synopsis"
                      placeholder="Enter a brief overview of the book content..."
                      {...register('description')}
                    />
                  </Grid>

                  {/* Keywords & Tags */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Search Keywords (Comma Separated)"
                      placeholder="agile, refactoring, java"
                      {...register('keywords')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Tags (Comma Separated)"
                      placeholder="Bestseller, Core CS"
                      {...register('tags')}
                    />
                  </Grid>
                </Grid>

                {/* Form Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                  <CustomButton variant="outlined" onClick={onClose} disabled={submitting}>
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="contained"
                    loading={submitting}
                    disabled={!hasCoverImage || submitting}
                    sx={{ px: 4 }}
                  >
                    {isEditing ? 'Update Book Record' : 'Save Book to Catalog'}
                  </CustomButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BookForm;
