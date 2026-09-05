import React from 'react';
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

// YouTube & Upcoming Features widget — replaces the complex bottom teacher section
function AnnouncementsWidget({ isHi }) {
  const YOUTUBE_URL = 'https://www.youtube.com/@UPSCBPSCMainsAI'; // placeholder — user will update

  return (
    <div className="rounded-3xl glass-card-clean border border-white/80 overflow-hidden">
      {/* YouTube section */}
      <div
        className="p-5 cursor-pointer group transition-all hover:bg-red-500/5"
        onClick={() => window.open(YOUTUBE_URL, '_blank', 'noopener')}
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
              {isHi ? 'Official YouTube Channel' : 'Official YouTube Channel'}
            </div>
            <div className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'UPSC/BPSC Mains AI Evaluator' : 'UPSC/BPSC Mains AI Evaluator'}
            </div>
            <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'Free strategy, PYQ analysis & tips — Subscribe करें' : 'Free strategy, PYQ analysis & tips — Subscribe Now'}
            </div>
          </div>
          <div className="shrink-0 text-red-500 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Upcoming features / new batch */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'आने वाले फीचर्स और बैच' : 'Coming Soon & Updates'}
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            {
              icon: Star,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
              title: isHi ? '🔥 Live Batch — UPSC Mains 2025' : '🔥 Live Batch — UPSC Mains 2025',
              sub: isHi ? 'जल्द शुरू होने वाला है — YouTube पर नजर रखें' : 'Starting soon — Watch YouTube for updates'
            },
            {
              icon: Sparkles,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              title: isHi ? '🆕 AI Voice Evaluation (Coming)' : '🆕 AI Voice Evaluation (Coming)',
              sub: isHi ? 'बोलकर उत्तर दें, AI जाँचेगा' : 'Speak your answer, AI will evaluate'
            },
            {
              icon: Trophy,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              title: isHi ? '📊 Student Leaderboard (Coming)' : '📊 Student Leaderboard (Coming)',
              sub: isHi ? 'अन्य Aspirants से अपनी रैंक जानें' : 'Compare your rank with other aspirants'
            }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {item.sub}
                </div>
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

  const insights = getInsightsData();
  const realEvals = evaluations || [];
  const recentList = realEvals.slice(0, 3);

  const totalCount = realEvals.length;
  const avgPct = insights?.avgPct ?? (totalCount > 0 ? 68 : 0);
  const percentile = avgPct >= 75 ? 'Top 5%' : avgPct >= 65 ? 'Top 15%' : avgPct >= 50 ? 'Top 35%' : 'Top 50%';

  return (
    <div className="w-full space-y-5 animate-fadeIn">

      {/* ── 1. GREETING + PERFORMANCE CARD ── */}
      <div className="p-5 rounded-3xl glass-card-clean border border-white/80 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-5">

          {/* Circular score */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path strokeWidth="3.5" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ color: 'var(--text-secondary)', opacity: 0.2 }} />
              <path strokeDasharray={`${avgPct}, 100`} strokeWidth="3.5" strokeLinecap="round"
                stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ color: 'rgb(var(--accent))' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black" style={{ color: 'rgb(var(--accent))' }}>{avgPct}%</span>
              <span className="text-[9px] font-bold uppercase opacity-60" style={{ color: 'var(--text-secondary)' }}>Score</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 space-y-1 text-center md:text-left">
            <h2 className="text-xl font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? `नमस्ते, ${user?.name || 'Aspirant'} 👋` : `Welcome, ${user?.name || 'Aspirant'} 👋`}
            </h2>
            <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
              {totalCount > 0
                ? (isHi ? `${totalCount} टेस्ट मूल्यांकित · रैंक: ${percentile}` : `${totalCount} copies evaluated · Rank: ${percentile}`)
                : (isHi ? 'पहला उत्तर अपलोड करें और ट्रैकिंग शुरू करें' : 'Upload your first answer to start tracking')}
            </p>
          </div>

          {/* Quick stat pills */}
          <div className="flex gap-2 shrink-0">
            <div className="text-center px-3 py-2 rounded-2xl glass-card-clean border border-white/40">
              <div className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{totalCount}</div>
              <div className="text-[10px] font-bold uppercase opacity-60" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'टेस्ट' : 'Tests'}
              </div>
            </div>
            <div className="text-center px-3 py-2 rounded-2xl glass-card-clean border border-white/40">
              <div className="text-base font-black text-amber-500">{percentile}</div>
              <div className="text-[10px] font-bold uppercase opacity-60" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'रैंक' : 'Rank'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. AI STUDY TOOLS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => onOpenFlashcards?.()}
          className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.08))' }}>
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
              {isHi ? 'टॉपिक चुनें → 5–20 3D कार्ड' : 'Select topic → 5–20 interactive 3D flip cards'}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>{isHi ? 'खोलें' : 'Open Flashcards'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div onClick={() => onOpenMainsNotes?.()}
          className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,185,129,0.08))' }}>
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

      {/* ── 3. QUICK SHORTCUTS (useful, not duplicated) ── */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'शॉर्टकट्स' : 'Quick Shortcuts'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {/* AI Question Test Generator */}
          <button onClick={() => onQuickAction?.('ai_test')}
            className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 text-left space-y-2 group">
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

          {/* Teacher Action — Role Based */}
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
                <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400">
                  {isHi ? 'छात्रों की कॉपियां जांचें' : 'Grade pending student copies'}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onQuickAction?.('ai_test')}
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'हाल के मूल्यांकन' : 'Recent Evaluations'}
          </h4>
          <button onClick={() => onQuickAction?.('history')}
            className="text-xs font-bold underline hover:opacity-80" style={{ color: 'rgb(var(--accent))' }}>
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
            {recentList.map((item) => (
              <div key={item.id} onClick={() => onViewEvaluation?.(item)}
                className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 flex items-center justify-between gap-3 cursor-pointer group">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>
                      {item.paper || 'GS'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h5 className="text-xs font-extrabold m-0 truncate group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {item.questionTitle || item.paper}
                  </h5>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black" style={{ color: 'rgb(var(--accent))' }}>
                      {item.score != null ? item.score : '—'} <span className="text-[10px] opacity-60">/ {item.maxMarks}</span>
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

      {/* ── 5. YOUTUBE + UPCOMING FEATURES (replaces old teacher/PDF complex section) ── */}
      <AnnouncementsWidget isHi={isHi} />

    </div>
  );
}
