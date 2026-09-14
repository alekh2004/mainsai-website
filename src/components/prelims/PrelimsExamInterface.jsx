import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock, Pause, Play, Bookmark, ChevronLeft, ChevronRight,
  X, HelpCircle, Loader2, BarChart2, Calculator, ListChecks,
  CheckCircle2, Circle, BookmarkCheck, Flag
} from 'lucide-react';

// ── Section grouping for palette filter tabs ──
function getSections(questions, config) {
  const isBpsc = config?.exam === 'bpsc';
  if (config?.testType !== 'full_length') {
    return [{ id: 'all', label: 'All', count: questions.length }];
  }
  if (isBpsc) {
    const subjects = ['Bihar GK', 'Polity', 'History', 'Geography', 'Economy', 'Science', 'Current Affairs', 'Math'];
    const groups = [{ id: 'all', label: 'All', count: questions.length }];
    subjects.forEach(subj => {
      const qs = questions.filter(q => (q.subject || '').toLowerCase().includes(subj.toLowerCase()));
      if (qs.length > 0) groups.push({ id: subj, label: subj.split(' ')[0], count: qs.length });
    });
    return groups.slice(0, 5);
  }
  // UPSC — split into GS I, GS II (if CSAT included), All
  const csatQs = questions.filter(q => (q.paper || q.subject || '').toLowerCase().includes('csat'));
  const gs1Qs = questions.filter(q => !(q.paper || q.subject || '').toLowerCase().includes('csat'));
  if (csatQs.length > 0) {
    return [
      { id: 'all', label: `All (${questions.length})`, count: questions.length },
      { id: 'gs1', label: `GS I (${gs1Qs.length})`, count: gs1Qs.length },
      { id: 'csat', label: `CSAT (${csatQs.length})`, count: csatQs.length },
    ];
  }
  return [{ id: 'all', label: `All (${questions.length})`, count: questions.length }];
}

export function PrelimsExamInterface({ questions = [], config = {}, onTestSubmit, liveQuestions }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedReview, setMarkedReview] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false); // mobile only
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [paletteTab, setPaletteTab] = useState('palette'); // 'palette' | 'instructions' | 'calc'
  const [sectionFilter, setSectionFilter] = useState('all');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState('');
  const [calcOp, setCalcOp] = useState('');

  // Live questions: merge as more arrive from AI
  const [liveQs, setLiveQs] = useState(questions);
  useEffect(() => {
    if (liveQuestions && liveQuestions.length > liveQs.length) {
      setLiveQs(liveQuestions);
    }
  }, [liveQuestions]);

  const allQs = liveQs.length > 0 ? liveQs : questions;
  const totalToGenerate = config.questionCount || questions.length;
  const isStillGenerating = allQs.length < totalToGenerate;

  const isBpsc = config.exam === 'bpsc';
  const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
  const negMark = isBpsc ? 0.33 : 0.66;

  const totalSecs = (config.questionCount || allQs.length || 100) * 72;
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleFinalSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const currentQ = allQs[currentIndex] || allQs[0];
  const sections = getSections(allQs, config);

  // Filter questions for palette section view
  const filteredIdxs = sectionFilter === 'all'
    ? allQs.map((_, i) => i)
    : allQs.reduce((acc, q, i) => {
        const match = sectionFilter === 'gs1'
          ? !(q.paper || q.subject || '').toLowerCase().includes('csat')
          : sectionFilter === 'csat'
          ? (q.paper || q.subject || '').toLowerCase().includes('csat')
          : (q.subject || '').toLowerCase().includes(sectionFilter.toLowerCase());
        if (match) acc.push(i);
        return acc;
      }, []);

  const handleSelectOption = (optIdx) => {
    if (!currentQ) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleClearOption = () => {
    if (!currentQ) return;
    setSelectedAnswers(prev => { const c = { ...prev }; delete c[currentQ.id]; return c; });
  };

  const toggleMarkReview = () => {
    if (!currentQ) return;
    setMarkedReview(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const toggleBookmark = () => {
    if (!currentQ) return;
    setBookmarked(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Palette counts
  let answeredCount = 0, markedCount = 0, unattemptedCount = 0, answeredAndMarkedCount = 0, bookmarkedCount = 0;
  allQs.forEach(q => {
    const isAns = selectedAnswers[q.id] !== undefined;
    const isM = markedReview[q.id];
    if (selectedAnswers[q.id] !== undefined) {
      if (isM) answeredAndMarkedCount++;
      else answeredCount++;
    } else {
      if (isM) markedCount++;
      else unattemptedCount++;
    }
    if (bookmarked[q.id]) bookmarkedCount++;
  });

  const handleFinalSubmit = () => {
    clearInterval(timerRef.current);
    onTestSubmit({ questions: allQs, selectedAnswers, markedReview, bookmarked, config, timeTakenSecs: totalSecs - timeLeft });
  };

  // Status color for palette number button
  const getPaletteStyle = (q, idx) => {
    const isAns = selectedAnswers[q.id] !== undefined;
    const isM = markedReview[q.id];
    const isCur = idx === currentIndex;
    if (isCur && isAns && isM) return { bg: '#6366f1', border: '#2563eb', ring: true, text: '#fff' };
    if (isCur && isAns) return { bg: '#16a34a', border: '#2563eb', ring: true, text: '#fff' };
    if (isCur) return { bg: '#2563eb', border: '#2563eb', ring: false, text: '#fff' };
    if (isAns && isM) return { bg: '#6366f1', border: '#6366f1', ring: false, text: '#fff' };
    if (isAns) return { bg: '#16a34a', border: '#16a34a', ring: false, text: '#fff' };
    if (isM) return { bg: '#9333ea', border: '#9333ea', ring: false, text: '#fff' };
    return { bg: 'transparent', border: 'var(--glass-border)', ring: false, text: 'var(--text-secondary)' };
  };

  // ── Basic Calculator ──
  const calcInput = (val) => {
    if (val === 'C') { setCalcDisplay('0'); setCalcPrev(''); setCalcOp(''); return; }
    if (val === '=') {
      if (!calcOp || !calcPrev) return;
      const a = parseFloat(calcPrev), b = parseFloat(calcDisplay);
      let res = 0;
      if (calcOp === '+') res = a + b;
      else if (calcOp === '-') res = a - b;
      else if (calcOp === '×') res = a * b;
      else if (calcOp === '÷') res = b !== 0 ? a / b : 'Error';
      setCalcDisplay(String(isNaN(res) ? 'Error' : Number(res.toFixed(8))));
      setCalcPrev(''); setCalcOp('');
      return;
    }
    if (['+', '-', '×', '÷'].includes(val)) {
      setCalcPrev(calcDisplay); setCalcOp(val); setCalcDisplay('0'); return;
    }
    if (val === '.' && calcDisplay.includes('.')) return;
    setCalcDisplay(prev => (prev === '0' && val !== '.') ? val : prev + val);
  };

  const timeColor = timeLeft < 300 ? '#ef4444' : timeLeft < 900 ? '#f59e0b' : '#3b82f6';

  // ── Question Palette Panel Component (shared between desktop sidebar + mobile drawer) ──
  const PalettePanel = ({ onNavigate }) => (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
        {[
          { id: 'palette', icon: ListChecks, label: 'Question Palette' },
          { id: 'instructions', icon: HelpCircle, label: 'Instructions' },
          { id: 'calc', icon: Calculator, label: 'Calculator' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setPaletteTab(t.id)}
            className="flex-1 py-2.5 text-[10px] font-extrabold uppercase tracking-wide transition-all border-b-2"
            style={{
              color: paletteTab === t.id ? 'rgb(var(--accent))' : 'var(--text-secondary)',
              borderBottomColor: paletteTab === t.id ? 'rgb(var(--accent))' : 'transparent',
              background: 'transparent',
            }}
          >
            <t.icon className="w-3.5 h-3.5 mx-auto mb-0.5" />
            <span className="hidden sm:block">{t.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>

        {paletteTab === 'palette' && (
          <div className="p-3 space-y-3">
            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
              {[
                { color: '#16a34a', bg: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.3)', label: `${answeredCount} Answered` },
                { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.25)', label: `${unattemptedCount} Not Attempted` },
                { color: '#9333ea', bg: 'rgba(147,51,234,0.12)', border: 'rgba(147,51,234,0.3)', label: `${markedCount} Marked Review` },
                { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', label: `${answeredAndMarkedCount} Ans & Marked` },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span style={{ color: s.color }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm border-2 border-blue-500 inline-block" /> Current</span>
              <span className="flex items-center gap-1"><Bookmark className="w-3 h-3 text-amber-500" />{bookmarkedCount} Bookmarked</span>
            </div>

            {/* Still generating notice */}
            {isStillGenerating && (
              <div className="flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                <span>{allQs.length}/{totalToGenerate} {isHi ? 'प्रश्न तैयार' : 'questions ready'}</span>
              </div>
            )}

            {/* Section Filter Tabs */}
            {sections.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {sections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setSectionFilter(sec.id)}
                    className="px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all"
                    style={{
                      background: sectionFilter === sec.id ? 'rgb(var(--accent))' : 'rgba(100,116,139,0.1)',
                      color: sectionFilter === sec.id ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            )}

            {/* Number Grid */}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
              {filteredIdxs.map((realIdx) => {
                const q = allQs[realIdx];
                if (!q) return null;
                const pal = getPaletteStyle(q, realIdx);
                return (
                  <button
                    key={q.id || realIdx}
                    onClick={() => { setCurrentIndex(realIdx); onNavigate?.(); }}
                    className="rounded-md font-extrabold transition-all flex items-center justify-center"
                    style={{
                      background: pal.bg,
                      border: `1px solid ${pal.border}`,
                      color: pal.text,
                      boxShadow: realIdx === currentIndex ? '0 0 0 2px #2563eb, 0 0 0 4px rgba(37,99,235,0.2)' : 'none',
                      fontSize: '11px',
                      aspectRatio: '1',
                      width: '100%',
                      cursor: 'pointer',
                      minHeight: '28px',
                    }}
                  >
                    {realIdx + 1}
                  </button>
                );
              })}
              {/* Ghost slots for still-generating questions */}
              {isStillGenerating && sectionFilter === 'all' &&
                Array.from({ length: Math.min(20, totalToGenerate - allQs.length) }).map((_, i) => (
                  <div key={`g-${i}`} className="rounded-md flex items-center justify-center" style={{
                    aspectRatio: '1', minHeight: '28px',
                    background: 'rgba(100,116,139,0.05)',
                    border: '1px dashed rgba(100,116,139,0.2)',
                  }}>
                    <Loader2 className="w-2.5 h-2.5 animate-spin opacity-25" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {paletteTab === 'instructions' && (
          <div className="p-4 space-y-3 text-xs" style={{ color: 'var(--text-primary)' }}>
            <h3 className="font-extrabold text-sm m-0" style={{ color: 'rgb(var(--accent))' }}>
              {isBpsc ? 'BPSC 71st CCE Prelims' : 'UPSC Prelims GS Paper I'}
            </h3>
            <div className="space-y-2">
              {[
                `Total Questions: ${config.questionCount || allQs.length}`,
                `Positive Marks: +${posMark} per correct answer`,
                `Negative Marks: -${negMark} per wrong answer`,
                `No deduction for unattempted questions`,
                isBpsc
                  ? 'BPSC: 5 options (A, B, C, D, E) — Option E is "None/More than one"'
                  : 'UPSC: 4 options (A, B, C, D)',
                'You can change/review answers anytime before submission',
                'Timer runs continuously — test auto-submits on time up',
                'Mark for Review to revisit questions later',
              ].map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black"
                    style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
                    {i + 1}
                  </span>
                  <span className="font-medium leading-relaxed pt-0.5" style={{ color: 'var(--text-primary)' }}>{inst}</span>
                </div>
              ))}
            </div>
            {/* Color legend */}
            <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid var(--glass-border)' }}>
              <div className="text-[10px] font-extrabold uppercase" style={{ color: 'var(--text-secondary)' }}>Color Legend</div>
              {[
                { color: '#16a34a', label: 'Green — Answered' },
                { color: '#9333ea', label: 'Purple — Marked for Review' },
                { color: '#6366f1', label: 'Indigo — Answered + Marked' },
                { color: '#2563eb', label: 'Blue border — Current Question' },
                { color: '#94a3b8', label: 'Grey — Not Attempted' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-medium">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: c.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {paletteTab === 'calc' && (
          <div className="p-4">
            <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
              {/* Display */}
              <div className="px-4 py-3 text-right">
                <div className="text-[11px] font-medium h-4" style={{ color: 'var(--text-secondary)' }}>{calcPrev} {calcOp}</div>
                <div className="text-2xl font-black truncate" style={{ color: 'var(--text-primary)' }}>{calcDisplay}</div>
              </div>
              {/* Buttons */}
              <div className="grid grid-cols-4 gap-px" style={{ background: 'var(--glass-border)' }}>
                {['C', '÷', '×', '←',
                  '7', '8', '9', '-',
                  '4', '5', '6', '+',
                  '1', '2', '3', '=',
                  '0', '.', '%', '=',
                ].map((btn, i) => {
                  const isOp = ['+', '-', '×', '÷', '='].includes(btn);
                  const isClear = btn === 'C';
                  const isBack = btn === '←';
                  return (
                    <button
                      key={`calc-${i}-${btn}`}
                      onClick={() => btn === '←' ? setCalcDisplay(d => d.length > 1 ? d.slice(0, -1) : '0') : calcInput(btn)}
                      className="py-3 text-sm font-extrabold transition-all hover:opacity-80 active:scale-95"
                      style={{
                        background: isClear ? 'rgba(239,68,68,0.15)' : isOp ? 'rgba(37,99,235,0.15)' : 'var(--card-bg)',
                        color: isClear ? '#ef4444' : isOp ? 'rgb(var(--accent))' : 'var(--text-primary)',
                      }}
                    >
                      {btn}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Answer Summary button */}
      {paletteTab === 'palette' && (
        <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
          <button
            onClick={() => setShowSubmitConfirmModal(true)}
            className="w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'rgb(var(--accent))', color: '#fff' }}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{isHi ? 'उत्तर सारांश देखें' : 'View Answer Summary'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full animate-fadeIn" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* ── Top Bar ── */}
      <div
        className="glass-card-clean rounded-2xl border mb-3 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 shrink-0"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {/* Left: title */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
              {isBpsc ? '🦁 BPSC 71st CCE Prelims' : '🏛️ UPSC Prelims GS Paper I'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
              style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>
              {config.testType === 'full_length' ? 'Full Length Test' : 'Practice Test'}
            </span>
          </div>
          <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Q.{currentIndex + 1} of {allQs.length}
            {isStillGenerating && <span className="ml-1 text-blue-400">({totalToGenerate} total)</span>}
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-black"
            style={{ color: timeColor, borderColor: `${timeColor}40`, background: `${timeColor}10` }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Pause */}
          <button onClick={() => setIsPaused(p => !p)}
            className="p-1.5 rounded-xl glass-card-clean border transition-all hover:border-blue-400"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Mobile palette toggle */}
          <button onClick={() => setShowPaletteDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-card-clean border text-xs font-bold lg:hidden transition-all hover:border-purple-400"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
            <ListChecks className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden sm:inline">{isHi ? 'पैलेट' : 'Palette'}</span>
            <span className="text-[10px] font-black" style={{ color: '#16a34a' }}>{answeredCount}</span>
          </button>

          {/* End Test */}
          <button onClick={() => setShowSubmitConfirmModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition-all">
            {isHi ? 'सबमिट' : 'End Test'}
          </button>
        </div>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* LEFT — Question Panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="glass-card-clean rounded-3xl border flex-1" style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
            <div className="p-5 md:p-6 space-y-5 h-full flex flex-col">

              {/* Question meta */}
              <div className="flex items-center justify-between gap-3 flex-wrap border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Q.{currentIndex + 1}</span>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg"
                    style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>
                    {currentQ?.subject || 'General Studies'}
                  </span>
                  {currentQ?.year && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                      📜 {currentQ.year}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-black"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#16a34a', border: '1px solid rgba(16,185,129,0.25)' }}>
                    +{posMark}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-black"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}>
                    -{negMark}
                  </span>
                  {/* Mark for Review */}
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={!!markedReview[currentQ?.id]} onChange={toggleMarkReview}
                      className="w-3.5 h-3.5 accent-purple-600 rounded" />
                    <Flag className="w-3.5 h-3.5 text-purple-500" />
                    <span className="hidden sm:inline">{isHi ? 'समीक्षा' : 'Mark Review'}</span>
                  </label>
                  {/* Bookmark */}
                  <button onClick={toggleBookmark} className="p-1 rounded-lg transition-all hover:opacity-80"
                    style={{ color: bookmarked[currentQ?.id] ? '#f59e0b' : 'var(--text-secondary)' }}>
                    <Bookmark className={`w-4 h-4 ${bookmarked[currentQ?.id] ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm md:text-[15px] font-semibold leading-relaxed whitespace-pre-line flex-shrink-0"
                style={{ color: 'var(--text-primary)', lineHeight: '1.75' }}>
                {isHi ? currentQ?.questionHi : currentQ?.questionEn}
              </div>

              {/* Options */}
              <div className="space-y-2.5 flex-1">
                {(isHi ? currentQ?.optionsHi : currentQ?.optionsEn)?.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ?.id] === idx;
                  const letters = ['A', 'B', 'C', 'D', 'E'];
                  return (
                    <div key={idx} onClick={() => handleSelectOption(idx)}
                      className="p-3.5 rounded-2xl border text-sm font-medium cursor-pointer transition-all flex items-start gap-3 select-none"
                      style={{
                        background: isSelected ? 'rgb(var(--accent)/0.10)' : 'transparent',
                        borderColor: isSelected ? 'rgb(var(--accent))' : 'var(--glass-border)',
                        boxShadow: isSelected ? '0 0 0 2px rgb(var(--accent)/0.2)' : 'none',
                        color: 'var(--text-primary)',
                      }}>
                      <div className="w-7 h-7 rounded-full border flex items-center justify-center font-black shrink-0 text-xs"
                        style={{
                          background: isSelected ? 'rgb(var(--accent))' : 'transparent',
                          borderColor: isSelected ? 'rgb(var(--accent))' : 'var(--glass-border)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                        }}>
                        {letters[idx]}
                      </div>
                      <span className="pt-0.5 leading-relaxed flex-1 font-medium">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-3 border-t shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
                <button onClick={handleClearOption}
                  disabled={selectedAnswers[currentQ?.id] === undefined}
                  className="flex items-center gap-1.5 text-xs font-bold disabled:opacity-30 transition-all hover:opacity-70 px-3 py-1.5 rounded-xl"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <X className="w-3.5 h-3.5" />
                  <span>{isHi ? 'उत्तर हटाएं' : 'Clear Response'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 disabled:opacity-30 transition-all"
                    style={{ background: 'rgba(100,116,139,0.12)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{isHi ? 'पिछला' : 'Previous'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(allQs.length - 1, prev + 1))}
                    disabled={currentIndex >= allQs.length - 1}
                    className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm disabled:opacity-30 transition-all"
                    style={{ background: 'rgb(var(--accent))', color: '#fff' }}>
                    <span>{isHi ? 'सेव और अगला' : 'Save & Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Palette Sidebar (always visible on lg+) */}
        <div
          className="hidden lg:flex flex-col shrink-0 glass-card-clean rounded-3xl border overflow-hidden"
          style={{
            width: '280px',
            borderColor: 'var(--glass-border)',
            background: 'var(--card-bg)',
          }}
        >
          <PalettePanel onNavigate={null} />
        </div>
      </div>

      {/* ── Mobile Palette Drawer ── */}
      {showPaletteDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowPaletteDrawer(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 bottom-0 flex flex-col"
            style={{ width: 'min(320px, 90vw)', background: 'var(--card-bg)', borderLeft: '1px solid var(--glass-border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>Question Palette</span>
              <button onClick={() => setShowPaletteDrawer(false)} className="p-1.5 rounded-xl hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <PalettePanel onNavigate={() => setShowPaletteDrawer(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirm Modal ── */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm glass-card-clean rounded-3xl border p-6 space-y-5 shadow-2xl text-center"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border"
              style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
              <HelpCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'टेस्ट सबमिट करें?' : 'Submit Test?'}
              </h3>
              <p className="text-xs font-medium mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'सबमिट से पहले उत्तर जांच लें।' : 'Review your answers before submitting.'}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-extrabold">
              {[
                { count: answeredCount, label: isHi ? 'उत्तरित' : 'Answered', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
                { count: markedCount, label: isHi ? 'समीक्षा' : 'Marked', color: '#9333ea', bg: 'rgba(147,51,234,0.1)' },
                { count: answeredAndMarkedCount, label: isHi ? 'Ans+Rev' : 'Ans+Rev', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                { count: unattemptedCount, label: isHi ? 'बाकी' : 'Left', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
              ].map((s, i) => (
                <div key={i} className="p-2 rounded-xl text-center" style={{ background: s.bg }}>
                  <div className="text-lg font-black" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[9px] font-bold" style={{ color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                {isHi ? 'वापस जाएं' : 'Back to Test'}
              </button>
              <button onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-black shadow-md transition-all hover:opacity-90"
                style={{ background: 'rgb(var(--accent))', color: '#fff' }}>
                {isHi ? 'सबमिट करें' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
