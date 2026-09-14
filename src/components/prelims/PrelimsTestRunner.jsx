import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock, CheckCircle2, AlertCircle, Bookmark, ChevronRight, ChevronLeft,
  RotateCcw, Award, Sparkles, HelpCircle, BarChart2, ArrowRight, X
} from 'lucide-react';

export function PrelimsTestRunner({ questions = [], examType = 'upsc', title = 'Prelims Test', onBack }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: optionIndex }
  const [markedReview, setMarkedReview] = useState({}); // { qId: boolean }
  const [timeLeft, setTimeLeft] = useState(() => questions.length * 90); // 1.5 mins per question
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleClearOption = () => {
    if (isSubmitted) return;
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

  // Scoring Rules
  // UPSC GS1: +2.0, -0.66
  // UPSC CSAT: +2.5, -0.83
  // BPSC: +1.0, -0.33
  const isBpsc = examType === 'bpsc';
  const posMark = isBpsc ? 1.0 : (currentQ?.paper === 'csat' ? 2.5 : 2.0);
  const negMark = isBpsc ? 0.33 : (currentQ?.paper === 'csat' ? 0.83 : 0.66);

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    questions.forEach(q => {
      const userAns = selectedAnswers[q.id];
      if (userAns === undefined) {
        unattempted++;
      } else if (userAns === q.correctIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    const totalPossible = questions.length * posMark;
    const score = Math.max(0, (correct * posMark) - (wrong * negMark));
    const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

    return {
      correct,
      wrong,
      unattempted,
      score: Number(score.toFixed(2)),
      totalPossible: Number(totalPossible.toFixed(2)),
      accuracy
    };
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const results = calculateResults();

  return (
    <div className="w-full space-y-5 animate-fadeIn max-w-4xl mx-auto">

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl glass-card-clean border border-white/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-white/40 hover:bg-white/10 transition-all text-xs font-bold"
          >
            ← {isHi ? 'वापस' : 'Back'}
          </button>
          <div>
            <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">
              {examType === 'bpsc' ? '🦁 BPSC 70th Prelims Mode' : '🏛️ UPSC Prelims Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-sm font-black">
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={() => {
                if (window.confirm(isHi ? 'क्या आप टेस्ट जमा करना चाहते हैं?' : 'Are you sure you want to submit the test?')) {
                  setIsSubmitted(true);
                }
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md hover:scale-105 transition-all"
            >
              {isHi ? 'टेस्ट जमा करें' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setShowSolution(s => !s)}
              className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showSolution ? (isHi ? 'स्कोरकार्ड देखें' : 'View Scorecard') : (isHi ? 'हल एवं व्याख्या' : 'View Solutions')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Left: Question Box (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <div className="p-6 rounded-3xl glass-card-clean border border-white/80 space-y-5">
              
              {/* Question metadata header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black text-blue-500 uppercase tracking-wide">
                  Question {currentIndex + 1} of {questions.length} • [{currentQ?.subject}]
                </span>
                <button
                  onClick={toggleMarkReview}
                  className={`text-xs font-extrabold flex items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                    markedReview[currentQ?.id]
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{markedReview[currentQ?.id] ? (isHi ? 'रिव्यू के लिए मार्क' : 'Marked') : (isHi ? 'मार्क करें' : 'Mark')}</span>
                </button>
              </div>

              {/* Question text */}
              <div className="text-sm font-extrabold leading-relaxed space-y-2 whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                {isHi ? currentQ?.questionHi : currentQ?.questionEn}
              </div>

              {/* Options list */}
              <div className="space-y-3 pt-2">
                {(isHi ? currentQ?.optionsHi : currentQ?.optionsEn)?.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ?.id] === idx;
                  const optionLetters = ['(A)', '(B)', '(C)', '(D)'];

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl text-left border text-xs font-bold transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/15 text-blue-400 shadow-md ring-2 ring-blue-500/20'
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                      style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                      <span className="font-extrabold shrink-0 text-blue-400">{optionLetters[idx]}</span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  onClick={handleClearOption}
                  disabled={selectedAnswers[currentQ?.id] === undefined}
                  className="text-xs font-bold opacity-60 hover:opacity-100 disabled:opacity-20"
                >
                  {isHi ? 'उत्तर साफ करें' : 'Clear Response'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-xl border border-white/30 hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1 hover:bg-blue-500 disabled:opacity-30"
                  >
                    <span>{isHi ? 'अगला' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Question Palette (1 col) */}
          <div className="p-4 rounded-3xl glass-card-clean border border-white/60 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'प्रश्न पैलेट' : 'Question Palette'}
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = selectedAnswers[q.id] !== undefined;
                const isM = markedReview[q.id];

                let bgClass = 'bg-white/10 text-white/60 border-white/10';
                if (isM) bgClass = 'bg-amber-500 text-slate-950 font-black';
                else if (isAns) bgClass = 'bg-emerald-500 text-white font-black';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-blue-400 scale-110 shadow-lg' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 text-[11px] font-medium pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                <span>{isHi ? 'उत्तर दिया' : 'Answered'}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                <span>{isHi ? 'रिव्यू के लिए मार्क' : 'Marked for Review'}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-3 h-3 rounded-md inline-block" style={{ background: 'rgba(100,116,139,0.3)' }} />
                <span>{isHi ? 'अपुष्ट' : 'Unanswered'}</span>
              </div>
            </div>
          </div>

        </div>
      ) : showSolution ? (

        /* Solution View */
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-base font-black flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span>{isHi ? 'विस्तृत व्याख्या एवं हल' : 'Detailed Solutions & Explanations'}</span>
          </h3>

          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;
              const isUnattempted = userAns === undefined;

              return (
                <div key={q.id} className="p-5 rounded-3xl glass-card-clean border border-white/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-black text-xs border-b border-white/10 pb-2">
                    <span className="text-blue-400">Q{qIdx + 1}. {q.subject}</span>
                    {isUnattempted ? (
                      <span className="text-slate-400">{isHi ? 'छोड़ा गया' : 'Unattempted'}</span>
                    ) : isCorrect ? (
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> +{posMark} {isHi ? 'सही' : 'Correct'}
                      </span>
                    ) : (
                      <span className="text-rose-400 font-extrabold flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> -{negMark} {isHi ? 'गलत' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-sm whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                    {isHi ? q.questionHi : q.questionEn}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {(isHi ? q.optionsHi : q.optionsEn).map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctIndex;
                      const isOptionSelected = oIdx === userAns;

                      let styleClass = 'border-white/10 opacity-70';
                      if (isOptionCorrect) styleClass = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold';
                      else if (isOptionSelected && !isOptionCorrect) styleClass = 'border-rose-500 bg-rose-500/15 text-rose-300 font-bold';

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${styleClass}`}>
                          <span>{['(A)', '(B)', '(C)', '(D)'][oIdx]} {opt}</span>
                          {isOptionCorrect && <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">{isHi ? 'सही उत्तर' : 'Correct Answer'}</span>}
                          {isOptionSelected && !isOptionCorrect && <span className="text-[10px] uppercase font-black tracking-wider text-rose-400">{isHi ? 'आपका उत्तर' : 'Your Answer'}</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1 mt-2">
                    <div className="font-extrabold text-blue-400 text-[11px] uppercase tracking-wider">{isHi ? 'व्याख्या:' : 'Explanation:'}</div>
                    <div className="text-xs leading-relaxed text-white/90 whitespace-pre-line">
                      {isHi ? q.explanationHi : q.explanationEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      ) : (

        /* Results Summary Card */
        <div className="p-7 rounded-3xl glass-card-clean border border-white/80 space-y-6 text-center animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase">
              {isHi ? 'परीक्षण संपन्न!' : 'Test Completed!'}
            </span>
            <h2 className="text-3xl font-black mt-2 m-0" style={{ color: 'var(--text-primary)' }}>
              {results.score} / {results.totalPossible}
            </h2>
            <p className="text-xs mt-1 m-0 font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'नेगेटिव मार्किंग के साथ कुल प्राप्तांक' : 'Net score considering negative marking'}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-xl font-black text-emerald-500">{results.correct}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'सही' : 'Correct'}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <div className="text-xl font-black text-rose-500">{results.wrong}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'गलत (-' + negMark + ')' : 'Wrong'}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <div className="text-xl font-black text-blue-500">{results.accuracy}%</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'सटीकता' : 'Accuracy'}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowSolution(true)}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-lg hover:bg-blue-500 transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isHi ? 'विस्तृत उत्तर एवं व्याख्या देखें' : 'View Detailed Solutions'}</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-2xl border border-white/40 hover:bg-white/10 text-xs font-bold"
            >
              {isHi ? 'प्रीलिम्स हब पर लौटें' : 'Back to Prelims Hub'}
            </button>
          </div>
        </div>

      )}

    </div>
  );
}
