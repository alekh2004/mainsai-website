import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Calendar, CheckCircle2, Sparkles,
  GraduationCap, ArrowRight, ShieldCheck, AlertCircle, X,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Step indicator pill
function StepDot({ active, done }) {
  return (
    <div className={`transition-all duration-500 rounded-full ${
      done ? 'w-5 h-2 bg-blue-400' :
      active ? 'w-8 h-2 bg-white' :
      'w-2 h-2 bg-white/25'
    }`} />
  );
}

export function CompleteProfileModal({ isOpen, isMandatory = false, onClose }) {
  const { user, updateProfileData } = useAuth();

  const [step, setStep] = useState(1); // 1: name, 2: gender, 3: dob+exam
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      const validName =
        user.name &&
        !user.name.startsWith('Candidate') &&
        user.name !== 'Aspirant Student'
          ? user.name
          : '';
      setName(validName);
      if (user.gender) setGender(user.gender);
      if (user.dob) setDob(user.dob);
      if (user.targetExam) setTargetExam(user.targetExam);
    }
  }, [user]);

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!name.trim()) { setErrorMsg('Please enter your full name.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!gender) { setErrorMsg('Please select your gender.'); return; }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) { setErrorMsg('Please enter your full name.'); return; }
    if (!gender) { setErrorMsg('Please select your gender.'); return; }
    if (!dob) { setErrorMsg('Please select your date of birth.'); return; }
    if (!targetExam) { setErrorMsg('Please select your target exam.'); return; }

    setIsLoading(true);
    try {
      await updateProfileData({
        name: name.trim(),
        gender,
        dob,
        targetExam,
        avatar: gender === 'female' ? '👩‍🎓' : '👨‍🎓',
        profileCompleted: true,
      });
      try { confetti({ particleCount: 150, spread: 90, origin: { y: 0.45 } }); } catch (_) {}
      if (onClose) onClose();
    } catch (err) {
      console.error('Save Profile Error:', err);
      setErrorMsg('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = ['Your Name', 'Gender', 'Details'];

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(4,7,18,0.92)', backdropFilter: 'blur(20px)' }}>

      {/* Card */}
      <div className="relative w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #0c1228 60%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 80px rgba(99,102,241,0.15), 0 32px 80px rgba(0,0,0,0.6)',
        }}>

        {/* Top glow strip */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(139,92,246,0.7), transparent)' }} />

        {/* Ambient blobs */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="relative px-6 pb-7 pt-4 sm:pt-6">

          {/* Close button */}
          {!isMandatory && onClose && (
            <button onClick={onClose}
              className="absolute top-4 right-5 w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          )}

          {/* Header */}
          <div className="mb-5">
            {/* Icon + Badge */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                    One-Time Setup
                  </span>
                </div>
                <h2 className="text-[17px] font-black text-white leading-tight m-0">
                  Set Up Your Profile
                </h2>
              </div>
            </div>

            <p className="text-xs text-white/40 leading-relaxed m-0">
              Takes 30 seconds. Your dashboard, hero image & exam tracker will be personalised just for you.
            </p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {stepLabels.map((_, i) => (
              <StepDot key={i} active={step === i + 1} done={step > i + 1} />
            ))}
            <span className="ml-auto text-[10px] font-bold text-white/35">
              Step {step} of 3
            </span>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 px-3 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── STEP 1: Name ── */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-white/50 mb-2">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    placeholder="e.g. ALEKH RAJ"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => {
                      e.target.style.border = '1px solid rgba(99,102,241,0.6)';
                      e.target.style.background = 'rgba(99,102,241,0.08)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-white/30 leading-relaxed">
                  This will appear on your dashboard and evaluations.
                </p>
              </div>

              <button type="button" onClick={handleNext}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                }}>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Gender ── */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-white/50 mb-3">
                  I am a... <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Male */}
                  <button type="button" onClick={() => { setGender('male'); setErrorMsg(''); }}
                    className="relative p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    style={{
                      background: gender === 'male'
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))'
                        : 'rgba(255,255,255,0.04)',
                      border: gender === 'male'
                        ? '1.5px solid rgba(99,102,241,0.6)'
                        : '1.5px solid rgba(255,255,255,0.08)',
                      boxShadow: gender === 'male' ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                    }}>
                    {gender === 'male' && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
                    )}
                    <span className="text-4xl leading-none">👦</span>
                    <span className="text-sm font-black text-white">Male</span>
                    {gender === 'male' && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Female */}
                  <button type="button" onClick={() => { setGender('female'); setErrorMsg(''); }}
                    className="relative p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    style={{
                      background: gender === 'female'
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))'
                        : 'rgba(255,255,255,0.04)',
                      border: gender === 'female'
                        ? '1.5px solid rgba(168,85,247,0.6)'
                        : '1.5px solid rgba(255,255,255,0.08)',
                      boxShadow: gender === 'female' ? '0 0 20px rgba(168,85,247,0.2)' : 'none',
                    }}>
                    {gender === 'female' && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />
                    )}
                    <span className="text-4xl leading-none">👧</span>
                    <span className="text-sm font-black text-white">Female</span>
                    {gender === 'female' && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setErrorMsg(''); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-white/50 transition-all hover:text-white/80"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Back
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-[2] py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: gender ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                    boxShadow: gender ? '0 8px 32px rgba(99,102,241,0.35)' : 'none',
                    opacity: gender ? 1 : 0.5,
                  }}>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: DOB + Exam ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
              {/* DOB */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-white/50 mb-2">
                  Date of Birth <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => { setDob(e.target.value); setErrorMsg(''); }}
                    max={today}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-bold text-white focus:outline-none transition-all [color-scheme:dark]"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => {
                      e.target.style.border = '1px solid rgba(99,102,241,0.6)';
                      e.target.style.background = 'rgba(99,102,241,0.08)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Target Exam */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-white/50 mb-2">
                  Target Exam <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* UPSC */}
                  <button type="button" onClick={() => { setTargetExam('upsc'); setErrorMsg(''); }}
                    className="relative p-3.5 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: targetExam === 'upsc'
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,88,12,0.15))'
                        : 'rgba(255,255,255,0.04)',
                      border: targetExam === 'upsc'
                        ? '1.5px solid rgba(245,158,11,0.5)'
                        : '1.5px solid rgba(255,255,255,0.08)',
                      boxShadow: targetExam === 'upsc' ? '0 0 20px rgba(245,158,11,0.15)' : 'none',
                    }}>
                    <span className="text-2xl shrink-0">🏛️</span>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-black text-white">UPSC CSE</div>
                      <div className="text-[10px] text-white/35">IAS / IPS / IFS</div>
                    </div>
                    {targetExam === 'upsc' && (
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>

                  {/* BPSC */}
                  <button type="button" onClick={() => { setTargetExam('bpsc'); setErrorMsg(''); }}
                    className="relative p-3.5 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: targetExam === 'bpsc'
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))'
                        : 'rgba(255,255,255,0.04)',
                      border: targetExam === 'bpsc'
                        ? '1.5px solid rgba(16,185,129,0.5)'
                        : '1.5px solid rgba(255,255,255,0.08)',
                      boxShadow: targetExam === 'bpsc' ? '0 0 20px rgba(16,185,129,0.15)' : 'none',
                    }}>
                    <span className="text-2xl shrink-0">🦁</span>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-black text-white">BPSC CCE</div>
                      <div className="text-[10px] text-white/35">71st / 72nd</div>
                    </div>
                    {targetExam === 'bpsc' && (
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep(2); setErrorMsg(''); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-white/50 transition-all hover:text-white/80"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-[2] py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                  }}>
                  {isLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <span>Let's Go! 🚀</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-white/25">Saved securely to your account</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
