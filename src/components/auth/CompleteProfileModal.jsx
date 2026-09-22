import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Calendar, CheckCircle2, Sparkles,
  GraduationCap, ArrowRight, ShieldCheck, AlertCircle, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function CompleteProfileModal({ isOpen, isMandatory = false, onClose }) {
  const { user, updateProfileData } = useAuth();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [targetExam, setTargetExam] = useState('upsc');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name to continue.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your date of birth.');
      return;
    }

    setIsLoading(true);
    try {
      if (updateProfileData) {
        await updateProfileData({
          name: name.trim(),
          gender,
          dob,
          targetExam,
          avatar: gender === 'female' ? '👩‍🎓' : '👨‍🎓',
          profileCompleted: true,
        });
      }

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      } catch (_) {}

      if (onClose) onClose();
    } catch (err) {
      console.error('Save Profile Error:', err);
      setErrorMsg('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">

        {/* Gradient border wrapper */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/40 via-purple-500/20 to-indigo-500/40 pointer-events-none" />

        {/* Card body */}
        <div className="relative bg-slate-900/95 rounded-3xl p-6 sm:p-7 text-white">

          {/* Ambient glows */}
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>One-Time Setup</span>
              </div>
              <h3 className="text-lg font-black text-white m-0 tracking-tight leading-snug">
                Complete Your Aspirant Profile
              </h3>
              <p className="text-[11px] text-slate-400 m-0 mt-0.5 leading-relaxed">
                Personalise your dashboard, hero wallpaper &amp; exam journey tracking.
              </p>
            </div>

            {/* X close button — hidden when profile completion is mandatory */}
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alekh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Gender <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                    gender === 'male'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500/50'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">👦</span>
                  <span className="text-sm font-black">Male</span>
                  {gender === 'male' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 ml-auto shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                    gender === 'female'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-500/50'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">👧</span>
                  <span className="text-sm font-black">Female</span>
                  {gender === 'female' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 ml-auto shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Date of Birth <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 [color-scheme:dark] transition-all"
                />
              </div>
            </div>

            {/* Target Exam */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Civil Services Examination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetExam('upsc')}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                    targetExam === 'upsc'
                      ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400/50'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl shrink-0">🏛️</span>
                  <div>
                    <div className="text-xs font-black">UPSC CSE</div>
                    <div className="text-[10px] text-slate-400 font-normal">IAS / IPS / IFS</div>
                  </div>
                  {targetExam === 'upsc' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 ml-auto shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetExam('bpsc')}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                    targetExam === 'bpsc'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400/50'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl shrink-0">🦁</span>
                  <div>
                    <div className="text-xs font-black">BPSC CCE</div>
                    <div className="text-[10px] text-slate-400 font-normal">71st / 72nd CCE</div>
                  </div>
                  {targetExam === 'bpsc' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <span>Save Profile &amp; Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved securely to your account via Cloud Firestore</span>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
