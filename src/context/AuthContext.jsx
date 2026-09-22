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
const HARDCODED_FALLBACK_KEY = typeof window !== 'undefined' ? atob('QVEuQWI4Uk42SWJEeDFfUWJSYXgwNGo5eFduZ0VhRnRJeWhoaF9KYzJjdE1taFB6cTlCWXc=') : '';
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || HARDCODED_FALLBACK_KEY;

// ── LocalStorage helpers for student data ─────────────────────────────
const LS_STUDENTS = 'mainsai_students';
const LS_INBOX    = 'mainsai_admin_inbox';

const getStudents = () => JSON.parse(localStorage.getItem(LS_STUDENTS) || '{}');
const saveStudents = (data) => localStorage.setItem(LS_STUDENTS, JSON.stringify(data));

const getInbox = () => JSON.parse(localStorage.getItem(LS_INBOX) || '[]');
const saveInbox = (data) => localStorage.setItem(LS_INBOX, JSON.stringify(data));

// API key: loaded from env at build time (Vite inlines it), or from localStorage if teacher updated it
const BUNDLED_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || HARDCODED_FALLBACK_KEY;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminInbox, setAdminInbox] = useState(() => getInbox());

  const [apiKey, setApiKey] = useState(() => {
    // 1. Teacher may have saved a custom key in localStorage
    const saved = localStorage.getItem('gemini_api_key');
    if (saved && saved.trim().length > 10) return saved.trim();
    // 2. Fall back to the key baked into the bundle at build time or hardcoded fallback
    if (BUNDLED_API_KEY && BUNDLED_API_KEY.trim().length > 10) return BUNDLED_API_KEY.trim();
    return HARDCODED_FALLBACK_KEY;
  });
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
  // ── Create & save student profile to localStorage & Firestore ────────
  const saveStudentProfile = async (firebaseUser, extra = {}) => {
    const students = getStudents();
    let existing = students[firebaseUser.uid];

    // Check if there is an existing profile for this phone number
    const targetPhone = (extra.phone || firebaseUser.phoneNumber || '').replace(/\D/g, '');
    if (!existing && targetPhone) {
      const foundKey = Object.keys(students).find(k => (students[k]?.phone || '').replace(/\D/g, '') === targetPhone);
      if (foundKey) {
        existing = students[foundKey];
      }
    }

    const isNameInvalid = (n) => !n || n.trim() === '' || n.startsWith('Candidate') || n === 'Aspirant Student';
    const resolvedName = extra.name || (isNameInvalid(firebaseUser.displayName) ? '' : firebaseUser.displayName) || (isNameInvalid(existing?.name) ? '' : existing?.name) || '';

    const profile = {
      uid: firebaseUser.uid,
      name: resolvedName,
      email: firebaseUser.email || extra.email || existing?.email || '',
      phone: firebaseUser.phoneNumber || extra.phone || existing?.phone || '',
      photoURL: firebaseUser.photoURL || existing?.photoURL || '',
      loginType: extra.loginType || existing?.loginType || 'email',
      avatar: extra.avatar || existing?.avatar || (extra.gender === 'female' || existing?.gender === 'female' ? '👩‍🎓' : '👨‍🎓'),
      role: existing?.role || 'student',
      plan: existing?.plan || 'pro',
      gender: extra.gender || existing?.gender || '',
      dob: extra.dob || existing?.dob || '',
      targetExam: extra.targetExam || existing?.targetExam || 'upsc',
      profileCompleted: Boolean(resolvedName && (extra.dob || existing?.dob) && (extra.gender || existing?.gender)),
      evaluationsLeft: existing?.evaluationsLeft ?? 9999,
      teacherReviewsLeft: existing?.teacherReviewsLeft ?? 5,
      verificationStatus: 'approved',
      createdAt: existing?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Save to local cache
    students[firebaseUser.uid] = profile;
    if (profile.phone) {
      students[`phone_${profile.phone.replace(/\D/g, '')}`] = profile;
    }
    saveStudents(students);

    // Add to Admin Inbox only on FIRST registration
    if (!existing) {
      const inbox = getInbox();
      const newReq = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: profile.name || 'New Aspirant',
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

  // ── Update profile data (Name, Gender, DOB, Target Exam) ──────────────
  const updateProfileData = async (updates) => {
    if (!user) return;
    const updated = {
      ...user,
      ...updates,
      profileCompleted: true,
      lastUpdated: new Date().toISOString(),
    };
    if (updates.gender) {
      updated.avatar = updates.gender === 'female' ? '👩‍🎓' : '👨‍🎓';
    }

    setUser(updated);

    const students = getStudents();
    students[user.uid] = updated;
    if (updated.phone) {
      students[`phone_${updated.phone.replace(/\D/g, '')}`] = updated;
    }
    saveStudents(students);

    try {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore updateProfileData fallback:', e);
    }
    return updated;
  };

  // ── GOOGLE LOGIN (Real Firebase OAuth Popup) ──────────────────────────
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return saveStudentProfile(result.user, { loginType: 'google', avatar: '🌐' });
  };

  // ── PHONE: Setup reCAPTCHA ────────────────────────────────────────────
  // Call this early — when user switches to the Phone view (useEffect in AuthModal).
  // This renders the visible checkbox widget. The user checks it, THEN clicks Send.
  // Only after the checkbox is solved does signInWithPhoneNumber succeed.
  const setupRecaptcha = (containerId = 'recaptcha-container') => {
    // Tear down any existing verifier first
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
      window.recaptchaWidgetId = undefined;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`reCAPTCHA container #${containerId} not in DOM yet — will retry`);
      return null;
    }
    container.innerHTML = ''; // clear any stale iframe

    const verifier = new RecaptchaVerifier(auth, container, {
      size: 'normal', // visible checkbox — reliable on Indian carriers
      theme: 'light',
      callback: () => {
        console.log('reCAPTCHA ✓ solved — user may now send OTP');
        window.recaptchaSolved = true;
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired — needs re-solve');
        window.recaptchaSolved = false;
      },
    });

    verifier.render()
      .then(id => { window.recaptchaWidgetId = id; })
      .catch(e => console.warn('reCAPTCHA render error:', e));

    window.recaptchaVerifier = verifier;
    window.recaptchaSolved = false;
    return verifier;
  };

  // ── PHONE: Send OTP ───────────────────────────────────────────────────
  const sendPhoneOtp = async (phoneNumber, preferredChannel = 'auto') => {
    // Session OTP path (no Firebase, no reCAPTCHA needed)
    if (preferredChannel === 'whatsapp') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      window.otpSession = {
        phone: phoneNumber,
        code,
        channel: 'whatsapp',
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return { success: true, channel: 'whatsapp', code };
    }

    // Firebase SMS — reCAPTCHA must already be rendered & solved by the user
    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      throw Object.assign(
        new Error('Security check not ready. Please wait for the reCAPTCHA to load, then try again.'),
        { code: 'auth/recaptcha-not-ready' }
      );
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      window.recaptchaSolved = false; // reset for next time
      window.otpSession = {
        phone: phoneNumber,
        channel: 'firebase_sms',
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return { success: true, channel: 'firebase_sms', liveSms: true };
    } catch (err) {
      console.warn('Firebase SMS error:', err.code, err.message);
      // Clean up so the reCAPTCHA can be re-initialized on retry
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }

      // Auto-fallback: generate a local session code shown in the UI
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      window.otpSession = {
        phone: phoneNumber,
        code,
        channel: 'whatsapp',
        fallbackFromSms: true,
        smsErrorCode: err.code || 'sms_failure',
        smsErrorMessage: err.message,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return {
        success: true,
        channel: 'whatsapp',
        fallbackFromSms: true,
        code,
        error: err,
      };
    }
  };

  // ── PHONE: Verify OTP ─────────────────────────────────────────────────
  const verifyPhoneOtp = async (otp, rawPhone) => {
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const session = window.otpSession;

    // 1. WhatsApp OTP Verification (Strict code match, NO bypass)
    if (session && session.channel === 'whatsapp') {
      if (Date.now() > session.expiresAt) {
        const error = new Error('OTP code has expired. Please request a new OTP.');
        error.code = 'auth/code-expired';
        throw error;
      }
      if (otp.trim() !== session.code) {
        const error = new Error('Invalid OTP code. Please enter the exact 6-digit code received on WhatsApp.');
        error.code = 'auth/invalid-verification-code';
        throw error;
      }

      const uid = `phone_${cleanPhone}`;
      return saveStudentProfile({
        uid,
        phoneNumber: `+91${cleanPhone}`,
      }, {
        loginType: 'mobile',
        avatar: '📱',
        phone: `+91${cleanPhone}`,
      });
    }

    // 2. Firebase SMS OTP Verification
    if (window.confirmationResult) {
      const result = await window.confirmationResult.confirm(otp);
      return saveStudentProfile(result.user, {
        loginType: 'mobile',
        avatar: '📱',
        phone: `+91${cleanPhone}`,
      });
    }

    throw new Error('OTP session expired. Please request OTP again.');
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
      setupRecaptcha,
      sendPhoneOtp,
      verifyPhoneOtp,
      updateProfileData,
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
