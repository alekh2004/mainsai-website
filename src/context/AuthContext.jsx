import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
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
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc
} from 'firebase/firestore';

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

  // ── Listen to Firebase Auth state & sync with Firestore ───────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Immediate local cache load for zero UI latency
        const students = getStudents();
        let profile = students[firebaseUser.uid];
        if (profile) {
          setUser(profile);
        }

        // 2. Fetch latest from Cloud Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            profile = { ...profile, ...userDoc.data() };
            students[firebaseUser.uid] = profile;
            saveStudents(students);
            setUser(profile);
          } else {
            // Document doesn't exist in Firestore yet, sync it up
            profile = await saveStudentProfile(firebaseUser, profile || {});
          }
        } catch (err) {
          console.warn('Firestore user fetch fallback:', err);
          if (!profile) {
            profile = await saveStudentProfile(firebaseUser);
          }
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Create & save student profile to localStorage & Firestore ────────
  const saveStudentProfile = async (firebaseUser, extra = {}) => {
    const students = getStudents();
    const existing = students[firebaseUser.uid];

    const profile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || extra.name || existing?.name || 'Aspirant Student',
      email: firebaseUser.email || extra.email || existing?.email || '',
      phone: firebaseUser.phoneNumber || extra.phone || existing?.phone || '',
      photoURL: firebaseUser.photoURL || '',
      loginType: extra.loginType || existing?.loginType || 'email',
      avatar: extra.avatar || existing?.avatar || '👨‍🎓',
      role: existing?.role || 'student',
      plan: existing?.plan || 'pro',
      evaluationsLeft: existing?.evaluationsLeft ?? 9999,
      teacherReviewsLeft: existing?.teacherReviewsLeft ?? 5,
      verificationStatus: 'approved',
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

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc user profile fallback:', e);
    }

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

  const switchRole = async (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    const students = getStudents();
    if (students[user.uid]) {
      students[user.uid].role = newRole;
      saveStudents(students);
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
    } catch (e) {
      console.warn('Firestore switchRole fallback:', e);
    }
  };

  const updateApiKey = (key) => {
    setApiKey(key || DEFAULT_API_KEY);
    localStorage.setItem('gemini_api_key', key || DEFAULT_API_KEY);
  };

  const upgradePlan = async (planName, paymentMeta = {}) => {
    if (!user) return;
    const updated = {
      ...user,
      plan: planName,
      planUpdatedAt: new Date().toISOString()
    };
    setUser(updated);

    // 1. Save to local cache
    const students = getStudents();
    if (students[user.uid]) {
      students[user.uid] = updated;
      saveStudents(students);
    }

    // 2. Save to Cloud Firestore users collection
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        plan: planName,
        planUpdatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore user plan update fallback:', e);
    }

    // 3. Record subscription transaction in Firestore subscriptions collection
    try {
      const subRecord = {
        userId: user.uid,
        userName: user.name || '',
        userEmail: user.email || '',
        userPhone: user.phone || '',
        plan: planName,
        amount: planName === 'ultimate' ? 999 : planName === 'pro' ? 499 : 0,
        paymentMethod: paymentMeta.method || 'upi',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'subscriptions'), subRecord);
    } catch (e) {
      console.warn('Firestore subscription record fallback:', e);
    }
  };

  const loginAsDemo = (role = 'student', customName = 'Aspirant Student') => {
    const demoUser = {
      uid: `user_${Date.now()}`,
      name: role === 'teacher' ? 'Faculty Senior Examiner' : customName,
      email: role === 'teacher' ? 'faculty@mainsai.edu' : 'aspirant@mainsai.edu',
      phone: '+91 9876543210',
      photoURL: '',
      loginType: 'instant',
      avatar: role === 'teacher' ? '👨‍🏫' : '👨‍🎓',
      role: role,
      plan: 'pro',
      evaluationsLeft: 9999,
      teacherReviewsLeft: 20,
      verificationStatus: 'approved',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    const students = getStudents();
    students[demoUser.uid] = demoUser;
    saveStudents(students);
    setUser(demoUser);
    return demoUser;
  };

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      adminInbox,
      apiKey,
      updateApiKey,
      loginWithGoogle,
      loginAsDemo,
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
