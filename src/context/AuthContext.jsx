import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// ── LocalStorage helpers for student data ─────────────────────────────
const LS_STUDENTS = 'mainsai_students';
const LS_INBOX    = 'mainsai_admin_inbox';

const getStudents = () => JSON.parse(localStorage.getItem(LS_STUDENTS) || '{}');
const saveStudents = (data) => localStorage.setItem(LS_STUDENTS, JSON.stringify(data));

const getInbox = () => JSON.parse(localStorage.getItem(LS_INBOX) || '[]');
const saveInbox = (data) => localStorage.setItem(LS_INBOX, JSON.stringify(data));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminInbox, setAdminInbox] = useState(() => getInbox());

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('gemini_api_key') || DEFAULT_API_KEY
  );
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Listen to Firebase Auth state ─────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Load profile from localStorage
        const students = getStudents();
        const profile = students[firebaseUser.uid];
        if (profile) {
          setUser(profile);
        } else {
          // Firebase session exists but no local profile — sign out cleanly
          signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Create & save student profile to localStorage ─────────────────────
  const saveStudentProfile = (firebaseUser, extra = {}) => {
    const students = getStudents();
    const existing = students[firebaseUser.uid];

    const profile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || extra.name || 'Aspirant Student',
      email: firebaseUser.email || extra.email || '',
      phone: firebaseUser.phoneNumber || extra.phone || '',
      photoURL: firebaseUser.photoURL || '',
      loginType: extra.loginType || 'email',
      avatar: extra.avatar || '👨‍🎓',
      role: 'student',
      plan: 'pro',
      evaluationsLeft: 9999,
      teacherReviewsLeft: 5,
      verificationStatus: existing ? existing.verificationStatus : 'pending_admin_approval',
      createdAt: existing?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Save to localStorage
    students[firebaseUser.uid] = profile;
    saveStudents(students);

    // Add to Admin Inbox only on FIRST registration
    if (!existing) {
      const inbox = getInbox();
      const newReq = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        loginType: profile.loginType,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      };
      const updatedInbox = [newReq, ...inbox];
      saveInbox(updatedInbox);
      setAdminInbox(updatedInbox);
    }

    setUser(profile);
    return profile;
  };

  // ── GOOGLE LOGIN (Real Firebase OAuth Popup) ──────────────────────────
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return saveStudentProfile(result.user, { loginType: 'google', avatar: '🌐' });
  };

  // ── PHONE: Setup reCAPTCHA ────────────────────────────────────────────
  const setupRecaptcha = () => {
    // Step 1: Clear existing verifier instance
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (e) {}
      window.recaptchaVerifier = null;
    }

    // Step 2: Clear the DOM element contents so reCAPTCHA can re-render fresh
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';

    // Step 3: Create fresh verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        window.recaptchaVerifier = null;
      }
    });

    return window.recaptchaVerifier;
  };

  // ── PHONE: Send real OTP via Firebase ────────────────────────────────
  const sendPhoneOtp = async (phoneNumber) => {
    const appVerifier = setupRecaptcha();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  };

  // ── PHONE: Verify OTP ─────────────────────────────────────────────────
  const verifyPhoneOtp = async (otp, rawPhone) => {
    if (!window.confirmationResult) throw new Error('OTP session expired. Please resend.');
    const result = await window.confirmationResult.confirm(otp);
    return saveStudentProfile(result.user, {
      loginType: 'mobile',
      avatar: '📱',
      phone: rawPhone,
    });
  };

  // ── EMAIL SIGNUP ──────────────────────────────────────────────────────
  const signupWithEmail = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return saveStudentProfile(result.user, { loginType: 'email', avatar: '👨‍🎓', name });
  };

  // ── EMAIL LOGIN ───────────────────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return saveStudentProfile(result.user, { loginType: 'email', avatar: '👨‍🎓' });
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } catch (e) {}
  };

  // ── ADMIN: Approve student ────────────────────────────────────────────
  const approveStudentAccess = (uid) => {
    // Update localStorage
    const students = getStudents();
    if (students[uid]) {
      students[uid].verificationStatus = 'approved';
      students[uid].plan = 'pro';
      students[uid].evaluationsLeft = 9999;
      saveStudents(students);
    }
    const inbox = getInbox().map(r => r.uid === uid ? { ...r, status: 'approved' } : r);
    saveInbox(inbox);
    setAdminInbox(inbox);

    // Use functional update to avoid stale closure
    setUser(prev => {
      if (!prev || prev.uid !== uid) return prev;
      return { ...prev, verificationStatus: 'approved', plan: 'pro', evaluationsLeft: 9999 };
    });
  };

  // ── ADMIN: Reject student ─────────────────────────────────────────────
  const rejectStudentAccess = (uid) => {
    const students = getStudents();
    if (students[uid]) {
      students[uid].verificationStatus = 'rejected';
      saveStudents(students);
    }
    const inbox = getInbox().map(r => r.uid === uid ? { ...r, status: 'rejected' } : r);
    saveInbox(inbox);
    setAdminInbox(inbox);
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    const students = getStudents();
    if (students[user.uid]) {
      students[user.uid].role = newRole;
      saveStudents(students);
    }
  };

  const updateApiKey = (key) => {
    setApiKey(key || DEFAULT_API_KEY);
    localStorage.setItem('gemini_api_key', key || DEFAULT_API_KEY);
  };

  const upgradePlan = (planName) => {
    setUser(prev => prev ? { ...prev, plan: planName } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      adminInbox,
      apiKey,
      updateApiKey,
      loginWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      signupWithEmail,
      loginWithEmail,
      logout,
      switchRole,
      upgradePlan,
      approveStudentAccess,
      rejectStudentAccess,
      showAuthModal,
      setShowAuthModal,
      showPayModal,
      setShowPayModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
