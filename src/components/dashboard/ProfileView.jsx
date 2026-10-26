import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Crown, Settings, LogOut, ChevronRight, Star, TrendingUp, BarChart3, User, Sparkles, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../animations/ScrollReveal';
import { AnimatedNumber } from '../animations/AnimatedNumber';
import { AuroraLamp } from '../animations/AuroraLamp';
import { AceternityCard } from '../animations/AceternityCard';
import { ProfileAvatar3D } from './ProfileAvatar3D';
import { CardBookmarkShowcase } from '../subscription/CardBookmarkShowcase';

export function ProfileView({ onOpenSubscription, onOpenSettings, onOpenEditProfile }) {
  const { user, logout } = useAuth();
  const { evaluations = [], getInsightsData, language } = useApp();
  const [showPlansView, setShowPlansView] = useState(false);

  const isHi = language === 'hi';
  const insights = getInsightsData();
  const totalCount = evaluations.length;
  const rawAvgPct = Math.round(Number(insights?.avgPct) || 0);

  const isPro = user?.plan === 'pro' || user?.plan === 'ultimate';
  const isUltimate = user?.plan === 'ultimate';

  // If user clicked to view all subscription plans, render the dedicated Showcase with Back navigation
  if (showPlansView) {
    return (
      <div className="w-full max-w-6xl mx-auto pb-16 px-2 sm:px-4 animate-fadeIn">
        <CardBookmarkShowcase
          onBack={() => setShowPlansView(false)}
          onSelectPlan={(planId) => {
            if (onOpenSubscription) onOpenSubscription(planId);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeInUp max-w-2xl mx-auto pb-16 px-2 sm:px-4">

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
          <div className="px-6 pb-6 -mt-14 flex flex-col items-center text-center space-y-3 relative z-10">

            {/* Real 3D Interactive WebGL Avatar (Blender-Studio Lighting & Head Tracking) */}
            <ProfileAvatar3D user={user} />

            {/* Name */}
            <div className="space-y-1">
              <h3
                className="text-2xl font-black m-0 leading-tight profile-name-glow"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name || (isHi ? 'अभ्यर्थी' : 'Aspirant')}
              </h3>
              <p
                className="text-xs font-semibold m-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {user?.email || user?.phoneNumber || (isHi ? 'ईमेल उपलब्ध नहीं' : 'No contact on file')}
              </p>

              {/* Edit Profile Button */}
              {onOpenEditProfile && (
                <div className="pt-1">
                  <button
                    onClick={onOpenEditProfile}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600 underline cursor-pointer transition-colors"
                  >
                    {isHi ? 'प्रोफाइल एडिट करें' : 'Edit Profile'}
                  </button>
                </div>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
              <span
                className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
                style={isUltimate
                  ? { background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }
                  : isPro
                    ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }
                    : { background: 'var(--glass-border)', color: 'var(--text-secondary)' }
                }
              >
                <Crown className="w-3 h-3" />
                {user?.plan ? user.plan.toUpperCase() : 'FREE TIER'}
              </span>

              <span
                className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }}
              >
                🦁 {user?.targetExam ? user.targetExam.toUpperCase() : 'UPSC'} 2026
              </span>

              <span
                className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                🇮🇳 {user?.state || 'Bihar'}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── 2. Performance Snapshot ── */}
      <ScrollReveal direction="up" delay={120} distance={30}>
        <div
          className="p-5 rounded-3xl glass-card-clean border space-y-3"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <div className="flex items-center justify-between">
            <h4
              className="text-xs font-black uppercase tracking-wider m-0 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {isHi ? 'तैयारी का स्तर' : 'Performance Snapshot'}
            </h4>
            <span className="text-[10px] font-extrabold" style={{ color: 'var(--text-secondary)' }}>
              {totalCount} {isHi ? 'उत्तर चेक हुए' : 'Evaluations'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div
              className="p-3 rounded-2xl text-center border"
              style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}
            >
              <span className="text-[10px] font-bold block opacity-70" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'कुल उत्तर' : 'Answers'}
              </span>
              <span className="text-lg font-black block mt-0.5 text-cyan-500">
                <AnimatedNumber value={totalCount} />
              </span>
            </div>

            <div
              className="p-3 rounded-2xl text-center border"
              style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}
            >
              <span className="text-[10px] font-bold block opacity-70" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'औसत स्कोर' : 'Avg Score'}
              </span>
              <span className="text-lg font-black block mt-0.5 text-emerald-500">
                <AnimatedNumber value={rawAvgPct} suffix="%" />
              </span>
            </div>

            <div
              className="p-3 rounded-2xl text-center border"
              style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.2)' }}
            >
              <span className="text-[10px] font-bold block opacity-70" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'लक्ष्य' : 'Target'}
              </span>
              <span className="text-xs font-black block mt-0.5 uppercase" style={{ color: 'var(--text-primary)' }}>
                {user?.targetExam || 'UPSC'}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── 3. Membership & Subscription Plans Entry Card ── */}
      <ScrollReveal direction="up" delay={180} distance={30}>
        <div
          onClick={() => setShowPlansView(true)}
          className="p-5 rounded-3xl glass-card-clean glass-card-hover border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group transition-all"
          style={{
            borderColor: isUltimate ? 'rgba(168,85,247,0.5)' : isPro ? 'rgba(245,158,11,0.5)' : 'var(--glass-border)',
            background: isUltimate
              ? 'linear-gradient(135deg, rgba(168,85,247,0.12), var(--card-bg))'
              : isPro
                ? 'linear-gradient(135deg, rgba(245,158,11,0.12), var(--card-bg))'
                : 'var(--card-bg)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{
                background: isUltimate
                  ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                  : isPro
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'rgba(59,130,246,0.15)',
                color: isPro ? '#fff' : '#3b82f6',
              }}
            >
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-base font-black leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {isHi ? 'UPSC & BPSC सदस्यता प्लान्स' : 'Subscription Plans (Prelims + Mains)'}
                </span>
                <span
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: isPro ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)',
                    color: isPro ? '#22c55e' : '#f59e0b',
                  }}
                >
                  {isPro ? (isHi ? 'सक्रिय' : 'Active') : (isHi ? 'फ्री ट्रायल' : 'Free Trial')}
                </span>
              </div>
              <p
                className="text-xs font-medium mt-1 m-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isUltimate
                  ? (isHi ? 'Ultimate Mentor Plan — 10 शिक्षक कॉपियां व ऑल एक्सेस' : 'Ultimate Mentor — 10 Faculty Script Reviews & All Access')
                  : isPro
                    ? (isHi ? 'Pro Scholar Plan — असीमित AI मूल्यांकन व 2 शिक्षक चेक' : 'Pro Scholar — Unlimited AI Evaluation & 2 Faculty Reviews')
                    : (isHi ? '2 AI चेक उपलब्ध — प्रो प्लान में अपग्रेड करें' : '2 Free AI Checks — Upgrade to Pro for unlimited evaluation')}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shrink-0 transition-transform group-hover:translate-x-1 cursor-pointer text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            }}
          >
            <span>{isHi ? 'सभी प्लान देखें' : 'View All Plans'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </ScrollReveal>

      {/* ── 4. Action Buttons (Settings & Sign Out) ── */}
      <div className="space-y-3 pt-1">
        {/* Settings */}
        <ScrollReveal direction="up" delay={240} distance={30}>
          <button
            onClick={onOpenSettings}
            className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover border flex items-center justify-between gap-4 group transition-all text-left cursor-pointer"
            style={{ borderColor: 'var(--glass-border)' }}
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
        <ScrollReveal direction="up" delay={300} distance={30}>
          <button
            onClick={logout}
            className="w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group text-left cursor-pointer"
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

        {/* App version */}
        <p
          className="text-center text-[10px] font-medium pt-3"
          style={{ color: 'var(--text-muted)' }}
        >
          ET Academy • v2.0 • UPSC &amp; BPSC AI Evaluator (Prelims + Mains)
        </p>
      </div>

    </div>
  );
}
