import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  Sparkles, Phone, ArrowRight, CheckCircle2, RefreshCw,
  ShieldCheck, AlertCircle, Mail, Lock, User, LogIn, UserPlus,
  Eye, EyeOff, GraduationCap, Users, BookOpen, BarChart3, Cpu,
  Check, Smartphone, KeyRound, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedParliamentBackground } from './AnimatedParliamentBackground';

export function AuthModal({ isFullScreen = false }) {
  const {
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    switchRole,
    loginAsDemo
  } = useAuth();

  // Selected Mode: 'student' | 'teacher' (from top toggle in Image 1)
  const [selectedRole, setSelectedRole] = useState('student');

  // View Mode: 'email' | 'phone' | 'forgot_password'
  const [authView, setAuthView] = useState('email');

  // Sign in vs Sign up toggle
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Loading & feedback states
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const emailInputRef = useRef(null);

  // ── Standard Friendly Error Mapping ──────────────────────────────────
  const getErrorMessage = (code, rawMessage) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return isSignUp
          ? 'An account with this email might already exist. Please sign in instead.'
          : 'Invalid email or password. If you do not have an account yet, click "Create an account" above.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please click "Create an account" above to register.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please sign in using your password.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address (e.g. name@domain.com).';
      case 'auth/unauthorized-domain':
        return 'Domain not authorized in Firebase. Please add this domain in Firebase Console > Authentication > Settings.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window was closed before completing. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please enter a valid 10-digit mobile number.';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP code entered. Please check and try again.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded for today. Please sign in using Google or Email.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few moments and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      default:
        return rawMessage?.split('(')[0]?.trim() || 'Authentication failed. Please try again.';
    }
  };

  // ── Handle Email Authentication ─────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsEmailLoading(true);
    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsEmailLoading(false);
          return;
        }
        await signupWithEmail(cleanEmail, password, fullName.trim());
      } else {
        await loginWithEmail(cleanEmail, password);
      }
      // Apply selected role
      if (switchRole && selectedRole) {
        try { await switchRole(selectedRole); } catch (_) {}
      }
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (_) {}
    } catch (err) {
      console.error('Email Auth Error:', err);
      setErrorMsg(getErrorMessage(err.code, err.message));
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Handle Google Authentication ────────────────────────────────────
  const handleGoogle = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (switchRole && selectedRole) {
        try { await switchRole(selectedRole); } catch (_) {}
      }
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (_) {}
    } catch (err) {
      console.error('Google Auth Error:', err);
      setErrorMsg(getErrorMessage(err.code, err.message));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Handle Phone Send OTP ───────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await sendPhoneOtp(`+91${cleanPhone}`);
      setOtpSent(true);
    } catch (err) {
      console.error('Phone Send Error:', err);
      setErrorMsg(getErrorMessage(err.code, err.message));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Handle Phone Verify OTP ─────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyPhoneOtp(cleanOtp, `+91${phone.replace(/\D/g, '')}`);
      if (switchRole && selectedRole) {
        try { await switchRole(selectedRole); } catch (_) {}
      }
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (_) {}
    } catch (err) {
      console.error('Phone Verify Error:', err);
      setErrorMsg(getErrorMessage(err.code, err.message));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ── Handle Password Reset ───────────────────────────────────────────
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter your registered email address first.');
      return;
    }

    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMsg(`Password reset link sent to ${cleanEmail}. Please check your inbox or spam folder.`);
    } catch (err) {
      setErrorMsg(getErrorMessage(err.code, err.message));
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0, zIndex: -1 }}></div>

      {/* ── Cinematic Live Parliament Animated Background ── */}
      <AnimatedParliamentBackground />

      {/* ── Top Bar / Header ── */}
      <header className="relative z-10 w-full px-6 lg:px-12 py-5 flex items-center justify-between">
        {/* Brand Logo & Subtitle — High-Contrast Acrylic Badge */}
        <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/40 border border-white/40">
            {/* Custom Stylized Dual-Page Book Icon */}
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none m-0 drop-shadow-md">
              AI Mains Evaluator
            </h1>
            <p className="text-[11px] sm:text-[12px] font-black text-cyan-400 tracking-wider uppercase mt-1 m-0 drop-shadow-sm">
              EVALUATE · LEARN · EXCEL
            </p>
          </div>
        </div>

        {/* Top Right Tagline */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-white tracking-wide bg-slate-950/70 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/20 shadow-xl">
          <span className="text-cyan-400 font-black">—</span>
          <span className="text-slate-100">For a Better, More Informed Bharat</span>
        </div>
      </header>

      {/* ── Main Content Area: Left Value Props + Right Glass Login Card ── */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-4 lg:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* ── LEFT COLUMN: Hero Headline, Value Pillars & Study Quote ── */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8 pr-0 lg:pr-4">

          {/* Big Punchy Headline with High-Contrast Light Colors */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12] m-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
              Practice Smarter
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(56,189,248,0.5)]">
                Score Higher
              </span>
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-100 max-w-lg leading-relaxed m-0 pt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              AI-powered answer evaluation for BPSC, UPSC and beyond.
            </p>
          </div>

          {/* 3 Core Feature Badges (High Contrast Acrylic Dark Glass) */}
          <div className="space-y-3.5 max-w-md">
            {/* 1. AI Evaluation */}
            <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 border border-cyan-400/40 flex items-center justify-center shrink-0 text-white shadow-md shadow-blue-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors m-0">
                  AI Evaluation
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-200 m-0">
                  Get detailed, structured feedback
                </p>
              </div>
            </div>

            {/* 2. Performance Insights */}
            <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 border border-purple-400/40 flex items-center justify-center shrink-0 text-white shadow-md shadow-purple-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors m-0">
                  Performance Insights
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-200 m-0">
                  Track progress &amp; improve faster
                </p>
              </div>
            </div>

            {/* 3. Built for Aspirants */}
            <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 border border-pink-400/40 flex items-center justify-center shrink-0 text-white shadow-md shadow-pink-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors m-0">
                  Built for Aspirants
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-200 m-0">
                  Made for serious learners of BPSC, UPSC
                </p>
              </div>
            </div>
          </div>

          {/* Inspirational Study Quote (Golden Luminous Badge) */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-amber-400/40 shadow-xl shadow-black/40">
              <span className="text-amber-400 text-sm">✨</span>
              <p className="text-xs sm:text-sm italic font-extrabold text-amber-200 tracking-wide m-0 drop-shadow-sm">
                &ldquo;Discipline Today · A Brighter Bharat Tomorrow&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Glassmorphism Login / Auth Prototype Card ── */}
        <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[460px] bg-white/80 hover:bg-white/85 transition-all duration-300 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-white/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.30),0_0_0_1px_rgba(255,255,255,0.7)_inset] space-y-5">

            {/* Card Header: Title + Switch Link */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
                  {authView === 'forgot_password'
                    ? 'Reset Password'
                    : authView === 'phone'
                    ? 'Phone Sign In'
                    : isSignUp
                    ? 'Create Account'
                    : 'Welcome Back'}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1 m-0">
                  {authView === 'forgot_password'
                    ? 'Enter your email to receive recovery instructions'
                    : authView === 'phone'
                    ? 'Enter mobile number to receive 6-digit OTP'
                    : isSignUp
                    ? 'Join thousands of serious aspirants today'
                    : 'Sign in to continue to AI Mains Evaluator'}
                </p>
              </div>

              {/* Toggle Sign Up / Sign In */}
              {authView === 'email' && (
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors text-right shrink-0 pt-1"
                >
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </button>
              )}
            </div>

            {/* ── Mode Selector: Student Mode vs Teacher Mode (Exact Match with Image 1) ── */}
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80">
              {/* Student Mode */}
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 border ${
                  selectedRole === 'student'
                    ? 'bg-white text-blue-700 border-blue-500/80 shadow-md shadow-blue-500/10'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-white/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedRole === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black leading-none truncate">
                    Student Mode
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 mt-0.5 truncate">
                    Practice · Learn · Improve
                  </div>
                </div>
              </button>

              {/* Teacher Mode */}
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 border ${
                  selectedRole === 'teacher'
                    ? 'bg-white text-purple-700 border-purple-500/80 shadow-md shadow-purple-500/10'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-white/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedRole === 'teacher' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black leading-none truncate">
                    Teacher Mode
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 mt-0.5 truncate">
                    Evaluate · Manage · Guide
                  </div>
                </div>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="flex-1 leading-snug">{errorMsg}</div>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1 leading-snug">{successMsg}</div>
              </div>
            )}

            {/* ── FORM VIEW 1: Email + Password (Standard UI) ── */}
            {authView === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {/* Full name input for Signup */}
                {isSignUp && (
                  <div>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Candidate Full Name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 border border-slate-200/90 text-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address Input */}
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 border border-slate-200/90 text-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/90 border border-slate-200/90 text-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-[11px] sm:text-xs">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => { setAuthView('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] sm:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Action Button (Gradient pill with arrow matching Image 1) */}
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isEmailLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── FORM VIEW 2: Forgot Password ── */}
            {authView === 'forgot_password' && (
              <form onSubmit={handlePasswordReset} className="space-y-3.5 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-800">
                  Enter your registered email address and we will send a password reset link to your inbox.
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 border border-slate-200/90 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  {isResetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>Send Reset Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthView('email'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}

            {/* ── FORM VIEW 3: Phone OTP Mode ── */}
            {authView === 'phone' && (
              <div className="space-y-3.5 animate-fadeIn">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        10-Digit Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <span className="px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold tracking-wider focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                    >
                      {isSendingOtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      <span>{isSendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                      <span>Code sent to <strong>+91 {phone}</strong></span>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); }}
                        className="text-blue-600 underline font-bold"
                      >
                        Edit
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.trim())}
                        placeholder="123456"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-base font-black text-center tracking-widest focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                    >
                      {isVerifyingOtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{isVerifyingOtp ? 'Verifying OTP...' : 'Verify & Enter Portal'}</span>
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => { setAuthView('email'); setOtpSent(false); setErrorMsg(''); }}
                  className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Email Sign In</span>
                </button>
              </div>
            )}

            {/* ── Divider: "OR" (Exact Match with Image 1) ── */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider rounded-full">
                OR
              </span>
            </div>

            {/* ── Alternative Auth Buttons (3 Pill Buttons Matching Image 1) ── */}
            <div className="space-y-2.5">
              {/* 1. Continue with Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* 2. Continue with Email */}
              <button
                type="button"
                onClick={() => {
                  setAuthView('email');
                  setErrorMsg('');
                  if (emailInputRef.current) emailInputRef.current.focus();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Continue with Email</span>
              </button>

              {/* 3. Continue with Mobile Number */}
              <button
                type="button"
                onClick={() => {
                  setAuthView('phone');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Continue with Mobile Number</span>
              </button>
            </div>

            {/* ── Security Encrypted Badge (Matching Image 1) ── */}
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Your data is secure with industry-standard encryption.</span>
            </div>

          </div>
        </div>

      </main>

      {/* ── Bottom Footer Bar (Matching Image 1) ── */}
      <footer className="relative z-10 w-full px-6 lg:px-12 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-slate-200 bg-slate-950/75 backdrop-blur-xl border-t border-white/15 shadow-2xl">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-300">
          <span>Learn</span>
          <span className="opacity-40">|</span>
          <span>Practice</span>
          <span className="opacity-40">|</span>
          <span>Get Evaluated</span>
          <span className="opacity-40">|</span>
          <span>Grow</span>
        </div>

        <div className="text-[11px] sm:text-xs text-slate-400 font-semibold">
          &copy; 2024–2026 AI Mains Evaluator. All rights reserved.
        </div>

        <div className="flex items-center gap-3 text-[11px] sm:text-xs">
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('UPSC/BPSC Mains AI strictly adheres to data privacy standards.'); }} className="text-slate-300 hover:text-cyan-400 transition-colors">
            Privacy
          </a>
          <span className="opacity-40">|</span>
          <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: For UPSC and State PCS exam preparation.'); }} className="text-slate-300 hover:text-cyan-400 transition-colors">
            Terms
          </a>
          <span className="opacity-40">|</span>
          <a href="#support" onClick={(e) => { e.preventDefault(); alert('Contact: support@mainsai.edu or watch official YouTube channel.'); }} className="text-slate-300 hover:text-cyan-400 transition-colors">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
