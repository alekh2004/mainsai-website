import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock, Pause, Play, Bookmark, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, RotateCcw, Send, Layers, X, Grid, Flag
} from 'lucide-react';

export function PrelimsTestInterface({ config, questions, onSubmitTest, onCancelTest }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: optionIndex }
  const [markedForReview, setMarkedForReview] = useState([]); // [qId]
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => (config.durationMinutes || 30) * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [showOnlyUnattempted, setShowOnlyUnattempted] = useState(false);

  // Timer Countdown Effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentQ = questions[currentIndex] || questions[0];
  const currentQId = currentQ?.id;

  const selectedOptionIndex = userAnswers[currentQId] !== undefined ? userAnswers[currentQId] : null;
  const isMarked = markedForReview.includes(currentQId);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return hours > 0 ? `${pad(hours)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  const handleSelectOption = (index) => {
    setUserAnswers(prev => ({ ...prev, [currentQId]: index }));
  };

  const handleClearResponse = () => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQId];
      return copy;
    });
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev =>
      prev.includes(currentQId) ? prev.filter(id => id !== currentQId) : [...prev, currentQId]
    );
  };

  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    // Calculate statistics
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans === undefined || ans === null) {
        unattempted++;
      } else if (ans === q.correctAnswerIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const positiveMarks = correct * (config.examType === 'bpsc' ? 1.0 : 2.0);
    const negativePenalty = incorrect * (config.negativeMarking || 0.66);
    const finalScore = Math.max(0, parseFloat((positiveMarks - negativePenalty).toFixed(2)));

    const resultSummary = {
      config,
      questions,
      userAnswers,
      markedForReview,
      correctCount: correct,
      incorrectCount: incorrect,
      unattemptedCount: unattempted,
      totalQuestions: questions.length,
      finalScore,
      maxPossibleScore: config.totalMarks,
      accuracyPercentage: Math.round((correct / Math.max(1, correct + incorrect)) * 100),
      timeTakenSeconds: (config.durationMinutes * 60) - timeLeftSeconds
    };

    onSubmitTest(resultSummary);
  };

  // Question status color helper for Palette
  const getPaletteStatus = (qId, idx) => {
    const isAns = userAnswers[qId] !== undefined;
    const isRev = markedForReview.includes(qId);
    if (isAns && isRev) return 'bg-indigo-600 text-white'; // Answered & Marked for Review
    if (isAns) return 'bg-emerald-600 text-white'; // Answered
    if (isRev) return 'bg-purple-600 text-white'; // Marked for Review
    return 'bg-slate-100 text-slate-700 hover:bg-slate-200'; // Unattempted
  };

  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = markedForReview.length;

  return (
    <div className="space-y-4 animate-fadeIn pb-12">

      {/* ── TOP NAV BAR WITH TIMER & CONTROLS ── */}
      <div className="glass-card-clean rounded-2xl p-4 border border-white/80 shadow-md flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase">
              {config.examType.toUpperCase()} PRELIMS
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              Q. {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
            Subject: {currentQ?.subject || 'General Studies'}
          </span>
        </div>

        {/* TIMER & PAUSE BUTTON */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-mono text-sm font-black shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-2 rounded-xl glass-card-clean border border-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isPaused ? (isHi ? 'प्रारंभ' : 'Resume') : (isHi ? 'विराम' : 'Pause')}</span>
          </button>

          {/* Palette button for mobile */}
          <button
            onClick={() => setShowPaletteMobile(true)}
            className="lg:hidden p-2 rounded-xl bg-blue-500/15 text-blue-600 border border-blue-500/30"
            title="Question Palette"
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            onClick={handleFinalSubmit}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-500/25 transition-all"
          >
            {isHi ? 'सबमिट करें' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* ── MAIN TEST BODY GRID (QUESTION + SIDEBAR PALETTE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* LEFT 8 COLS: QUESTION DISPLAY CARD */}
        <div className="lg:col-span-8 glass-card-clean rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl space-y-6">
          
          {/* Question Header Metadata */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                +{config.examType === 'bpsc' ? '1.00' : '2.00'}
              </span>
              <span className="text-xs font-black text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                -{config.negativeMarking}
              </span>
            </div>

            <button
              onClick={toggleMarkForReview}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                isMarked
                  ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                  : 'glass-card-clean border-slate-300 text-slate-700 hover:border-purple-400'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isMarked ? (isHi ? 'रिव्यू हेतु चिन्हित' : 'Marked for Review') : (isHi ? 'मार्क फॉर रिव्यू' : 'Mark for Review')}</span>
            </button>
          </div>

          {/* Question Statement (Bilingual) */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed m-0">
              {isHi ? currentQ?.questionHi || currentQ?.questionEn : currentQ?.questionEn}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {((isHi ? currentQ?.optionsHi : currentQ?.optionsEn) || currentQ?.optionsEn || []).map((optText, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx); // A, B, C, D, E
              const isSelected = selectedOptionIndex === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl text-left border font-extrabold text-xs sm:text-sm flex items-start gap-3 transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.01]'
                      : 'glass-card-clean border-slate-200 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {letter}
                  </span>
                  <span className="leading-relaxed pt-0.5">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Control Bar */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <button
              onClick={handleClearResponse}
              disabled={selectedOptionIndex === null}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-600 hover:text-slate-900 transition-all disabled:opacity-40"
            >
              {isHi ? 'उत्तर साफ़ करें' : 'Clear Response'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-2xl glass-card-clean border border-slate-300 text-xs font-black flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isHi ? 'पिछला' : 'Previous'}</span>
              </button>

              <button
                onClick={handleSaveAndNext}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                <span>{isHi ? 'सेव एवं अगला' : 'Save & Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT 4 COLS: QUESTION PALETTE (DESKTOP) */}
        <div className="hidden lg:block lg:col-span-4 glass-card-clean rounded-3xl p-5 border border-white/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 m-0">
              {isHi ? 'प्रश्न पैलेट (Question Palette)' : 'Question Palette'}
            </h4>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {answeredCount}/{questions.length} Attempted
            </span>
          </div>

          {/* Palette Color Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0" />
              <span>{isHi ? 'उत्तर दिया' : 'Answered'} ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-200 shrink-0" />
              <span>{isHi ? 'प्रयास नहीं किया' : 'Not Attempted'} ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-600 shrink-0" />
              <span>{isHi ? 'रिव्यू हेतु चिन्हित' : 'Marked for Review'} ({markedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-600 shrink-0" />
              <span>{isHi ? 'उत्तरित एवं चिन्हित' : 'Ans & Marked'}</span>
            </div>
          </div>

          {/* Grid Numbers 1..N */}
          <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto custom-scroll pr-1 pt-1">
            {questions.map((q, idx) => {
              const isCurr = idx === currentIndex;
              const statusStyle = getPaletteStatus(q.id, idx);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center ${statusStyle} ${
                    isCurr ? 'ring-2 ring-blue-600 scale-110 shadow-md font-extrabold' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Submit Test Action */}
          <button
            onClick={handleFinalSubmit}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <Send className="w-4 h-4" />
            <span>{isHi ? 'परिणाम देखें एवं सबमिट करें' : 'Submit Test'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
