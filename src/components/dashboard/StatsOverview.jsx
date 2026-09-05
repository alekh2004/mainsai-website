import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, Trophy, TrendingUp, ChevronRight,
  Flame, Layers, BookOpen,
  Zap, Award, ArrowRight, Youtube, Bell, Star
} from 'lucide-react';

function tagBadge(tag) {
  const t = (tag || '').toLowerCase();
  if (t.includes('excellent')) return 'badge-excellent';
  if (t.includes('good')) return 'badge-good';
  if (t.includes('average') || t.includes('pending')) return 'badge-average';
  return 'badge-poor';
}

function formatDateSafe(val) {
  if (!val) return 'Recently';
  try {
    let d;
    if (typeof val?.toDate === 'function') d = val.toDate();
    else if (val?.seconds) d = new Date(val.seconds * 1000);
    else d = new Date(val);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch (e) {
    return 'Recently';
  }
}

function getTimeGreeting(isHi) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return isHi ? '\u0928\u092e\u0938\u094d\u0915\u093e\u0930 \u0938\u0941\u092a\u094d\u0930\u092d\u093e\u0924' : 'Good Morning';
  if (hour >= 12 && hour < 17) return isHi ? '\u0928\u092e\u0938\u094d\u0915\u093e\u0930 \u0926\u094b\u092a\u0939\u0930' : 'Good Afternoon';
  if (hour >= 17 && hour < 21) return isHi ? '\u0928\u092e\u0938\u094d\u0915\u093e\u0930 \u0938\u0902\u0927\u094d\u092f\u093e' : 'Good Evening';
  return isHi ? '\u0936\u0941\u092d\u0930\u093e\u0924\u094d\u0930\u093f' : 'Good Night';
}

function AnnouncementsWidget({ isHi }) {
  const YOUTUBE_URL = 'https://www.youtube.com/@UPSCBPSCMainsAI';
  return (
    <div className="rounded-3xl glass-card-clean border border-white/80 overflow-hidden">
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="p-5 cursor-pointer group transition-all hover:bg-red-500/5 block no-underline"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #ff0000, #cc0000)', color: '#fff' }}>
            <Youtube className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-red-600 mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              Official YouTube Channel
            </div>
            <div className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>
              UPSC/BPSC Mains AI Evaluator
            </div>
            <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'Free strategy, PYQ analysis & tips \u2014 Subscribe \u0915\u0930\u0947\u0902' : 'Free strategy, PYQ analysis & tips \u2014 Subscribe Now'}
            </div>
          </div>
          <div className="shrink-0 text-red-500 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </a>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? '\u0906\u0928\u0947 \u0935\u093e\u0932\u0947 \u092b\u0940\u091a\u0930\u094d\u0938 \u0914\u0930 \u092c\u0948\u091a' : 'Coming Soon & Updates'}
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-500/10',   title: isHi ? '\u0f3a\u0f3b Live Batch \u2014 UPSC Mains 2025' : '\u0f3a\u0f3b Live Batch \u2014 UPSC Mains 2025', sub: isHi ? '\u091c\u0932\u094d\u0926 \u0936\u0941\u0930\u0942 \u0939\u094b\u0928\u0947 \u0935\u093e\u0932\u093e \u0939\u0948 \u2014 YouTube \u092a\u0930 \u0928\u091c\u0930 \u0930\u0916\u0947\u0902' : 'Starting soon \u2014 Watch YouTube for updates' },
            { icon: Sparkles, color: 'text-blue-500',    bg: 'bg-blue-500/10',    title: isHi ? '\u0f3c\u0f3d AI Voice Evaluation (Coming)' : '\u0f3c\u0f3d AI Voice Evaluation (Coming)', sub: isHi ? '\u092c\u094b\u0932\u0915\u0930 \u0909\u0924\u094d\u0924\u0930 \u0926\u0947\u0902, AI \u091c\u093e\u0901\u091a\u0947\u0917\u093e' : 'Speak your answer, AI will evaluate' },
            { icon: Trophy,   color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: isHi ? '\ud83d\udcca Student Leaderboard (Coming)' : '\ud83d\udcca Student Leaderboard (Coming)', sub: isHi ? '\u0905\u0928\u094d\u092f Aspirants \u0938\u0947 \u0905\u092a\u0928\u0940 \u0930\u0948\u0902\u0915 \u091c\u093e\u0928\u0947\u0902' : 'Compare your rank with other aspirants' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsOverview({ onQuickAction, onViewEvaluation, onOpenFlashcards, onOpenMainsNotes }) {
  const { user } = useAuth();
  const { evaluations, getInsightsData, language, activeExam } = useApp();
  const isHi = language === 'hi';

  const greeting = getTimeGreeting(isHi);

  const insights = getInsightsData();
  const realEvals = Array.isArray(evaluations) ? evaluations : [];
  const recentList = realEvals.slice(0, 3);
  const totalCount = realEvals.length;
  const rawAvgPct = insights?.avgPct ?? 0;
  const safeAvgPct = Math.max(0, Math.min(100, Math.round(Number(rawAvgPct) || 0)));
  const percentile = totalCount === 0 ? '\u2014'
    : (safeAvgPct >= 75 ? 'Top 5%' : safeAvgPct >= 65 ? 'Top 15%' : safeAvgPct >= 50 ? 'Top 35%' : 'Top 50%');

  return (
    <div className="w-full space-y-5 animate-fadeIn">

      {/* \u2500\u2500 1. HERO BANNER \u2500\u2500 */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ minHeight: '220px' }}
      >
        {/* Parliament Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/parliament_hero.jpg)' }}
        />
        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(4,7,18,0.78) 0%, rgba(4,7,18,0.45) 55%, rgba(4,7,18,0.1) 100%)' }}
        />
        {/* Subtle warm vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,7,18,0.6) 0%, transparent 60%)' }}
        />

        {/* Student Character (right side, animated) */}
        <div
          className="absolute right-0 bottom-0 h-full flex items-end justify-end pointer-events-none select-none"
          style={{ width: '42%' }}
        >
          <img
            src="/student_hero.jpg"
            alt=""
            className="h-[105%] w-auto object-contain object-bottom"
            style={{
              filter: 'drop-shadow(-8px 0 32px rgba(251,191,36,0.25)) brightness(1.05) contrast(1.02)',
              animation: 'studentFloat 6s ease-in-out infinite',
              transformOrigin: 'bottom center',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 md:p-7 flex flex-col justify-between h-full" style={{ minHeight: '220px' }}>
          {/* Top tag */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }}
            >
              {activeExam === 'bpsc' ? '\ud83e\udd81 BPSC Mains AI' : '\ud83c\udfdb\ufe0f UPSC Mains AI'}
            </span>
            <span className="text-[10px] font-bold text-white/40">\u2014 {isHi ? '\u0905\u0928\u0941\u0936\u093e\u0938\u0928 \u0906\u091c, \u0909\u091c\u094d\u091c\u094d\u0935\u0932 \u0915\u0932' : 'Discipline Today, Brighter Tomorrow'}</span>
          </div>

          {/* Greeting */}
          <div>
            <h2
              className="text-2xl md:text-3xl font-black text-white leading-tight mb-1"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
            >
              {greeting},
            </h2>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-3"
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}
            >
              {user?.name?.split(' ')[0] || 'Aspirant'} \ud83d\udc4b
            </h2>
            <p className="text-sm font-medium text-white/70 max-w-xs leading-relaxed">
              {isHi
                ? '\u0938\u0940\u0916\u094b\u0964 \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u094b\u0964 \u0906\u0917\u0947 \u092c\u0922\u093c\u094b\u0964 \u0906\u091c \u0915\u0940 \u091b\u094b\u091f\u0940 \u092e\u0947\u0939\u0928\u0924 \u0915\u0932 \u0915\u0940 \u092c\u0921\u093c\u0940 \u0915\u093e\u092e\u092f\u093e\u092c\u0940 \u092c\u0928\u0924\u0940 \u0939\u0948\u0964'
                : 'Learn. Prepare. Progress. Small steps today build the success of tomorrow.'}
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-3 mt-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{totalCount} {isHi ? '\u091f\u0947\u0938\u094d\u091f' : 'Tests'}</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{safeAvgPct}% {isHi ? '\u0914\u0938\u0924' : 'Avg'}</span>
            </div>
            {totalCount > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{percentile}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* \u2500\u2500 2. AI STUDY TOOLS \u2500\u2500 */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'AI \u0905\u0927\u094d\u092f\u092f\u0928 \u0909\u092a\u0915\u0930\u0923' : 'AI Study Tools'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Flashcards */}
          <div
            onClick={() => onOpenFlashcards?.()}
            className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.08))' }}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff' }}>
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 3D Flip Cards
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black m-0 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'AI \u092b\u094d\u0932\u0948\u0936\u0915\u093e\u0930\u094d\u0921 \u0930\u093f\u0935\u0940\u091c\u0928' : 'AI Flashcards Revision'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? '\u091f\u0949\u092a\u093f\u0915 \u091a\u0941\u0928\u0947\u0902 \u2192 5\u201320 3D \u0915\u093e\u0930\u094d\u0921' : 'Select topic \u2192 5\u201320 interactive 3D flip cards'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>{isHi ? '\u0916\u094b\u0932\u0947\u0902' : 'Open Flashcards'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* AI Mains Notes */}
          <div
            onClick={() => onOpenMainsNotes?.()}
            className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,185,129,0.08))' }}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff' }}>
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                <Award className="w-3 h-3" /> PDF Export
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black m-0 group-hover:text-emerald-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'AI \u092e\u0947\u0928\u094d\u0938 \u0928\u094b\u091f\u094d\u0938 + PYQ' : 'AI Mains Notes & PYQ'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? '\u091f\u0949\u092a\u093f\u0915 \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902 \u2192 \u0928\u094b\u091f\u094d\u0938 + PYQ + PDF' : 'Type topic \u2192 Notes + exact PYQs + PDF download'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>{isHi ? '\u0928\u094b\u091f\u094d\u0938 \u092c\u0928\u093e\u090f\u0902' : 'Generate Notes'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* \u2500\u2500 3. QUICK SHORTCUTS \u2500\u2500 */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? '\u0936\u0949\u0930\u094d\u091f\u0915\u091f\u094d\u0938' : 'Quick Shortcuts'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {/* AI Question Test */}
          <button
            onClick={() => onQuickAction?.('ai_test')}
            className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'AI \u092a\u094d\u0930\u0936\u094d\u0928 \u091f\u0947\u0938\u094d\u091f' : 'AI Question Test'}
              </div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? '\u092a\u094d\u0930\u0936\u094d\u0928 \u091a\u0941\u0928\u0947\u0902 \u0914\u0930 \u0909\u0924\u094d\u0924\u0930 \u091c\u092e\u093e \u0915\u0930\u0947\u0902' : 'Pick a question & submit answer'}
              </div>
            </div>
          </button>

          {/* Teacher / Student action */}
          {user?.role === 'teacher' || user?.role === 'admin' ? (
            <button
              onClick={() => onQuickAction?.('teacher')}
              className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-purple-500/30 text-left space-y-2 group bg-purple-500/5"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? '\u0936\u093f\u0915\u094d\u0937\u0915 \u091a\u0947\u0915\u093f\u0902\u0917 \u092a\u094b\u0930\u094d\u091f\u0932' : 'Faculty Checking Portal'}
                </div>
                <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400">
                  {isHi ? '\u091b\u093e\u0924\u094d\u0930\u094b\u0902 \u0915\u0940 \u0915\u0949\u092a\u093f\u092f\u093e\u0902 \u091c\u093e\u0902\u091a\u0947\u0902' : 'Grade pending student copies'}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onQuickAction?.('teacher')}
              className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 text-left space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? '\u0936\u093f\u0915\u094d\u0937\u0915 \u092e\u0942\u0932\u094d\u092f\u093e\u0902\u0915\u0928 \u0905\u0928\u0941\u0930\u094b\u0927' : 'Request Teacher Check'}
                </div>
                <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? '\u0915\u0949\u092a\u0940 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930 \u0936\u093f\u0915\u094d\u0937\u0915 \u0915\u094b \u092d\u0947\u091c\u0947\u0902' : 'Upload copy for faculty review'}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* \u2500\u2500 4. RECENT EVALUATIONS \u2500\u2500 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? '\u0939\u093e\u0932 \u0915\u0947 \u092e\u0942\u0932\u094d\u092f\u093e\u0902\u0915\u0928' : 'Recent Evaluations'}
          </h4>
          <button
            onClick={() => onQuickAction?.('history')}
            className="text-xs font-bold underline hover:opacity-80"
            style={{ color: 'rgb(var(--accent))' }}
          >
            {isHi ? '\u0938\u092d\u0940 \u0926\u0947\u0916\u0947\u0902' : 'View All'}
          </button>
        </div>
        {recentList.length === 0 ? (
          <div className="p-6 text-center rounded-3xl glass-card-clean border border-dashed border-white/40">
            <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? '\u0905\u092d\u0940 \u0924\u0915 \u0915\u094b\u0908 \u092e\u0942\u0932\u094d\u092f\u093e\u0902\u0915\u0928 \u0928\u0939\u0940\u0902\u0964 \u092a\u0939\u0932\u093e \u0909\u0924\u094d\u0924\u0930 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902!' : 'No evaluations yet. Upload your first answer sheet!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentList.map((item, idx) => (
              <div
                key={item.id || item.queueId || `eval-${idx}`}
                onClick={() => onViewEvaluation?.(item)}
                className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}
                    >
                      {item.paper || 'GS'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatDateSafe(item.createdAt)}
                    </span>
                  </div>
                  <h5 className="text-xs font-extrabold m-0 truncate group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {item.questionTitle || item.paper}
                  </h5>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black" style={{ color: 'rgb(var(--accent))' }}>
                      {item.score != null ? item.score : '\u2014'} <span className="text-[10px] opacity-60">/ {item.maxMarks}</span>
                    </span>
                    <span className={`block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${tagBadge(item.tag)}`}>
                      {item.tag || 'Checked'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* \u2500\u2500 5. YOUTUBE + UPCOMING \u2500\u2500 */}
      <AnnouncementsWidget isHi={isHi} />

    </div>
  );
}
