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
  if (hour >= 5 && hour < 12) return isHi ? 'नमस्कार सुप्रभात' : 'Good Morning';
  if (hour >= 12 && hour < 17) return isHi ? 'नमस्कार दोपहर' : 'Good Afternoon';
  if (hour >= 17 && hour < 21) return isHi ? 'नमस्कार संध्या' : 'Good Evening';
  return isHi ? 'शुभरात्रि' : 'Good Night';
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
              {isHi ? 'Free strategy, PYQ analysis & tips - Subscribe करें' : 'Free strategy, PYQ analysis & tips - Subscribe Now'}
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
            {isHi ? 'आने वाले फीचर्स और बैच' : 'Coming Soon & Updates'}
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-500/10',   title: 'Live Batch - UPSC Mains 2025', sub: isHi ? 'जल्द शुरू होने वाला है - YouTube पर नजर रखें' : 'Starting soon - Watch YouTube for updates' },
            { icon: Sparkles, color: 'text-blue-500',    bg: 'bg-blue-500/10',    title: 'AI Voice Evaluation (Coming)', sub: isHi ? 'बोलकर उत्तर दें, AI जांचेगा' : 'Speak your answer, AI will evaluate' },
            { icon: Trophy,   color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Student Leaderboard (Coming)', sub: isHi ? 'अन्य Aspirants से अपनी रैंक जानें' : 'Compare your rank with other aspirants' },
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
  const percentile = totalCount === 0 ? '-'
    : (safeAvgPct >= 75 ? 'Top 5%' : safeAvgPct >= 65 ? 'Top 15%' : safeAvgPct >= 50 ? 'Top 35%' : 'Top 50%');

  return (
    <div className="w-full space-y-5 animate-fadeIn">

      {/* ── 1. HERO BANNER ── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ minHeight: '240px' }}
      >
        {/* Merged Parliament+Student background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/parliament_hero.jpg)',
            animation: 'kenBurnsSlow 20s ease-in-out infinite alternate',
          }}
        />
        {/* Left gradient overlay — only left half dark for text readability */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(4,7,18,0.80) 0%, rgba(4,7,18,0.55) 45%, rgba(4,7,18,0.05) 70%, transparent 100%)' }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,7,18,0.45) 0%, transparent 55%)' }}
        />

        {/* Hero Content — left side only */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full" style={{ minHeight: '240px' }}>
          {/* Exam tag — clean text only */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }}
            >
              {activeExam === 'bpsc' ? 'BPSC Mains AI' : 'UPSC Mains AI'}
            </span>
            <span className="text-[10px] font-semibold text-white/50">Discipline Today, Brighter Tomorrow</span>
          </div>

          {/* Greeting */}
          <div>
            <h2
              className="text-2xl md:text-3xl font-black text-white leading-tight mb-1"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
            >
              {greeting},
            </h2>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-3"
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {user?.name?.split(' ')[0] || 'Aspirant'}
            </h2>
            <p className="text-sm font-medium text-white/70 max-w-xs leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
              {isHi
                ? 'सीखो। तैयार करो। आगे बढ़ो। आज की छोटी मेहनत कल की बड़ी कामयाबी बनती है।'
                : 'Learn. Prepare. Progress. Small steps today build the success of tomorrow.'}
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{totalCount} {isHi ? 'टेस्ट' : 'Tests'}</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{safeAvgPct}% {isHi ? 'औसत' : 'Avg'}</span>
            </div>
            {totalCount > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}
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
                {isHi ? 'AI फ्लैशकार्ड रिवीजन' : 'AI Flashcards Revision'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'टॉपिक चुनें → 5-20 3D कार्ड' : 'Select topic → 5-20 interactive 3D flip cards'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>{isHi ? 'खोलें' : 'Open Flashcards'}</span>
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
                {isHi ? 'AI मेन्स नोट्स + PYQ' : 'AI Mains Notes & PYQ'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'टॉपिक टाइप करें → नोट्स + PYQ + PDF' : 'Type topic → Notes + exact PYQs + PDF download'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>{isHi ? 'नोट्स बनाएं' : 'Generate Notes'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. QUICK SHORTCUTS ── */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'शॉर्टकट्स' : 'Quick Shortcuts'}
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
                {isHi ? 'AI प्रश्न टेस्ट' : 'AI Question Test'}
              </div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'प्रश्न चुनें और उत्तर जमा करें' : 'Pick a question & submit answer'}
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
                  {isHi ? 'शिक्षक चेकिंग पोर्टल' : 'Faculty Checking Portal'}
                </div>
                <div className="text-[10px] font-medium text-purple-600">
                  {isHi ? 'छात्रों की कॉपियां जांचें' : 'Grade pending student copies'}
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
                  {isHi ? 'शिक्षक मूल्यांकन अनुरोध' : 'Request Teacher Check'}
                </div>
                <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'कॉपी अपलोड कर शिक्षक को भेजें' : 'Upload copy for faculty review'}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── 4. RECENT EVALUATIONS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'हाल के मूल्यांकन' : 'Recent Evaluations'}
          </h4>
          <button
            onClick={() => onQuickAction?.('history')}
            className="text-xs font-bold underline hover:opacity-80"
            style={{ color: 'rgb(var(--accent))' }}
          >
            {isHi ? 'सभी देखें' : 'View All'}
          </button>
        </div>
        {recentList.length === 0 ? (
          <div className="p-6 text-center rounded-3xl glass-card-clean border border-dashed border-white/40">
            <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'अभी तक कोई मूल्यांकन नहीं। पहला उत्तर अपलोड करें!' : 'No evaluations yet. Upload your first answer sheet!'}
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
                      {item.score != null ? item.score : '-'} <span className="text-[10px] opacity-60">/ {item.maxMarks}</span>
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

      {/* ── 5. YOUTUBE + UPCOMING ── */}
      <AnnouncementsWidget isHi={isHi} />

    </div>
  );
}
