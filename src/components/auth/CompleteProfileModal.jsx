import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Calendar, CheckCircle2, Sparkles, GraduationCap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CompleteProfileModal({ isOpen, onClose }) {
  const { user, updateProfileData } = useAuth();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [targetExam, setTargetExam] = useState('upsc');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      const validName = user.name && !user.name.startsWith('Candidate') && user.name !== 'Aspirant Student' ? user.name : '';
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
      setErrorMsg('Please enter your full name.');
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
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
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
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl overflow-hidden bg-slate-900/90 text-white">
        {/* Background glow decoration */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Aspirant Profile Setup</span>
            </div>
            <h3 className="text-xl font-black text-white m-0 tracking-tight">
              Complete Your Profile
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Personalize your IAS/PCS journey, dashboard greeting &amp; wallpapers
            </p>
          </div>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Full Name (पूरा नाम) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alekh Kumar"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Gender Selection (Syncs with Boy/Girl Dashboard Hero Carousel) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Gender (लिंग) <span className="text-rose-400">*</span>
              <span className="text-[10px] text-slate-400 font-normal ml-2">
                (Customizes your dashboard avatar &amp; wallpaper)
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  gender === 'male'
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">👦</span>
                <div>
                  <div className="text-xs font-black">Male Aspirant</div>
                  <div className="text-[10px] text-slate-400">छात्र (Boy Hero)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  gender === 'female'
                    ? 'bg-purple-600/25 border-purple-500 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-500'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">👧</span>
                <div>
                  <div className="text-xs font-black">Female Aspirant</div>
                  <div className="text-[10px] text-slate-400">छात्रा (Girl Hero)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Date of Birth (जन्म तिथि) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Target Exam */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Target Civil Services Exam (लक्ष्य परीक्षा)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetExam('upsc')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  targetExam === 'upsc'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">🏛️</span>
                <div>
                  <div className="text-xs font-black">UPSC CSE</div>
                  <div className="text-[9px] text-slate-400">IAS / IPS / IFS</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetExam('bpsc')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  targetExam === 'bpsc'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">🦁</span>
                <div>
                  <div className="text-xs font-black">BPSC CCE</div>
                  <div className="text-[9px] text-slate-400">71st / 72nd CCE</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved permanently with your mobile number in Cloud Firestore</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
