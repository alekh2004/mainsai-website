import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Crown, Settings, LogOut, ChevronRight, Star, TrendingUp, BarChart3, User, Sparkles } from 'lucide-react';
import { ScrollReveal } from '../animations/ScrollReveal';
import { AnimatedNumber } from '../animations/AnimatedNumber';
import { AuroraLamp } from '../animations/AuroraLamp';
import { AceternityCard } from '../animations/AceternityCard';

export function ProfileView({ onOpenSubscription, onOpenSettings, onOpenEditProfile }) {
  const { user, logout } = useAuth();
  const { evaluations = [], getInsightsData, language } = useApp();

  const isHi = language === 'hi';
  const insights = getInsightsData();
  const totalCount = evaluations.length;
  const rawAvgPct = Math.round(Number(insights?.avgPct) || 0);
  const rawBestPct = insights?.best
    ? Math.round(insights.best.percentage || (insights.best.score / insights.best.maxMarks) * 100)
    : 0;

  const isPro = user?.plan === 'pro' || user?.plan === 'ultimate';

  return (
    <div className="w-full space-y-5 animate-fadeInUp max-w-2xl mx-auto pb-12">

      {/* ── 1. Profile Card with AuroraLamp ── */}
      <ScrollReveal direction="up" delay={0} distance={40}>
        <div
          className="relative rounded-3xl glass-card-clean border overflow-hidden shadow-xl"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          {/* Top gradient strip with Aurora glow */}
          <div
            className="h-28 w-full relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.35), rgba(99,102,241,0.4), rgba(236,72,153,0.3))' }}
          >
            <AuroraLamp intensity="low" />
          </div>

          {/* Avatar + Name — overlapping the strip */}
          <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center space-y-3 relative z-10">

            {/* Avatar circle with glow */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 shadow-2xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                borderColor: 'var(--glass-border)',
                boxShadow: '0 8px 32px rgba(6,182,212,0.35)',
              }}
            >
              {user?.avatar || (user?.gender === 'female' ? '👩‍🎓' : '👨‍🎓')}
            </div>

            {/* Name */}
            <div className="space-y-1">
              <h3
                className="text-2xl font-black m-0 leading-tight profile-name-glow"
              >
                {user?.name || (isHi ? 'अभ्यर्थी' : 'Aspirant')}
              </h3>
              <p
                className="text-xs font-semibold m-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {user?.email || user?.phoneNumber || (isHi ? 'ईमेल उपलब्ध नहीं' : 'No contact on file')}
              </p>
              {isPro ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black bg-amber-500/15 border-amber-500/30 text-amber-400 mt-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>PRO Aspirant</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black bg-blue-500/10 border-blue-500/25 text-blue-400 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Free Tier Aspirant</span>
                </div>
              )}
            </div>

            {/* Quick Stats Grid with live AnimatedNumbers */}
            <div className="grid grid-cols-3 gap-3 w-full pt-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-bold uppercase block leading-tight text-slate-400">
                  {isHi ? 'कुल टेस्ट' : 'Evaluations'}
                </span>
                <span className="text-xl font-black block mt-0.5" style={{ color: 'rgb(var(--accent))' }}>
                  <AnimatedNumber value={totalCount} duration={1400} />
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-bold uppercase block leading-tight text-slate-400">
                  {isHi ? 'औसत स्कोर' : 'Avg Score'}
                </span>
                <span className="text-xl font-black block mt-0.5 text-emerald-400">
                  <AnimatedNumber value={rawAvgPct} suffix="%" duration={1600} />
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-bold uppercase block leading-tight text-slate-400">
                  {isHi ? 'सर्वश्रेष्ठ' : 'Best'}
                </span>
                <span className="text-xl font-black block mt-0.5 text-violet-400">
                  <AnimatedNumber value={rawBestPct} suffix="%" duration={1800} />
                </span>
              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* ── 2. Personal Aspirant Info (Gender, DOB, Target Exam) ── */}
      <ScrollReveal direction="up" delay={120} distance={40}>
        <div
          className="rounded-3xl glass-card-clean p-5 border space-y-3"
          style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
              <h4 className="text-xs font-black uppercase tracking-wider m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'अभ्यर्थी विवरण (Personal Info)' : 'Aspirant Details'}
              </h4>
            </div>
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="text-xs font-black transition-opacity hover:opacity-80"
                style={{ color: 'rgb(var(--accent))' }}
              >
                {isHi ? 'बदलें (Edit)' : 'Edit Profile'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold block text-slate-400">
                {isHi ? 'लिंग' : 'Gender'}
              </span>
              <span className="text-xs font-black block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {user?.gender === 'female' ? '👧 Female' : user?.gender === 'male' ? '👦 Male' : 'Not set'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold block text-slate-400">
                {isHi ? 'जन्म तिथि' : 'Date of Birth'}
              </span>
              <span className="text-xs font-black block mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.dob || 'Not set'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-bold block text-slate-400">
                {isHi ? 'लक्ष्य' : 'Target'}
              </span>
              <span className="text-xs font-black block mt-0.5 uppercase" style={{ color: 'var(--text-primary)' }}>
                {user?.targetExam || 'UPSC'}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── 3. Action Buttons (AceternityCard / Magnetic) ── */}
      <div className="space-y-3">

        {/* Subscription */}
        <ScrollReveal direction="up" delay={200} distance={30}>
          <button
            onClick={onOpenSubscription}
            className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover flex items-center justify-between gap-4 group transition-all text-left magnetic-btn"
            style={{ border: '1px solid rgba(251,191,36,0.35)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(251,191,36,0.15)' }}
              >
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div
                  className="text-sm font-extrabold leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {isHi ? 'सब्सक्रिप्शन प्लान' : 'Subscription Plan'}
                </div>
                <div
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {isPro ? (isHi ? 'Pro - सक्रिय' : 'Pro - Active') : (isHi ? 'निःशुल्क - Pro में अपग्रेड करें' : 'Free - Upgrade to Pro')}
                </div>
              </div>
            </div>
            <ChevronRight
              className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform text-amber-400"
            />
          </button>
        </ScrollReveal>

        {/* Settings */}
        <ScrollReveal direction="up" delay={260} distance={30}>
          <button
            onClick={onOpenSettings}
            className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover flex items-center justify-between gap-4 group transition-all text-left"
            style={{ border: '1px solid var(--glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(6,182,212,0.12)' }}
              >
                <Settings className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <div
                  className="text-sm font-extrabold leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {isHi ? 'ऐप सेटिंग्स' : 'App Settings'}
                </div>
                <div
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {isHi ? 'API Key और थीम सेटिंग्स' : 'API Key & Theme Settings'}
                </div>
              </div>
            </div>
            <ChevronRight
              className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform"
              style={{ color: 'var(--text-secondary)' }}
            />
          </button>
        </ScrollReveal>

        {/* Logout */}
        <ScrollReveal direction="up" delay={320} distance={30}>
          <button
            onClick={logout}
            className="w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group text-left"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/15">
                <LogOut className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <div className="text-sm font-extrabold leading-tight text-rose-500">
                  {isHi ? 'साइन आउट' : 'Sign Out'}
                </div>
                <div
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {isHi ? 'अकाउंट से लॉग आउट करें' : 'Log out of your account'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </ScrollReveal>

      </div>

      {/* ── App version ── */}
      <p
        className="text-center text-[10px] font-medium pt-3"
        style={{ color: 'var(--text-muted)' }}
      >
        ET Academy • v2.0 • UPSC/BPSC Mains Evaluator
      </p>

    </div>
  );
}
