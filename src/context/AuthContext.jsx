import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
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
  getDocs,
  updateDoc,
  collection,
  addDoc,
  query,
  where
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

  // ── PHONE: Check if number already has an account ────────────────────
  // Returns { exists: bool, profile: object | null }
  // Checks localStorage first, then Firestore (phone field query).
  const checkPhone = async (rawPhone) => {
    const cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return { exists: false, profile: null };
    const phoneKey = `phone_${cleanPhone}`;

    // 1. Local cache check
    const students = getStudents();
    const localProfile =
      students[phoneKey] ||
      Object.values(students).find(
        s => s.phone && s.phone.replace(/\D/g, '') === cleanPhone
      );
    if (localProfile) return { exists: true, profile: localProfile };

    // 2. Firestore check (support both +91 prefix and raw 10-digit number)
    try {
      const q1 = query(
        collection(db, 'users'),
        where('phone', '==', `+91${cleanPhone}`)
      );
      let snap = await getDocs(q1);
      if (snap.empty) {
        const q2 = query(
          collection(db, 'users'),
          where('phone', '==', cleanPhone)
        );
        snap = await getDocs(q2);
      }
      if (!snap.empty) {
        const profile = snap.docs[0].data();
        // Cache locally for speed next time
        students[profile.uid] = profile;
        students[phoneKey] = profile;
        saveStudents(students);
        return { exists: true, profile };
      }
    } catch (e) {
      console.warn('Firestore phone lookup failed:', e);
    }

    return { exists: false, profile: null };
  };

  // ── PHONE: Direct login / registration (NO OTP, NO SMS) ───────────────
  // New user  → creates account, saves profile, triggers CompleteProfileModal
  // Existing user → loads saved profile, logs in immediately
  const loginWithPhone = async (rawPhone) => {
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const { exists, profile: existingProfile } = await checkPhone(cleanPhone);

    if (exists && existingProfile) {
      // ── Returning user: restore session ──────────────────────────────
      const refreshed = {
        ...existingProfile,
        lastLoginAt: new Date().toISOString(),
      };
      const students = getStudents();
      students[existingProfile.uid] = refreshed;
      students[`phone_${cleanPhone}`] = refreshed;
      saveStudents(students);
      setUser(refreshed);
      try {
        await setDoc(doc(db, 'users', existingProfile.uid), refreshed, { merge: true });
      } catch (e) {
        console.warn('Firestore login refresh failed:', e);
      }
      return { isNew: false, profile: refreshed };
    }

    // ── New user: create minimal profile ─────────────────────────────
    const uid = `phone_${cleanPhone}_${Date.now()}`;
    const newProfile = await saveStudentProfile(
      {
        uid,
        displayName: '',
        email: '',
        phoneNumber: `+91${cleanPhone}`,
      },
      {
        loginType: 'mobile',
        avatar: '📱',
        phone: `+91${cleanPhone}`,
        uid,
      }
    );
    return { isNew: true, profile: newProfile };
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
      checkPhone,
      loginWithPhone,
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
