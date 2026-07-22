import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebaseConfig';
import { ROLES } from '../../constants/routes';

// Mock session key for local testing when Firebase credentials are not yet populated in .env
const MOCK_STORAGE_KEY = 'borrow_admin_mock_session';

/**
 * Log in librarian using Email + Password
 */
export const loginWithEmailPassword = async (email, password) => {
  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        user: userCredential.user,
        role: ROLES.ADMIN, // Default role for portal users
      };
    } catch (error) {
      throw new Error(formatAuthError(error.code || error.message));
    }
  }

  // Fallback demo authentication for development before .env keys are added
  if (email === 'admin@borrow.com' && password === 'admin123') {
    const mockUser = {
      uid: 'demo-admin-uid-128',
      email: 'admin@borrow.com',
      displayName: 'Lead Librarian Admin',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    return { user: mockUser, role: ROLES.ADMIN };
  } else if (email && password) {
    // Standard mock user for any non-empty input during dev demo
    const mockUser = {
      uid: `user-${Date.now()}`,
      email,
      displayName: email.split('@')[0].toUpperCase(),
      photoURL: null,
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    return { user: mockUser, role: ROLES.ADMIN };
  } else {
    throw new Error('Please enter valid email and password credentials.');
  }
};

/**
 * Log out current librarian
 */
export const logoutUser = async () => {
  localStorage.removeItem(MOCK_STORAGE_KEY);
  if (isFirebaseConfigured) {
    await signOut(auth);
  }
};

/**
 * Listen to auth state changes
 */
export const subscribeToAuthState = (callback) => {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({ user, role: ROLES.ADMIN, loading: false });
      } else {
        callback({ user: null, role: null, loading: false });
      }
    });
  }

  // Check mock session
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      callback({ user: parsed, role: ROLES.ADMIN, loading: false });
    } catch {
      callback({ user: null, role: null, loading: false });
    }
  } else {
    callback({ user: null, role: null, loading: false });
  }

  return () => {}; // Unsubscribe void function
};

/**
 * Reset password
 */
export const resetPassword = async (email) => {
  if (isFirebaseConfigured) {
    await sendPasswordResetEmail(auth, email);
  }
  return true;
};

/**
 * Helper to turn Firebase error codes into human-readable messages
 */
function formatAuthError(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This librarian account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Account temporarily locked.';
    default:
      return errorCode || 'Authentication failed. Please check your credentials.';
  }
}
