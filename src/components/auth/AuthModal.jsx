import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, Phone, ArrowRight, CheckCircle2, RefreshCw,
  ShieldCheck, Send, AlertCircle, Mail, Lock, UserPlus, LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AuthModal({ isFullScreen = false }) {
  const {
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    loginAsDemo,
    sendPhoneOtp,
    verifyPhoneOtp,
    user,
    approveStudentAccess,
    adminInbox
  } = useAuth();
  const { language } = useApp();
  const isHi = language === 'hi';

  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'mobile' | 'google'

  // Email state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Mobile OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Pending Approval screen (if any) ──────────────────────────────────
  if (user && user.verificationStatus === 'pending_admin_approval') {
    const latestReq = adminInbox?.find(r => r.uid === user.uid);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
        <div className="w-full max-w-md glass-card-clean rounded-3xl p-7 border border-amber-500/40 shadow-2xl space-y-5 text-center">
          <div className="text-5xl animate-bounce">⏳</div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              🔔 Access Request Sent to App Developer
            </span>
            <h3 className="text-xl font-extrabold text-white mt-2">
              {isHi ? 'एडमिन अनुमति प्रतीक्षा में है' : 'Pending Developer Approval'}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isHi
                ? 'आपका प्रमाणीकरण सफल रहा! जब तक Developer आपको Approve नहीं करेंगे, ऐप सुरक्षित रहेगा।'
                : 'Authentication successful! App access will unlock once approved.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 text-left text-xs font-mono space-y-1.5">
            <div className="text-amber-400 font-bold font-sans flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Request Details:
            </div>
            <div className="text-gray-300"><b>Name:</b> {user.name}</div>
            <div className="text-gray-300"><b>Contact:</b> {user.phone || user.email}</div>
            <div className="text-gray-300"><b>Method:</b> {user.loginType?.toUpperCase()}</div>
          </div>

          <button
            onClick={() => {
              const uid = latestReq?.uid || user.uid;
              approveStudentAccess(uid);
              try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (e) {}
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>{isHi ? '⚡ अभी Approve करें' : '⚡ Approve Access Now'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Error helper ─────────────────────────────────────────────────────
  const firebaseErrorMsg = (code, raw) => {
    const map = {
      'auth/invalid-phone-number': isHi ? 'गलत मोबाइल नंबर प्रारूप।' : 'Invalid phone number format.',
      'auth/too-many-requests': isHi ? 'बहुत अधिक प्रयास। कृपया थोड़ी देर बाद पुनः प्रयास करें।' : 'Too many attempts. Wait a few minutes and retry.',
      'auth/invalid-verification-code': isHi ? '❌ गलत OTP दर्ज किया गया है। पुनः जांचें।' : '❌ Wrong OTP code entered. Check and retry.',
      'auth/missing-phone-number': isHi ? 'मोबाइल नंबर आवश्यक है।' : 'Phone number is required.',
      'auth/captcha-check-failed': isHi ? 'reCAPTCHA विफल रहा। पेज रिफ्रेश करें।' : 'reCAPTCHA failed. Refresh page and try again.',
      'auth/quota-exceeded': isHi ? 'SMS सीमा समाप्त। ईमेल से लॉगिन करें।' : 'SMS quota exceeded. Please sign in with Email.',
      'auth/popup-closed-by-user': isHi ? 'Google पॉपअप बंद हो गया। पुनः प्रयास करें।' : 'Google popup closed. Please try again.',
      'auth/network-request-failed': isHi ? 'इंटरनेट कनेक्शन जांचें।' : 'Network error. Check internet connection.',
      'auth/operation-not-allowed': isHi ? 'यह साइन-इन विधि Firebase Console में सक्षम नहीं है।' : 'This sign-in method is not enabled in Firebase Console.',
      'auth/invalid-email': isHi ? 'गलत ईमेल आईडी। सही ईमेल दर्ज करें।' : 'Invalid email address format.',
      'auth/user-not-found': isHi ? 'यह ईमेल पंजीकृत नहीं है। कृपया "नया खाता बनाएँ" चुनें।' : 'No account found with this email. Please click "Sign Up".',
      'auth/wrong-password': isHi ? 'गलत पासवर्ड दर्ज किया गया है।' : 'Incorrect password. Please try again.',
      'auth/email-already-in-use': isHi ? 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।' : 'Email is already registered. Please sign in.',
      'auth/weak-password': isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.',
      'auth/invalid-credential': isHi ? 'गलत ईमेल या पासवर्ड।' : 'Invalid email or password credentials.',
    };
    return map[code] || raw?.split('(')[0]?.trim() || (isHi ? 'कुछ त्रुटि हुई। पुनः प्रयास करें।' : 'Something went wrong. Please try again.');
  };

  // ── Email Sign-In / Smart Auto-Registration ─────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(isHi ? 'कृपया सही ईमेल दर्ज करें (उदा. jasmeet@gmail.com)' : 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters');
      return;
    }
    setIsEmailLoading(true);
    try {
      if (isSignUp) {
        await signupWithEmail(cleanEmail, password, fullName.trim() || cleanEmail.split('@')[0]);
      } else {
        try {
          // 1. First try signing in
          await loginWithEmail(cleanEmail, password);
        } catch (loginErr) {
          // 2. If user is new / not yet registered, automatically create the account!
          if (
            loginErr.code === 'auth/user-not-found' ||
            loginErr.code === 'auth/invalid-credential' ||
            loginErr.code === 'auth/invalid-login-credentials'
          ) {
            try {
              await signupWithEmail(cleanEmail, password, fullName.trim() || cleanEmail.split('@')[0]);
            } catch (signupErr) {
              throw loginErr; // If signup also failed (e.g. wrong password on existing account), throw original
            }
          } else {
            throw loginErr;
          }
        }
      }
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (err) {}
    } catch (e) {
      console.error('Email Auth Error:', e);
      setErrorMsg(firebaseErrorMsg(e.code, e.message));
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Google Sign-In ───────────────────────────────────────────────────
  const handleGoogle = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (err) {}
    } catch (e) {
      setErrorMsg(firebaseErrorMsg(e.code, e.message));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Phone: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (phone.length < 10) {
      setErrorMsg(isHi ? '10-अंकों का मोबाइल नंबर दर्ज करें' : 'Enter valid 10-digit mobile number');
      return;
    }
    setIsSendingOtp(true);
    try {
      await sendPhoneOtp(`+91${phone}`);
      setOtpSent(true);
    } catch (e) {
      console.error('Phone OTP error:', e.code, e.message);
      setErrorMsg(firebaseErrorMsg(e.code, e.message));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Phone: Verify OTP ─────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifyingOtp(true);
    try {
      await verifyPhoneOtp(otp, `+91${phone}`);
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (err) {}
    } catch (e) {
      setErrorMsg(firebaseErrorMsg(e.code, e.message));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className={`${isFullScreen ? 'min-h-screen flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl'} overflow-y-auto`}>
      {/* reCAPTCHA container — must stay in DOM permanently */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0, zIndex: -1 }}></div>

      <div className="relative w-full max-w-md glass-card-clean rounded-3xl p-6 lg:p-8 border border-cyan-500/40 shadow-2xl my-8 space-y-5">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/20 mx-auto">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white m-0">
            {isHi ? 'MainsAI छात्र पोर्टल में प्रवेश करें 🎯' : 'Login to MainsAI Portal 🎯'}
          </h2>
          <p className="text-xs text-gray-400 m-0">
            {isHi ? 'सुरक्षित प्रमाणीकरण • UPSC & BPSC टेस्ट पोर्टल' : 'Secured Authentication • UPSC & BPSC Test Portal'}
          </p>
        </div>

        {/* ── 1-TAP INSTANT ACCESS (No Password/OTP required) ── */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-amber-400">
            <span className="flex items-center gap-1.5">⚡ {isHi ? 'त्वरित 1-टैप प्रवेश (डायरेक्ट डेमो)' : 'Instant 1-Tap Access (Fast Demo)'}</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">बिना पासवर्ड / OTP</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsDemo('student', 'Jasmeet (Aspirant)');
                try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (e) {}
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all border border-cyan-400/30"
            >
              <span className="text-sm">👨‍🎓</span>
              <span>Jasmeet (छात्र)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loginAsDemo('teacher', 'Faculty Senior Examiner');
                try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (e) {}
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all border border-purple-400/30"
            >
              <span className="text-sm">👨‍🏫</span>
              <span>शिक्षक (Faculty)</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
            {isHi ? 'या अपने अकाउंट से लॉगिन करें' : 'Or sign in with your account'}
          </span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* ── 3-WAY METHOD SWITCHER ── */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 border ${
              authMethod === 'email'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isHi ? 'ईमेल' : 'Email'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 border ${
              authMethod === 'google'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xs">🌐</span>
            <span className="truncate">Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('mobile'); setErrorMsg(''); setOtpSent(false); }}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 border ${
              authMethod === 'mobile'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isHi ? 'मोबाइल' : 'Mobile'}</span>
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* ── METHOD 1: Email Direct Sign-In / Sign-Up ─────────────────── */}
        {authMethod === 'email' && (
          <div className="animate-fadeIn space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {isHi ? 'पूरा नाम' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isHi ? 'अपना नाम दर्ज करें' : 'Enter your full name'}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {isHi ? 'ईमेल आईडी' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aspirant@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {isHi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 characters)'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full py-3 rounded-xl btn-primary-clean text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-cyan-500/20"
              >
                {isEmailLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isSignUp ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>
                  {isEmailLoading
                    ? (isHi ? 'कृपया प्रतीक्षा करें...' : 'Processing...')
                    : isSignUp
                    ? (isHi ? 'नया खाता बनाएँ (Sign Up)' : 'Create Free Account')
                    : (isHi ? 'ईमेल से लॉगिन करें (Sign In)' : 'Sign In with Email')}
                </span>
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              >
                {isSignUp
                  ? (isHi ? 'पहले से खाता है? यहाँ लॉगिन करें' : 'Already have an account? Sign In')
                  : (isHi ? 'नया छात्र हैं? यहाँ मुफ़्त खाता बनाएँ' : "New student? Create an account")}
              </button>
            </div>
          </div>
        )}

        {/* ── METHOD 2: Google 1-Click ─────────────────────────────────── */}
        {authMethod === 'google' && (
          <div className="animate-fadeIn space-y-3.5">
            <button
              onClick={handleGoogle}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-slate-950 font-extrabold text-xs shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting to Google...' : (isHi ? 'Google खाते से Sign In करें (1-Click)' : 'Sign in with Google Account (1-Click)')}</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              ✓ 1-Click Fast Google OAuth • Lifetime Free Access
            </p>
          </div>
        )}

        {/* ── METHOD 3: Mobile OTP ─────────────────────────────────────── */}
        {authMethod === 'mobile' && (
          <div className="animate-fadeIn space-y-4">
            {/* Sample Testing Number Banner */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>🧪 {isHi ? 'सैम्पल टेस्टिंग नंबर & OTP:' : 'Sample Test Number & OTP:'}</span>
                <span className="text-[10px] text-cyan-300 font-bold bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-400/30">100% Free / No SMS</span>
              </div>
              <div className="flex items-center justify-between font-mono text-cyan-300 text-xs pt-0.5">
                <span><b>Mobile:</b> 9876543210</span>
                <span><b>OTP:</b> 123456</span>
              </div>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {isHi ? '10-अंकों का मोबाइल नंबर' : '10-Digit Mobile Number'}
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-gray-300 font-bold">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-bold tracking-wider"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl btn-primary-clean text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSendingOtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{isSendingOtp ? 'Sending SMS OTP...' : (isHi ? 'OTP कोड भेजें (SMS)' : 'Send SMS OTP Code')}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                  <span>OTP sent to <strong>+91 {phone}</strong></span>
                  <button type="button" onClick={() => setOtpSent(false)} className="text-cyan-400 underline text-xs font-bold">Change</button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {isHi ? 'SMS में प्राप्त OTP दर्ज करें' : 'Enter OTP received via SMS'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="6-digit OTP"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-bold text-center tracking-widest text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isVerifyingOtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isVerifyingOtp ? 'Verifying...' : (isHi ? 'OTP सत्यापित करें' : 'Verify OTP & Login')}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>256-Bit SSL Encrypted • Direct Portal Access</span>
        </div>

      </div>
    </div>
  );
}
