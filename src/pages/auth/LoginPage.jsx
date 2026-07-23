import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/common/CustomButton';
import CustomDialog from '../../components/common/CustomDialog';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [authError, setAuthError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleSendReset = async () => {
    if (!resetEmail) return;
    await resetPassword(resetEmail);
    setForgotOpen(false);
    setResetEmail('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 40%),
                     radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                     #F8FAFC`,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            width: '100%',
            maxWidth: 1000,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0px 20px 60px rgba(15, 23, 42, 0.1)',
            border: `1px solid ${BORROW_COLORS.border}`,
            backgroundColor: BORROW_COLORS.surface,
          }}
        >
          {/* Left Side: Brand Showcase Banner */}
          <Box
            sx={{
              background: BORROW_COLORS.primaryGradient,
              color: '#FFFFFF',
              p: { xs: 4, sm: 6 },
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Decorative Rings */}
            <Box
              sx={{
                position: 'absolute',
                top: '-20%',
                right: '-20%',
                width: 340,
                height: 340,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '-15%',
                left: '-15%',
                width: 280,
                height: 280,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Brand Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoStoriesIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                  Borrow
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                  LIBRARY MANAGEMENT ECOSYSTEM
                </Typography>
              </Box>
            </Box>

            {/* Center Visual Callout */}
            <Box sx={{ my: 6, zIndex: 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, lineHeight: 1.2 }}>
                Empowering Digital Library Management.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>
                Seamlessly synchronize physical book inventories, student borrow requests, live approvals, and analytics with the Borrow mobile application.
              </Typography>
            </Box>

            {/* Bottom Security Footer */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.9)', zIndex: 1 }}>
              <VerifiedUserOutlinedIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Firebase Authenticated Portal • Restricted Admin Access Only
              </Typography>
            </Box>
          </Box>

          {/* Right Side: Login Form Card */}
          <Box sx={{ p: { xs: 3, sm: 5, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Mobile Brand Logo Header */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: BORROW_COLORS.primaryGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <AutoStoriesIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                  Borrow Admin
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 1 }}>
                Librarian Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 4 }}>
                Enter your administrative credentials to manage library operations.
              </Typography>

              {authError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
                  {authError}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email Field */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    id="email"
                    type="email"
                    placeholder="librarian@borrow.com"
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: BORROW_COLORS.textSecondary }} />
                        </InputAdornment>
                      ),
                    }}
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address format',
                      },
                    })}
                  />
                </Box>

                {/* Password Field */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                      Password
                    </Typography>
                    <Typography
                      variant="caption"
                      onClick={() => setForgotOpen(true)}
                      sx={{
                        color: BORROW_COLORS.primary,
                        fontWeight: 700,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: BORROW_COLORS.textSecondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                </Box>

                {/* Submit Button */}
                <CustomButton
                  type="submit"
                  fullWidth
                  size="large"
                  loading={loading}
                  sx={{ py: 1.5, mt: 2, fontSize: '1rem' }}
                >
                  Sign In to Portal
                </CustomButton>

                {/* Production Auth Notice Box */}
                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#F1F5F9',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', fontWeight: 600 }}>
                    Enterprise Security Active • Powered by Firebase Authentication
                  </Typography>
                </Box>
              </form>
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* Forgot Password Modal */}
      <CustomDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Password"
        subtitle="Enter your registered librarian email address to receive password recovery instructions."
        actions={
          <>
            <CustomButton variant="outlined" onClick={() => setForgotOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="contained" onClick={handleSendReset}>
              Send Recovery Email
            </CustomButton>
          </>
        }
      >
        <TextField
          fullWidth
          label="Registered Email"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          sx={{ mt: 1 }}
        />
      </CustomDialog>
    </Box>
  );
};

export default LoginPage;
