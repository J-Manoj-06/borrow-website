import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { ROLES } from '../../constants/routes';
import { logActivityRecord } from './activityService';
import { DEFAULT_ROLE_PERMISSIONS, SYSTEM_ROLES } from '../../models/rbacModel';

const ADMINS_COLLECTION = 'admins';

/**
  Format Firebase Auth errors into friendly messages
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
      return 'Invalid email or password credentials. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Account temporarily locked for security.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    default:
      return errorCode || 'Authentication failed. Please verify your credentials.';
  }
}

/**
  Get Device & Browser info string
 */
function getDevicePlatform() {
  if (typeof window === 'undefined' || !window.navigator) return 'Web Desktop';
  const ua = window.navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile Browser';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Device';
  if (/Android/.test(ua)) return 'Android Device';
  if (/Windows/.test(ua)) return 'Windows Desktop';
  if (/Macintosh/.test(ua)) return 'macOS Desktop';
  return 'Web Client';
}

/**
  Find or initialize Admin Document in Firestore
 */
export const getAdminProfileDoc = async (user) => {
  if (!user) return null;

  const docRef = doc(db, ADMINS_COLLECTION, user.uid);
  let docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Check if doc exists by email
    const q = query(collection(db, ADMINS_COLLECTION), where('email', '==', user.email));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const matchDoc = querySnap.docs[0];
      return { id: matchDoc.id, ...matchDoc.data() };
    }

    // Provision initial Admin Document in Firestore
    const newAdminDoc = {
      uid: user.uid,
      adminId: `ADM-${Date.now().toString().slice(-4)}`,
      fullName: user.displayName || user.email.split('@')[0].toUpperCase(),
      email: user.email,
      phone: '',
      department: 'Central University Library',
      role: SYSTEM_ROLES.SUPER_ADMIN,
      status: 'Active',
      permissions: DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.SUPER_ADMIN],
      avatarUrl: user.photoURL || '',
      lastLogin: new Date().toISOString(),
      loginTimestamp: new Date().toISOString(),
      loginDevice: getDevicePlatform(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newAdminDoc);
    return { id: user.uid, ...newAdminDoc };
  }

  return { id: docSnap.id, ...docSnap.data() };
};

/**
  Log in librarian using Email + Password with Firestore account status verification
 */
export const loginWithEmailPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const adminProfile = await getAdminProfileDoc(user);

    // Verify account status
    if (adminProfile && adminProfile.status && adminProfile.status !== 'Active') {
      await signOut(auth);
      await logActivityRecord({
        user: email,
        action: `blocked login attempt (Status: ${adminProfile.status})`,
        target: 'Authentication',
        type: 'auth',
        status: 'Failed',
      });
      throw new Error(`Your admin account is currently ${adminProfile.status}. Please contact a Super Administrator.`);
    }

    // Update last login metadata in Firestore
    const nowIso = new Date().toISOString();
    const docRef = doc(db, ADMINS_COLLECTION, adminProfile.id || user.uid);
    await updateDoc(docRef, {
      lastLogin: nowIso,
      loginTimestamp: nowIso,
      loginDevice: getDevicePlatform(),
      updatedAt: serverTimestamp(),
    }).catch(console.warn);

    // Record login audit event
    await logActivityRecord({
      user: adminProfile?.fullName || user.displayName || email,
      action: 'signed into Borrow Admin Portal',
      target: 'Authentication',
      type: 'auth',
      status: 'Success',
      device: getDevicePlatform(),
    });

    return {
      user,
      adminProfile,
      role: adminProfile?.role || ROLES.ADMIN,
    };
  } catch (error) {
    const message = formatAuthError(error.code || error.message);
    throw new Error(message);
  }
};

/**
  Log out current librarian with audit trail
 */
export const logoutUser = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await logActivityRecord({
      user: currentUser.displayName || currentUser.email || 'Admin',
      action: 'logged out of Borrow Admin Portal',
      target: 'Authentication',
      type: 'auth',
    }).catch(console.warn);
  }
  await signOut(auth);
};

/**
  Subscribe to Real-Time Firebase Auth & Firestore Admin Profile State
 */
export const subscribeToAuthState = (callback) => {
  let docUnsubscribe = null;

  const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (docUnsubscribe) {
      docUnsubscribe();
      docUnsubscribe = null;
    }

    if (!firebaseUser) {
      callback({ user: null, adminProfile: null, role: null, permissions: null, loading: false });
      return;
    }

    // Real-time snapshot listener on the user's admin profile document in Firestore
    const docRef = doc(db, ADMINS_COLLECTION, firebaseUser.uid);

    docUnsubscribe = onSnapshot(
      docRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          // Attempt fallback search or auto-provisioning
          const profile = await getAdminProfileDoc(firebaseUser);
          callback({
            user: firebaseUser,
            adminProfile: profile,
            role: profile?.role || SYSTEM_ROLES.SUPER_ADMIN,
            permissions: profile?.permissions || DEFAULT_ROLE_PERMISSIONS[profile?.role || SYSTEM_ROLES.SUPER_ADMIN],
            loading: false,
          });
          return;
        }

        const adminProfile = { id: docSnap.id, ...docSnap.data() };

        // Instant access revocation if account status becomes non-Active in real time
        if (adminProfile.status && adminProfile.status !== 'Active') {
          await signOut(auth);
          callback({ user: null, adminProfile: null, role: null, permissions: null, loading: false });
          return;
        }

        const effectiveRole = adminProfile.role || SYSTEM_ROLES.SUPER_ADMIN;
        const effectivePermissions = adminProfile.permissions || DEFAULT_ROLE_PERMISSIONS[effectiveRole];

        callback({
          user: firebaseUser,
          adminProfile,
          role: effectiveRole,
          permissions: effectivePermissions,
          loading: false,
        });
      },
      (err) => {
        console.error('Firestore admin profile subscription error:', err);
        callback({
          user: firebaseUser,
          adminProfile: null,
          role: SYSTEM_ROLES.SUPER_ADMIN,
          permissions: DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.SUPER_ADMIN],
          loading: false,
        });
      }
    );
  });

  return () => {
    if (docUnsubscribe) docUnsubscribe();
    authUnsubscribe();
  };
};

/**
  Send Password Reset Email
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email.trim());
  await logActivityRecord({
    user: email,
    action: 'requested password recovery email',
    target: 'Authentication',
    type: 'auth',
  }).catch(console.warn);
  return true;
};

/**
  Update Admin User Profile Details
 */
export const updateAdminUserProfile = async (uid, profileFields) => {
  const docRef = doc(db, ADMINS_COLLECTION, uid);
  await updateDoc(docRef, {
    ...profileFields,
    updatedAt: serverTimestamp(),
  });

  if (auth.currentUser && auth.currentUser.uid === uid) {
    if (profileFields.fullName || profileFields.avatarUrl) {
      await updateProfile(auth.currentUser, {
        displayName: profileFields.fullName || auth.currentUser.displayName,
        photoURL: profileFields.avatarUrl || auth.currentUser.photoURL,
      }).catch(console.warn);
    }
  }

  await logActivityRecord({
    user: profileFields.fullName || 'Admin',
    action: 'updated profile information',
    target: 'User Profile',
    type: 'profile',
  }).catch(console.warn);

  return true;
};

/**
  Change Password for Logged-In User
 */
export const changeAdminPassword = async (newPassword) => {
  if (!auth.currentUser) throw new Error('No authenticated user session found.');
  await updatePassword(auth.currentUser, newPassword);
  await logActivityRecord({
    user: auth.currentUser.email,
    action: 'changed account password',
    target: 'Security',
    type: 'auth',
  }).catch(console.warn);
  return true;
};
