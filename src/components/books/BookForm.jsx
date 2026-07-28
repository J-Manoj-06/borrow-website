import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
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
import { uploadFileWithProgress } from '../../services/firebase/storageService';

export const BookForm = ({ open, onClose, onSubmit, initialData = null, isEditing = false }) => {
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
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
      category: 'Computer Science',
      customCategory: '',
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

  // Watch required fields
  const watchTitle = watch('title');
  const watchIsbn = watch('isbn');
  const watchCategory = watch('category');
  const watchCustomCategory = watch('customCategory');

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
    setUploading(false);
    setUploadProgress(0);
  }, [initialData, reset, open]);

  // Mandatory Validation: Book Title, ISBN, Category, Custom Category (if Other), Total Copies, and Cover Image
  const hasCoverImage = Boolean(coverImageUrl || selectedCoverFile);
  const isOtherCat = watchCategory === 'Other';
  const isFormComplete = Boolean(
    watchTitle && watchTitle.trim() &&
    watchIsbn && watchIsbn.trim() &&
    watchCategory &&
    (!isOtherCat || (watchCustomCategory && watchCustomCategory.trim())) &&
    hasCoverImage
  );

  const handleFormSubmit = async (formData) => {
    if (!hasCoverImage) {
      toast.error('Book Cover is required! Please select a cover image before saving.');
      return;
    }

    setSubmitting(true);
    let finalCoverUrl = coverImageUrl;

    if (selectedCoverFile) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const uploadRes = await uploadFileWithProgress(
          'books',
          selectedCoverFile,
          { version: 1 },
          (snapshot) => {
            setUploadProgress(snapshot.progress);
          }
        );
        finalCoverUrl = uploadRes.downloadURL;
        setCoverImageUrl(finalCoverUrl);
        toast.success('Book cover uploaded successfully to Cloudinary!');
      } catch (uploadErr) {
        console.error('Cloudinary image upload failed:', uploadErr);
        setUploading(false);
        setSubmitting(false);
        toast.error('Cloudinary upload failed. Please retry.');
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [];
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const numCopies = parseInt(formData.totalCopies, 10) || 1;
      const finalCat = formData.category === 'Other' ? (formData.customCategory || 'Other') : formData.category;

      const payload = {
        ...formData,
        category: finalCat,
        customCategory: formData.category === 'Other' ? formData.customCategory : '',
        totalCopies: numCopies,
        availableCopies: numCopies,
        publicationYear: parseInt(formData.publicationYear, 10),
        keywords: keywordsArray,
        tags: tagsArray,
        coverUrl: finalCoverUrl,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Firestore book creation error:', err);
      toast.error('Failed to create book document in Firestore.');
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
              Synchronized automatically with Firebase Firestore for Borrow Mobile App.
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }} disabled={submitting || uploading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Main Form Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 4, md: 5 } }}>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          {/* STEP 2: Dedicated Book Cover Section ABOVE Book Title */}
          <Box
            sx={{
              backgroundColor: BORROW_COLORS.surface,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '12px',
              border: `1px solid ${BORROW_COLORS.border}`,
              boxShadow: BORROW_COLORS.cardShadow,
              mb: 3.5,
            }}
          >
            <BookImageUploader
              currentImageUrl={coverImageUrl}
              onFileSelect={(file) => setSelectedCoverFile(file)}
              onRemove={() => {
                setSelectedCoverFile(null);
                setCoverImageUrl('');
              }}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />

            {!hasCoverImage && (
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '0.8125rem' }}>
                <strong>Book Cover Required:</strong> Upload a book cover image before saving to catalog.
              </Alert>
            )}
          </Box>

          {/* Book Catalog Details Grid */}
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
              {/* Book Title & ISBN */}
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

              {/* Category & Custom Category */}
              <Grid item xs={12} sm={watchCategory === 'Other' ? 6 : 6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      options={BOOK_CATEGORIES}
                      value={value || 'Computer Science'}
                      onChange={(_, newValue) => onChange(newValue || 'Computer Science')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category *"
                          error={Boolean(errors.category)}
                          helperText={errors.category?.message}
                          fullWidth
                          placeholder="Search or select category..."
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {watchCategory === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category Name *"
                    placeholder="e.g. Artificial Intelligence"
                    error={Boolean(errors.customCategory)}
                    helperText={errors.customCategory?.message || 'Specify custom category name'}
                    {...register('customCategory', { required: 'Category Name is required when Other is selected' })}
                  />
                </Grid>
              )}

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

              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Total Copies *" type="number" {...register('totalCopies', { required: true, min: 1 })} />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Language" defaultValue="English" {...register('language')} />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Book Description & Synopsis"
                  placeholder="Enter a brief overview of the book content..."
                  {...register('description')}
                />
              </Grid>

              <Grid item xs={12}>
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
              </Grid>
            </Grid>

            {/* STEP 5: Save Book button remains DISABLED until Title, ISBN, Category, and Cover are filled */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <CustomButton variant="outlined" onClick={onClose} disabled={submitting || uploading}>
                Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                variant="contained"
                loading={submitting || uploading}
                disabled={!isFormComplete || submitting || uploading}
                sx={{ px: 4 }}
              >
                {uploading ? `Uploading Cover (${uploadProgress}%)` : isEditing ? 'Update Book Record' : 'Save Book to Catalog'}
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BookForm;
