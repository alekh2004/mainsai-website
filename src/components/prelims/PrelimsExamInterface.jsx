import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock, Pause, Play, Bookmark, ChevronLeft, ChevronRight,
  RotateCcw, CheckCircle2, AlertCircle, Grid, X, HelpCircle
} from 'lucide-react';

export function PrelimsExamInterface({ questions = [], config = {}, onTestSubmit }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: optionIndex }
  const [markedReview, setMarkedReview] = useState({}); // { qId: boolean }
  const [isPaused, setIsPaused] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  const isBpsc = config.exam === 'bpsc';
  const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
  const negMark = isBpsc ? 0.33 : 0.66;

  const totalSecs = (questions.length || 100) * 72; // 72 secs per q
  const [timeLeft, setTimeLeft] = useState(totalSecs);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, timeLeft]);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleClearOption = () => {
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleMarkReview = () => {
    setMarkedReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Counting Stats for Palette
  let answeredCount = 0;
  let markedCount = 0;
  let unattemptedCount = 0;
  let answeredAndMarkedCount = 0;

  questions.forEach(q => {
    const isAns = selectedAnswers[q.id] !== undefined;
    const isM = markedReview[q.id];
    if (isAns && isM) answeredAndMarkedCount++;
    else if (isAns) answeredCount++;
    else if (isM) markedCount++;
    else unattemptedCount++;
  });

  const handleFinalSubmit = () => {
    onTestSubmit({
      questions,
      selectedAnswers,
      markedReview,
      config,
      timeTakenSecs: totalSecs - timeLeft
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-fadeIn pb-10 text-slate-900">

      {/* ── Top Timer & Control Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-900 m-0">
            {isBpsc ? 'BPSC 70th Prelims 2024' : 'UPSC Prelims 2024'}
          </h2>
          <p className="text-[11px] font-bold text-slate-500 m-0">
            {config.testType === 'full_length' ? 'Full Length Test (GS Paper I)' : 'Practice Test'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-black">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setIsPaused(p => !p)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? (isHi ? 'पुनः शुरू' : 'Resume') : (isHi ? 'विराम' : 'Pause')}</span>
          </button>

          <button
            onClick={() => setShowPaletteModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 md:hidden"
          >
            <Grid className="w-3.5 h-3.5 text-purple-600" />
            <span>{isHi ? 'पैलेट' : 'Palette'}</span>
          </button>

          <button
            onClick={() => setShowSubmitConfirmModal(true)}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm"
          >
            {isHi ? 'सबमिट करें' : 'End Test'}
          </button>
        </div>
      </div>

      {/* ── Main Layout (Left: Question Panel 3 cols | Right: Palette 1 col) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Question Area (3 Cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-left">
            
            {/* Question Header Metadata */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Q. {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {currentQ?.subject || 'General Studies'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                    +{posMark}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-black border border-rose-200">
                    -{negMark}
                  </span>
                </div>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!markedReview[currentQ?.id]}
                    onChange={toggleMarkReview}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>Mark for Review</span>
                  <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                </label>
              </div>
            </div>

            {/* Question Text (Crisp Dark Font) */}
            <div className="text-sm md:text-base font-black text-slate-900 leading-relaxed whitespace-pre-line">
              {isHi ? currentQ?.questionHi : currentQ?.questionEn}
            </div>

            {/* Radio Options List (White cards with slate borders) */}
            <div className="space-y-3 pt-2">
              {(isHi ? currentQ?.optionsHi : currentQ?.optionsEn)?.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ?.id] === idx;
                const optionLetters = ['A', 'B', 'C', 'D', 'E'];

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-slate-900 shadow-sm ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-black shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600'
                    }`}>
                      {optionLetters[idx]}
                    </div>
                    <span className="pt-0.5 leading-relaxed">{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                onClick={handleClearOption}
                disabled={selectedAnswers[currentQ?.id] === undefined}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30"
              >
                Clear Response
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1 hover:bg-slate-200 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1 shadow-sm disabled:opacity-30"
                >
                  <span>Save &amp; Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Desktop Question Palette Sidebar (1 Col) */}
        <div className="hidden md:block bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
            Question Palette
          </h3>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-extrabold">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>{answeredCount} Answered</span>
            </div>

            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>{markedCount} Marked</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span>{unattemptedCount} Left</span>
            </div>

            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
              <span>{answeredAndMarkedCount} Ans &amp; M</span>
            </div>
          </div>

          {/* Question Grid 1 to 100 */}
          <div className="grid grid-cols-5 gap-1.5 pt-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAns = selectedAnswers[q.id] !== undefined;
              const isM = markedReview[q.id];

              let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
              if (isAns && isM) bgClass = 'bg-indigo-600 text-white font-black border-indigo-600';
              else if (isAns) bgClass = 'bg-emerald-600 text-white font-black border-emerald-600';
              else if (isM) bgClass = 'bg-purple-600 text-white font-black border-purple-600';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl border text-xs font-black transition-all flex items-center justify-center ${bgClass} ${
                    isCurrent ? 'ring-2 ring-blue-600 scale-105 shadow-md' : 'hover:opacity-90'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Question Palette Mobile Modal ── */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 m-0">Question Palette</h3>
              <button onClick={() => setShowPaletteModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = selectedAnswers[q.id] !== undefined;
                const isM = markedReview[q.id];

                let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isAns && isM) bgClass = 'bg-indigo-600 text-white font-black';
                else if (isAns) bgClass = 'bg-emerald-600 text-white font-black';
                else if (isM) bgClass = 'bg-purple-600 text-white font-black';

                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(idx); setShowPaletteModal(false); }}
                    className={`w-10 h-10 rounded-xl border text-xs font-black ${bgClass} ${
                      isCurrent ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <HelpCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">Almost There!</h3>
              <p className="text-xs font-medium text-slate-500 mt-1 m-0">
                Review your answers before submitting the test.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-black">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <div className="text-lg font-black">{answeredCount}</div>
                <div className="text-[10px] uppercase text-emerald-600">Answered</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200">
                <div className="text-lg font-black">{unattemptedCount}</div>
                <div className="text-[10px] uppercase text-slate-500">Unattempted</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
