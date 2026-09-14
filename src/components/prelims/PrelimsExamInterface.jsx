import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock, Pause, Play, Bookmark, ChevronLeft, ChevronRight,
  RotateCcw, CheckCircle2, AlertCircle, Grid3x3, X, HelpCircle, Loader2
} from 'lucide-react';

export function PrelimsExamInterface({ questions = [], config = {}, onTestSubmit, liveQuestions }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedReview, setMarkedReview] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Live questions: start with initial, update as more arrive
  const [liveQs, setLiveQs] = useState(questions);
  useEffect(() => {
    if (liveQuestions && liveQuestions.length > liveQs.length) {
      setLiveQs(liveQuestions);
    }
  }, [liveQuestions]);

  // Use liveQs for palette & navigation — ensures palette updates in real time
  const allQs = liveQs.length > 0 ? liveQs : questions;
  const totalToGenerate = config.questionCount || questions.length;
  const isStillGenerating = allQs.length < totalToGenerate;

  const isBpsc = config.exam === 'bpsc';
  const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
  const negMark = isBpsc ? 0.33 : 0.66;

  const totalSecs = (config.questionCount || 100) * 72;
  const [timeLeft, setTimeLeft] = useState(totalSecs);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleFinalSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentQ = allQs[currentIndex] || allQs[0];

  const handleSelectOption = (optIdx) => {
    if (!currentQ) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleClearOption = () => {
    if (!currentQ) return;
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleMarkReview = () => {
    if (!currentQ) return;
    setMarkedReview(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Palette stats
  let answeredCount = 0, markedCount = 0, unattemptedCount = 0, answeredAndMarkedCount = 0;
  allQs.forEach(q => {
    const isAns = selectedAnswers[q.id] !== undefined;
    const isM = markedReview[q.id];
    if (isAns && isM) answeredAndMarkedCount++;
    else if (isAns) answeredCount++;
    else if (isM) markedCount++;
    else unattemptedCount++;
  });

  const handleFinalSubmit = () => {
    onTestSubmit({ questions: allQs, selectedAnswers, markedReview, config, timeTakenSecs: totalSecs - timeLeft });
  };

  const timeColor = timeLeft < 300 ? 'text-rose-500 border-rose-500/40 bg-rose-500/10' : 'text-blue-500 border-blue-500/30 bg-blue-500/10';

  // Question palette button color per state
  const getPaletteColor = (q, idx) => {
    const isAns = selectedAnswers[q.id] !== undefined;
    const isM = markedReview[q.id];
    const isCur = idx === currentIndex;
    if (isAns && isM) return { bg: '#6366f1', text: '#fff', ring: isCur };
    if (isAns) return { bg: '#16a34a', text: '#fff', ring: isCur };
    if (isM) return { bg: '#9333ea', text: '#fff', ring: isCur };
    return { bg: isCur ? '#2563eb' : 'rgba(100,116,139,0.15)', text: isCur ? '#fff' : 'var(--text-secondary)', ring: false };
  };

  const PaletteGrid = ({ onClose }) => (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-extrabold">
        {[
          { count: answeredCount, label: 'Answered', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
          { count: markedCount, label: 'Review', color: '#9333ea', bg: 'rgba(147,51,234,0.1)' },
          { count: answeredAndMarkedCount, label: 'Ans+Rev', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { count: unattemptedCount, label: 'Left', color: 'var(--text-secondary)', bg: 'rgba(100,116,139,0.1)' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-2 text-center" style={{ background: s.bg }}>
            <div className="text-base font-black" style={{ color: s.color }}>{s.count}</div>
            <div style={{ color: s.color, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Generation progress */}
      {isStillGenerating && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
          <span className="text-[10px] font-bold text-blue-500">
            {allQs.length}/{totalToGenerate} {isHi ? 'प्रश्न तैयार' : 'questions ready'}
          </span>
        </div>
      )}

      {/* Question Number Grid */}
      <div className="grid grid-cols-5 gap-1.5 max-h-[340px] overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'thin' }}>
        {allQs.map((q, idx) => {
          const pal = getPaletteColor(q, idx);
          return (
            <button
              key={q.id || idx}
              onClick={() => { setCurrentIndex(idx); onClose?.(); }}
              className="w-full aspect-square rounded-xl text-[11px] font-black transition-all flex items-center justify-center border"
              style={{
                background: pal.bg,
                color: pal.text,
                borderColor: pal.ring ? '#2563eb' : 'transparent',
                boxShadow: pal.ring ? '0 0 0 2px #2563eb' : 'none',
                transform: idx === currentIndex ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {idx + 1}
            </button>
          );
        })}
        {/* Ghost slots for questions still generating */}
        {isStillGenerating && Array.from({ length: Math.max(0, totalToGenerate - allQs.length) }).slice(0, 20).map((_, i) => (
          <div key={`ghost-${i}`} className="w-full aspect-square rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(100,116,139,0.07)', border: '1px dashed rgba(100,116,139,0.2)' }}>
            <Loader2 className="w-3 h-3 opacity-30 animate-spin" style={{ color: 'var(--text-secondary)' }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn pb-6">

      {/* ── Top Bar ── */}
      <div
        className="glass-card-clean p-3 md:p-4 rounded-2xl border mb-4 flex flex-wrap items-center justify-between gap-2"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-black m-0 truncate" style={{ color: 'var(--text-primary)' }}>
            {isBpsc ? '🦁 BPSC 70th Prelims' : '🏛️ UPSC Prelims 2025'}
          </h2>
          <p className="text-[11px] font-bold m-0" style={{ color: 'var(--text-secondary)' }}>
            Q.{currentIndex + 1}/{allQs.length}
            {isStillGenerating && <span className="ml-1 text-blue-400">({totalToGenerate} total generating...)</span>}
            {' '}• {config.testType === 'full_length' ? 'Full Length' : 'Practice'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-black ${timeColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Pause */}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="px-3 py-1.5 rounded-xl glass-card-clean border text-xs font-bold flex items-center gap-1.5 hover:border-blue-400 transition-all"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? (isHi ? 'फिर शुरू' : 'Resume') : (isHi ? 'रुकें' : 'Pause')}</span>
          </button>

          {/* Mobile palette toggle */}
          <button
            onClick={() => setShowPaletteModal(true)}
            className="px-3 py-1.5 rounded-xl glass-card-clean border text-xs font-bold flex items-center gap-1.5 hover:border-purple-400 transition-all xl:hidden"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            <Grid3x3 className="w-3.5 h-3.5 text-purple-500" />
            <span>{isHi ? 'पैलेट' : 'Palette'}</span>
            <span className="text-[10px] font-black text-emerald-500">{answeredCount}</span>
          </button>

          {/* Submit */}
          <button
            onClick={() => setShowSubmitConfirmModal(true)}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition-all"
          >
            {isHi ? 'सबमिट' : 'End Test'}
          </button>
        </div>
      </div>

      {/* ── Main Layout: 3-col Question | 1-col Palette ── */}
      <div className="flex gap-4">

        {/* Question Panel */}
        <div className="flex-1 min-w-0">
          <div
            className="glass-card-clean rounded-3xl border p-5 md:p-7 space-y-5"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}
          >
            {/* Question meta */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                  Q.{currentIndex + 1}
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg"
                  style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>
                  {currentQ?.subject || 'General Studies'}
                </span>
                {currentQ?.year && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    📜 {currentQ.year}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-black" style={{ background: 'rgba(16,185,129,0.1)', color: '#16a34a', border: '1px solid rgba(16,185,129,0.25)' }}>+{posMark}</span>
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-black" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}>-{negMark}</span>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={!!markedReview[currentQ?.id]}
                    onChange={toggleMarkReview}
                    className="w-4 h-4 text-purple-600 rounded accent-purple-600"
                  />
                  <Bookmark className="w-3.5 h-3.5 text-purple-500" />
                  <span className="hidden sm:inline">{isHi ? 'समीक्षा' : 'Review'}</span>
                </label>
              </div>
            </div>

            {/* Question Text */}
            <div
              className="text-sm md:text-[15px] font-bold leading-relaxed whitespace-pre-line"
              style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}
            >
              {isHi ? currentQ?.questionHi : currentQ?.questionEn}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {(isHi ? currentQ?.optionsHi : currentQ?.optionsEn)?.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ?.id] === idx;
                const letters = ['A', 'B', 'C', 'D', 'E'];
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="p-3.5 md:p-4 rounded-2xl border text-sm font-medium cursor-pointer transition-all flex items-start gap-3.5 hover:shadow-sm"
                    style={{
                      background: isSelected ? 'rgb(var(--accent)/0.10)' : 'var(--card-bg)',
                      borderColor: isSelected ? 'rgb(var(--accent))' : 'var(--glass-border)',
                      boxShadow: isSelected ? '0 0 0 2px rgb(var(--accent)/0.2)' : 'none',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full border flex items-center justify-center font-black shrink-0 text-xs"
                      style={{
                        background: isSelected ? 'rgb(var(--accent))' : 'transparent',
                        borderColor: isSelected ? 'rgb(var(--accent))' : 'var(--glass-border)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {letters[idx]}
                    </div>
                    <span className="pt-0.5 leading-relaxed flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <button
                onClick={handleClearOption}
                disabled={selectedAnswers[currentQ?.id] === undefined}
                className="text-xs font-bold disabled:opacity-30 transition-all hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isHi ? 'उत्तर हटाएं' : 'Clear Response'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 disabled:opacity-30 transition-all"
                  style={{ background: 'rgba(100,116,139,0.12)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{isHi ? 'पिछला' : 'Previous'}</span>
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(allQs.length - 1, prev + 1))}
                  disabled={currentIndex >= allQs.length - 1}
                  className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm disabled:opacity-30 transition-all"
                  style={{ background: 'rgb(var(--accent))', color: '#fff' }}
                >
                  <span>{isHi ? 'सेव करें और अगला' : 'Save & Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop Palette Sidebar ── */}
        <div
          className="hidden xl:flex flex-col w-[200px] shrink-0 glass-card-clean rounded-3xl border p-4 space-y-3"
          style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', position: 'sticky', top: '80px' }}
        >
          <h3 className="text-xs font-extrabold uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'प्रश्न पैलेट' : 'Question Palette'}
          </h3>
          <PaletteGrid onClose={null} />
        </div>
      </div>

      {/* ── Mobile Palette Modal ── */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md glass-card-clean rounded-3xl border p-5 space-y-4 shadow-2xl"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'प्रश्न पैलेट' : 'Question Palette'}
              </h3>
              <button onClick={() => setShowPaletteModal(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition-all" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <PaletteGrid onClose={() => setShowPaletteModal(false)} />
          </div>
        </div>
      )}

      {/* ── Submit Confirm Modal ── */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm glass-card-clean rounded-3xl border p-6 space-y-5 shadow-2xl text-center"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border"
              style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
              <HelpCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'टेस्ट सबमिट करें?' : 'Submit Test?'}
              </h3>
              <p className="text-xs font-medium mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'सबमिट करने से पहले सभी उत्तर जांच लें।' : 'Review your answers before submitting.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-extrabold">
              <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="text-lg font-black text-emerald-500">{answeredCount}</div>
                <div className="text-emerald-600 text-[10px]">{isHi ? 'उत्तरित' : 'Answered'}</div>
              </div>
              <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.3)' }}>
                <div className="text-lg font-black text-purple-500">{markedCount}</div>
                <div className="text-purple-600 text-[10px]">{isHi ? 'समीक्षा' : 'Marked'}</div>
              </div>
              <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
                <div className="text-lg font-black" style={{ color: 'var(--text-secondary)' }}>{unattemptedCount}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'बाकी' : 'Unattempted'}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
              >
                {isHi ? 'वापस जाएं' : 'Back to Test'}
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-black shadow-md transition-all hover:opacity-90"
                style={{ background: 'rgb(var(--accent))', color: '#fff' }}
              >
                {isHi ? 'सबमिट करें' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
