import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  loginWithEmailPassword,
  logoutUser,
  subscribeToAuthState,
  resetPassword,
} from '../services/firebase/authService';
import { ROLES } from '../constants/routes';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(ROLES.ADMIN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(({ user: currentUser, role: userRole, loading: isAuthLoading }) => {
      setUser(currentUser);
      if (userRole) setRole(userRole);
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
      setRole(result.role);
      toast.success(`Welcome back, ${result.user.displayName || result.user.email}!`);
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
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetPassword = useCallback(async (email) => {
    try {
      await resetPassword(email);
      toast.success('Password reset instructions sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Password reset request failed.');
    }
  }, []);

  const value = {
    user,
    role,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    logout,
    resetPassword: handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
