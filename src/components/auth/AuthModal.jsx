import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Phone, ArrowRight, CheckCircle2, RefreshCw,
  ShieldCheck, AlertCircle, Mail, Lock, User, LogIn, UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AuthModal({ isFullScreen = false }) {
  const {
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();

  // Active Tab: 'email' | 'google' | 'phone'
  const [authMethod, setAuthMethod] = useState('email');

  // Email form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Google state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Standard English Error Mapping ──────────────────────────────────
  const getErrorMessage = (code, rawMessage) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return isSignUp
          ? 'An account with this email might already exist. Please sign in instead.'
          : 'Invalid email or password. If you do not have an account yet, click "Create an Account" below.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please click "Create an Account" below to register.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please sign in using your password.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address (e.g. name@domain.com).';
      case 'auth/unauthorized-domain':
        return 'Domain not authorized in Firebase. Please add "bpsc-upsc-mains-evaluator.vercel.app" in Firebase Console > Authentication > Settings > Authorized Domains.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window was closed before completing. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please enter a valid 10-digit mobile number.';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP code entered. Please check and try again.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded for today. Please sign in using Email or Google, or use the sample test number.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few moments and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is currently not enabled in Firebase Console.';
      default:
        return rawMessage?.split('(')[0]?.trim() || 'Authentication failed. Please try again.';
    }
  };

  // ── Handle Email Authentication ─────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');

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
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
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

    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyPhoneOtp(cleanOtp, `+91${phone.replace(/\D/g, '')}`);
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } }); } catch (_) {}
    } catch (err) {
      console.error('Phone Verify Error:', err);
      setErrorMsg(getErrorMessage(err.code, err.message));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className={`${isFullScreen ? 'min-h-screen flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl'} overflow-y-auto`}>
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0, zIndex: -1 }}></div>

      <div className="relative w-full max-w-md glass-card-clean rounded-3xl p-7 lg:p-9 border border-white/15 shadow-2xl my-8 space-y-6 bg-slate-950/80 backdrop-blur-2xl">

        {/* ── Brand Header ── */}
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 mx-auto">
            <Sparkles className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight m-0">
              MainsAI Portal
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1 m-0">
              AI Answer Evaluation for UPSC & BPSC Civil Services
            </p>
          </div>
        </div>

        {/* ── Method Tabs ── */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              authMethod === 'email'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setErrorMsg(''); }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              authMethod === 'google'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs">🌐</span>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setErrorMsg(''); setOtpSent(false); }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              authMethod === 'phone'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>Phone</span>
          </button>
        </div>

        {/* ── Error Banner ── */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* ── TAB 1: Email Authentication ── */}
        {authMethod === 'email' && (
          <div className="space-y-4 animate-fadeIn">
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Candidate Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input-clean text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aspirant@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input-clean text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input-clean text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full py-3 rounded-xl btn-primary-clean text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-60 transition-all hover:scale-[1.01]"
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
                    ? 'Processing...'
                    : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                </span>
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account yet? Create an Account"}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: Google 1-Click ── */}
        {authMethod === 'google' && (
          <div className="space-y-4 animate-fadeIn">
            <button
              onClick={handleGoogle}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-60"
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

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-[11px] text-slate-400 space-y-1 text-center">
              <p className="m-0 font-medium">
                Uses official Google OAuth 2.0. No password required.
              </p>
              <p className="m-0 text-slate-500 text-[10px]">
                Note: Domain authorization must be enabled in Firebase Console.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 3: Phone OTP ── */}
        {authMethod === 'phone' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Sample Testing Pill */}
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>🧪 Testing Credentials</span>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-400/20">Free</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 pt-0.5">
                <span>Phone: <b>9876543210</b></span>
                <span>OTP: <b>123456</b></span>
              </div>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 font-bold flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-semibold tracking-wider"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl btn-primary-clean text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-60 transition-all hover:scale-[1.01]"
                >
                  {isSendingOtp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{isSendingOtp ? 'Sending OTP via SMS...' : 'Send Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
                  <span>Code sent to <strong>+91 {phone}</strong></span>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-cyan-400 hover:text-cyan-300 underline text-xs font-bold"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-sm font-bold text-center tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-60 transition-all hover:scale-[1.01]"
                >
                  {isVerifyingOtp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isVerifyingOtp ? 'Verifying...' : 'Verify & Enter Portal'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Security Badge ── */}
        <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>SSL 256-Bit Encrypted Authentication Gateway</span>
        </div>

      </div>
    </div>
  );
}
