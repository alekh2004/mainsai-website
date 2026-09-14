import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookMarked, ChevronRight, X, RotateCcw, Filter,
  CheckCircle2, XCircle, Minus, ArrowLeft, Play,
  TrendingUp, Search, BookOpen, Sparkles, Layers
} from 'lucide-react';

// ── localStorage key ──
const IB_KEY = 'improvement_book_v2';

// ── Read from localStorage ──
export function getImprovementBook() {
  try { return JSON.parse(localStorage.getItem(IB_KEY) || '{"prelims":{},"mains":{}}'); }
  catch { return { prelims: {}, mains: {} }; }
}

// ── Save questions from a completed test ──
export function saveTestToImprovementBook({ questions, selectedAnswers, exam, testDate }) {
  const book = getImprovementBook();
  const section = 'prelims';
  questions.forEach(q => {
    const subject = q.subject || 'General Studies';
    if (!book[section][subject]) book[section][subject] = [];
    const entry = {
      id: q.id,
      questionEn: q.questionEn || '',
      questionHi: q.questionHi || q.questionEn || '',
      optionsEn: q.optionsEn || [],
      optionsHi: q.optionsHi || q.optionsEn || [],
      correctIndex: q.correctIndex,
      explanationEn: q.explanationEn || '',
      explanationHi: q.explanationHi || q.explanationEn || '',
      subject,
      exam: exam || 'upsc',
      year: q.year || 'Practice',
      difficulty: q.difficulty || 'medium',
      userAnswer: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : null,
      isCorrect: selectedAnswers[q.id] === q.correctIndex,
      isAttempted: selectedAnswers[q.id] !== undefined,
      savedAt: testDate || new Date().toISOString(),
    };
    // Avoid duplicates by id — update if exists, add if not
    const existing = book[section][subject].findIndex(x => x.id === q.id);
    if (existing >= 0) book[section][subject][existing] = entry;
    else book[section][subject].push(entry);
  });
  // Limit to last 500 per subject
  Object.keys(book[section]).forEach(subj => {
    if (book[section][subj].length > 500) {
      book[section][subj] = book[section][subj].slice(-500);
    }
  });
  localStorage.setItem(IB_KEY, JSON.stringify(book));
}

// ── Component ──
export function ImprovementBook({ onGoBack }) {
  const { language } = useApp();
  const { user } = useAuth();
  const isHi = language === 'hi';

  const [view, setView] = useState('subjects'); // 'subjects' | 'questions' | 'practice'
  const [selectedSection, setSelectedSection] = useState('prelims'); // 'prelims' | 'mains'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'wrong' | 'unattempted' | 'correct'
  const [search, setSearch] = useState('');
  const [practiceQs, setPracticeQs] = useState([]);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  const [book, setBook] = useState(getImprovementBook());

  // Reload from localStorage whenever view changes
  useEffect(() => { setBook(getImprovementBook()); }, [view, selectedSection]);

  const subjectData = useMemo(() => {
    const sectionBook = book[selectedSection] || {};
    return Object.entries(sectionBook).map(([subject, questions]) => {
      const total = questions.length;
      const correct = questions.filter(q => q.isAttempted && q.isCorrect).length;
      const wrong = questions.filter(q => q.isAttempted && !q.isCorrect).length;
      const unattempted = questions.filter(q => !q.isAttempted).length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { subject, total, correct, wrong, unattempted, accuracy, questions };
    }).sort((a, b) => b.total - a.total);
  }, [book, selectedSection]);

  const totalQs = useMemo(() => subjectData.reduce((a, s) => a + s.total, 0), [subjectData]);
  const totalCorrect = useMemo(() => subjectData.reduce((a, s) => a + s.correct, 0), [subjectData]);
  const totalWrong = useMemo(() => subjectData.reduce((a, s) => a + s.wrong, 0), [subjectData]);

  // Questions for selected subject with filters
  const filteredQuestions = useMemo(() => {
    if (!selectedSubject) return [];
    const qs = (book[selectedSection]?.[selectedSubject] || []);
    let result = qs;
    if (filter === 'wrong') result = qs.filter(q => q.isAttempted && !q.isCorrect);
    else if (filter === 'correct') result = qs.filter(q => q.isAttempted && q.isCorrect);
    else if (filter === 'unattempted') result = qs.filter(q => !q.isAttempted);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(q =>
        (q.questionEn || '').toLowerCase().includes(s) ||
        (q.questionHi || '').toLowerCase().includes(s)
      );
    }
    return result;
  }, [book, selectedSection, selectedSubject, filter, search]);

  const startPractice = (questions) => {
    const qs = questions.length > 0 ? questions : filteredQuestions;
    if (qs.length === 0) return;
    setPracticeQs(qs);
    setPracticeIdx(0);
    setPracticeAnswers({});
    setPracticeSubmitted(false);
    setView('practice');
  };

  const subjectColors = [
    'rgba(59,130,246,', 'rgba(16,185,129,', 'rgba(245,158,11,',
    'rgba(239,68,68,', 'rgba(139,92,246,', 'rgba(14,165,233,',
    'rgba(249,115,22,', 'rgba(236,72,153,', 'rgba(20,184,166,',
  ];
  const getSubjectColor = (i) => subjectColors[i % subjectColors.length];

  // ── Practice Mode ──
  if (view === 'practice') {
    const pq = practiceQs[practiceIdx];
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const opts = isHi ? (pq?.optionsHi || pq?.optionsEn || []) : (pq?.optionsEn || []);
    const userAns = practiceAnswers[pq?.id];
    const hasSelected = userAns !== undefined;

    if (practiceSubmitted) {
      // Results
      const correct = practiceQs.filter(q => practiceAnswers[q.id] === q.correctIndex).length;
      const wrong = practiceQs.filter(q => practiceAnswers[q.id] !== undefined && practiceAnswers[q.id] !== q.correctIndex).length;
      const pct = Math.round((correct / practiceQs.length) * 100);
      return (
        <div className="space-y-5 animate-fadeIn">
          <div className="glass-card-clean rounded-3xl border p-6 text-center space-y-4" style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
            <div className="text-4xl font-black" style={{ color: pct >= 70 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#dc2626' }}>
              {pct}%
            </div>
            <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {correct}/{practiceQs.length} {isHi ? 'सही' : 'Correct'}
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto text-xs font-black">
              {[
                { label: isHi ? 'सही' : 'Correct', count: correct, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
                { label: isHi ? 'गलत' : 'Wrong', count: wrong, color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
                { label: isHi ? 'बाकी' : 'Left', count: practiceQs.length - correct - wrong, color: '#94a3b8', bg: 'rgba(100,116,139,0.1)' },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background: s.bg }}>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[10px]" style={{ color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={() => { setPracticeAnswers({}); setPracticeIdx(0); setPracticeSubmitted(false); }}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 justify-center"
                style={{ background: 'rgb(var(--accent))', color: '#fff' }}>
                <RotateCcw className="w-4 h-4" />{isHi ? 'फिर से प्रयास' : 'Try Again'}
              </button>
              <button onClick={() => setView('questions')}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold border flex items-center gap-2 justify-center"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                <ArrowLeft className="w-4 h-4" />{isHi ? 'वापस जाएं' : 'Back to Questions'}
              </button>
            </div>
          </div>
          {/* Solutions */}
          <div className="space-y-3">
            {practiceQs.map((q, qi) => {
              const ua = practiceAnswers[q.id];
              const isC = ua === q.correctIndex;
              const isU = ua === undefined;
              return (
                <div key={q.id} className="glass-card-clean rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span style={{ color: 'rgb(var(--accent))' }}>Q{qi + 1}. {q.subject}</span>
                    {isU ? <span style={{ color: '#94a3b8' }}>Not Attempted</span>
                      : isC ? <span className="text-emerald-500">✓ +{q.exam === 'bpsc' ? 1 : 2}</span>
                      : <span className="text-rose-500">✗ -{q.exam === 'bpsc' ? '0.33' : '0.66'}</span>}
                  </div>
                  <div className="text-xs font-medium leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                    {isHi ? q.questionHi : q.questionEn}
                  </div>
                  <div className="space-y-1.5">
                    {(isHi ? (q.optionsHi || q.optionsEn) : (q.optionsEn || [])).map((opt, oi) => {
                      const isOC = oi === q.correctIndex;
                      const isOS = oi === ua;
                      return (
                        <div key={oi} className="px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between"
                          style={{
                            background: isOC ? 'rgba(22,163,74,0.1)' : isOS ? 'rgba(239,68,68,0.08)' : 'transparent',
                            borderColor: isOC ? '#16a34a' : isOS ? '#dc2626' : 'var(--glass-border)',
                            color: 'var(--text-primary)',
                          }}>
                          <span>{letters[oi]}. {opt}</span>
                          {isOC && <span className="text-emerald-500 font-extrabold text-[10px]">✓ Correct</span>}
                          {isOS && !isOC && <span className="text-rose-500 font-extrabold text-[10px]">✗ Your Ans</span>}
                        </div>
                      );
                    })}
                  </div>
                  {(q.explanationEn || q.explanationHi) && (
                    <div className="px-3 py-2 rounded-xl text-xs font-medium leading-relaxed"
                      style={{ background: 'rgba(59,130,246,0.07)', borderLeft: '3px solid rgb(var(--accent))', color: 'var(--text-primary)' }}>
                      <span className="font-extrabold" style={{ color: 'rgb(var(--accent))' }}>Explanation: </span>
                      {isHi ? q.explanationHi : q.explanationEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Progress bar */}
        <div className="glass-card-clean rounded-2xl border p-4" style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span style={{ color: 'var(--text-secondary)' }}>{isHi ? 'प्रश्न' : 'Question'} {practiceIdx + 1} / {practiceQs.length}</span>
            <button onClick={() => setPracticeSubmitted(true)}
              className="px-3 py-1 rounded-lg text-xs font-extrabold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
              {isHi ? 'सबमिट करें' : 'Submit'}
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--glass-border)' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ background: 'rgb(var(--accent))', width: `${((practiceIdx + 1) / practiceQs.length) * 100}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="glass-card-clean rounded-3xl border p-5 space-y-4" style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg"
              style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>{pq?.subject}</span>
            {pq?.year && <span className="text-[10px] font-bold" style={{ color: '#f59e0b' }}>📜 {pq.year}</span>}
          </div>
          <div className="text-sm font-semibold leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
            {isHi ? pq?.questionHi : pq?.questionEn}
          </div>
          <div className="space-y-2">
            {opts.map((opt, oi) => {
              const isSelected = userAns === oi;
              return (
                <div key={oi} onClick={() => !hasSelected && setPracticeAnswers(prev => ({ ...prev, [pq.id]: oi }))}
                  className="p-3 rounded-2xl border text-sm font-medium cursor-pointer transition-all flex items-start gap-3"
                  style={{
                    background: isSelected ? 'rgb(var(--accent)/0.10)' : 'transparent',
                    borderColor: isSelected ? 'rgb(var(--accent))' : 'var(--glass-border)',
                    color: 'var(--text-primary)',
                    cursor: hasSelected ? 'default' : 'pointer',
                  }}>
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center font-black shrink-0 text-xs"
                    style={{ background: isSelected ? 'rgb(var(--accent))' : 'transparent', borderColor: isSelected ? 'rgb(var(--accent))' : 'var(--glass-border)', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                    {letters[oi]}
                  </div>
                  <span className="pt-0.5 flex-1">{opt}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPracticeIdx(p => Math.max(0, p - 1))}
              disabled={practiceIdx === 0}
              className="px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-30 border flex items-center gap-1"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
              <ArrowLeft className="w-4 h-4" />{isHi ? 'पिछला' : 'Prev'}
            </button>
            {practiceIdx < practiceQs.length - 1 ? (
              <button onClick={() => setPracticeIdx(p => p + 1)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1"
                style={{ background: 'rgb(var(--accent))', color: '#fff' }}>
                {isHi ? 'अगला' : 'Next'}<ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setPracticeSubmitted(true)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1"
                style={{ background: '#16a34a', color: '#fff' }}>
                {isHi ? 'परिणाम देखें' : 'View Result'}<CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Questions View ──
  if (view === 'questions') {
    const subjStats = subjectData.find(s => s.subject === selectedSubject);
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => { setView('subjects'); setSelectedSubject(null); setSearch(''); setFilter('all'); }}
            className="p-2 rounded-xl border transition-all hover:opacity-70"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-black m-0" style={{ color: 'var(--text-primary)' }}>{selectedSubject}</h2>
            <p className="text-[11px] font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
              {subjStats?.total} {isHi ? 'प्रश्न' : 'questions'} • {subjStats?.accuracy}% {isHi ? 'सटीकता' : 'accuracy'}
            </p>
          </div>
          <button onClick={() => startPractice(filteredQuestions.length > 0 ? filteredQuestions : [])}
            disabled={filteredQuestions.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-30"
            style={{ background: 'rgb(var(--accent))', color: '#fff' }}>
            <Play className="w-3.5 h-3.5" />{isHi ? 'प्रैक्टिस' : 'Practice'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
            {[
              { id: 'all', label: isHi ? 'सभी' : 'All', count: subjStats?.total },
              { id: 'wrong', label: isHi ? 'गलत' : 'Wrong', count: subjStats?.wrong },
              { id: 'correct', label: isHi ? 'सही' : 'Correct', count: subjStats?.correct },
              { id: 'unattempted', label: isHi ? 'बाकी' : 'Left', count: subjStats?.unattempted },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all"
                style={{
                  background: filter === f.id ? 'rgb(var(--accent))' : 'transparent',
                  color: filter === f.id ? '#fff' : 'var(--text-secondary)',
                }}>
                {f.label} {f.count !== undefined && `(${f.count})`}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-[120px] flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isHi ? 'खोजें...' : 'Search...'}
              className="flex-1 bg-transparent text-xs font-medium outline-none min-w-0"
              style={{ color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Questions list */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-30" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'कोई प्रश्न नहीं मिला।' : 'No questions found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((q, idx) => {
              const isC = q.isAttempted && q.isCorrect;
              const isW = q.isAttempted && !q.isCorrect;
              const isU = !q.isAttempted;
              return (
                <div key={q.id} className="glass-card-clean rounded-2xl border p-4 space-y-2"
                  style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold" style={{ color: 'rgb(var(--accent))' }}>Q{idx + 1}</span>
                      {q.year && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{q.year}</span>}
                    </div>
                    {isC && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {isW && <XCircle className="w-4 h-4 text-rose-500" />}
                    {isU && <Minus className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                  <p className="text-xs font-medium leading-relaxed line-clamp-3 m-0 whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                    {isHi ? q.questionHi : q.questionEn}
                  </p>
                  {q.isAttempted && (
                    <div className="text-[11px] font-bold" style={{ color: isC ? '#16a34a' : '#dc2626' }}>
                      {isHi ? 'आपका उत्तर:' : 'Your Answer:'} {(isHi ? (q.optionsHi || q.optionsEn) : q.optionsEn)?.[q.userAnswer] || '—'}
                      {!isC && (
                        <span className="ml-2 font-medium" style={{ color: '#16a34a' }}>
                          | {isHi ? 'सही:' : 'Correct:'} {(isHi ? (q.optionsHi || q.optionsEn) : q.optionsEn)?.[q.correctIndex]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Subject Grid View (default) ──
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onGoBack && (
          <button onClick={onGoBack} className="p-2 rounded-xl border transition-all hover:opacity-70"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BookMarked className="w-5 h-5" style={{ color: 'rgb(var(--accent))' }} />
            {isHi ? 'इम्प्रूवमेंट बुक' : 'Improvement Book'}
          </h1>
          <p className="text-xs font-medium m-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'अपने सभी प्रश्नों को Subject-wise देखें और प्रैक्टिस करें' : 'Review & practice all your attempted questions subject-wise'}
          </p>
        </div>
      </div>

      {/* Section Switcher */}
      <div className="flex gap-2">
        {[
          { id: 'prelims', label: isHi ? '🎯 प्रीलिम्स' : '🎯 Prelims' },
          { id: 'mains', label: isHi ? '✍️ मेन्स' : '✍️ Mains' },
        ].map(sec => (
          <button key={sec.id} onClick={() => setSelectedSection(sec.id)}
            className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
            style={{
              background: selectedSection === sec.id ? 'rgb(var(--accent))' : 'rgba(100,116,139,0.1)',
              color: selectedSection === sec.id ? '#fff' : 'var(--text-secondary)',
            }}>
            {sec.label}
          </button>
        ))}
      </div>

      {/* Overall Stats */}
      {totalQs > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { count: totalQs, label: isHi ? 'कुल प्रश्न' : 'Total Saved', color: 'rgb(var(--accent))', bg: 'rgb(var(--accent)/0.1)' },
            { count: totalCorrect, label: isHi ? 'सही' : 'Correct', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
            { count: totalWrong, label: isHi ? 'गलत' : 'Wrong', color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
          ].map((s, i) => (
            <div key={i} className="glass-card-clean rounded-2xl border p-4 text-center" style={{ borderColor: 'var(--glass-border)', background: s.bg }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.count}</div>
              <div className="text-[11px] font-bold" style={{ color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Subject Cards */}
      {subjectData.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
            style={{ background: 'rgb(var(--accent)/0.1)' }}>
            <Sparkles className="w-8 h-8" style={{ color: 'rgb(var(--accent))' }} />
          </div>
          <div>
            <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'अभी तक कोई प्रश्न नहीं!' : 'No questions yet!'}
            </h3>
            <p className="text-xs font-medium mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
              {isHi
                ? 'प्रीलिम्स का टेस्ट दें — सारे प्रश्न यहाँ Subject-wise सेव हो जाएंगे।'
                : 'Give a Prelims test — all questions will be saved here subject-wise automatically.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subjectData.map((s, i) => {
            const clr = getSubjectColor(i);
            return (
              <div key={s.subject}
                onClick={() => { setSelectedSubject(s.subject); setView('questions'); setFilter('all'); setSearch(''); }}
                className="glass-card-clean rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.01] group"
                style={{ borderColor: `${clr}0.3)`, background: `${clr}0.06)` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>{s.subject}</h3>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--text-secondary)' }} />
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'var(--glass-border)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.accuracy}%`, background: `${clr}0.8)` }} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] font-extrabold">
                  {[
                    { count: s.total, label: isHi ? 'कुल' : 'Total', color: `${clr}0.9)` },
                    { count: s.correct, label: isHi ? 'सही' : 'Correct', color: '#16a34a' },
                    { count: s.wrong, label: isHi ? 'गलत' : 'Wrong', color: '#dc2626' },
                    { count: s.accuracy + '%', label: isHi ? 'सटीकता' : 'Accuracy', color: `${clr}0.9)` },
                  ].map((stat, si) => (
                    <div key={si} className="text-center">
                      <div className="text-base font-black" style={{ color: stat.color }}>{stat.count}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); startPractice(s.questions); }}
                  className="mt-3 w-full py-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 border transition-all hover:opacity-90"
                  style={{ borderColor: `${clr}0.4)`, color: `${clr}0.9)`, background: `${clr}0.08)` }}>
                  <Play className="w-3 h-3" />
                  {isHi ? 'इन सभी का प्रैक्टिस करें' : 'Practice All Questions'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
