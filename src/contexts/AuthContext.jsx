import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  loginWithEmailPassword,
  logoutUser,
  subscribeToAuthState,
  resetPassword as resetPasswordService,
  updateAdminUserProfile,
  changeAdminPassword,
} from '../services/firebase/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(({ user: currentUser, adminProfile: profile, role: userRole, permissions: userPerms, loading: isAuthLoading }) => {
      setUser(currentUser);
      setAdminProfile(profile);
      if (userRole) setRole(userRole);
      if (userPerms) setPermissions(userPerms);
      setLoading(isAuthLoading);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithEmailPassword(email, password);
      setUser(result.user);
      setAdminProfile(result.adminProfile);
      setRole(result.role);
      toast.success(`Welcome back, ${result.adminProfile?.fullName || result.user.email}!`);
      return result;
    } catch (err) {
      const msg = err.message || 'Failed to sign in';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setAdminProfile(null);
      setRole(null);
      setPermissions(null);
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetPassword = useCallback(async (email) => {
    try {
      await resetPasswordService(email);
      toast.success('Password reset instructions sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Password reset request failed.');
    }
  }, []);

  const handleUpdateProfile = useCallback(
    async (profileFields) => {
      if (!user) return;
      try {
        await updateAdminUserProfile(user.uid, profileFields);
        toast.success('Profile updated successfully!');
      } catch (err) {
        toast.error('Failed to update profile.');
        throw err;
      }
    },
    [user]
  );

  const handleChangePassword = useCallback(async (newPassword) => {
    try {
      await changeAdminPassword(newPassword);
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
      throw err;
    }
  }, []);

  const value = {
    user,
    adminProfile,
    role: adminProfile?.role || role,
    permissions: adminProfile?.permissions || permissions,
    accountStatus: adminProfile?.status || 'Active',
    loading,
    error,
    isAuthenticated: Boolean(user && adminProfile?.status === 'Active'),
    login,
    logout,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
