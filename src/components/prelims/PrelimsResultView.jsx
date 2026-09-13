import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy, CheckCircle2, XCircle, HelpCircle, ArrowLeft, RefreshCw,
  BookOpen, Award, Target, ChevronDown, ChevronUp, Zap, BarChart2
} from 'lucide-react';

export function PrelimsResultView({ resultData, onRetake, onBackToDashboard }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'solutions'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'unattempted'
  const [expandedIndices, setExpandedIndices] = useState([]);

  if (!resultData) return null;

  const {
    config, questions, userAnswers, correctCount, incorrectCount,
    unattemptedCount, finalScore, maxPossibleScore, accuracyPercentage,
    timeTakenSeconds
  } = resultData;

  const toggleExpandSolution = (idx) => {
    setExpandedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const filteredQuestions = questions.filter((q, idx) => {
    const userAns = userAnswers[q.id];
    if (filterType === 'correct') return userAns === q.correctAnswerIndex;
    if (filterType === 'incorrect') return userAns !== undefined && userAns !== q.correctAnswerIndex;
    if (filterType === 'unattempted') return userAns === undefined;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── TOP ACTION BAR ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-black px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{isHi ? 'प्रिलिम्स डैशबोर्ड पर वापस' : 'Back to Prelims Dashboard'}</span>
        </button>

        <span className="px-3.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/30">
          {config.examType.toUpperCase()} Test Completed
        </span>
      </div>

      {/* ── SCORECARD HIGHLIGHT CARD (MATCHING USER SCREENSHOT 4) ── */}
      <div className="glass-card-clean rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl space-y-6 text-center">
        
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 mb-2">
          <Trophy className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 m-0">
            {isHi ? 'परीक्षण सफलतापूर्वक जमा हुआ!' : 'Test Submitted Successfully!'}
          </h2>
          <p className="text-xs font-bold text-slate-500 m-0 mt-1">
            {config.examType.toUpperCase()} Prelims Practice • {config.testType.toUpperCase()}
          </p>
        </div>

        {/* Circular Score Gauge Container */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-200 shadow-sm flex flex-col justify-center items-center">
            <span className="text-[10px] font-black uppercase text-blue-600">{isHi ? 'प्राप्तांक' : 'Your Score'}</span>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
              {finalScore} <span className="text-xs font-bold text-slate-400">/ {maxPossibleScore}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
            <span className="block text-[10px] font-black uppercase">{isHi ? 'सटीकता' : 'Accuracy'}</span>
            <span className="text-2xl font-black mt-1 block">{accuracyPercentage}%</span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
            <span className="block text-[10px] font-black uppercase">{isHi ? 'सही उत्तर' : 'Correct'}</span>
            <span className="text-2xl font-black mt-1 block">{correctCount} Qs</span>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300">
            <span className="block text-[10px] font-black uppercase">{isHi ? 'गलत उत्तर' : 'Incorrect'}</span>
            <span className="text-2xl font-black mt-1 block">{incorrectCount} Qs</span>
          </div>
        </div>

        {/* Retake & Solutions Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onRetake}
            className="px-5 py-3 rounded-2xl glass-card-clean border border-slate-300 text-xs font-black flex items-center gap-2 hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>{isHi ? 'पुनः प्रयास करें' : 'Retake Test'}</span>
          </button>

          <button
            onClick={() => setActiveTab('solutions')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isHi ? 'विस्तृत व्याख्या एवं समाधान देखें' : 'View Detailed Solutions'}</span>
          </button>
        </div>

      </div>

      {/* ── QUESTION-BY-QUESTION SOLUTIONS BREAKDOWN ── */}
      {activeTab === 'solutions' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 m-0 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>{isHi ? 'उत्तर व्याख्या एवं विस्तृत समाधान:' : 'Detailed Question Solutions & Explanations:'}</span>
            </h3>

            {/* Filter Chips */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border">
              {['all', 'incorrect', 'correct', 'unattempted'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold capitalize transition-all ${
                    filterType === f
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Solutions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswerIndex;
              const isUnattempted = userAns === undefined;
              const isExpanded = expandedIndices.includes(idx);

              return (
                <div
                  key={q.id}
                  className={`p-5 sm:p-6 rounded-3xl glass-card-clean border transition-all space-y-3 shadow-sm ${
                    isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : isUnattempted
                      ? 'border-slate-200 dark:border-slate-800'
                      : 'border-rose-500/40 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase">
                        Q.{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {q.subject} • {q.year || 'Practice Q'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Correct (+{config.examType === 'bpsc' ? '1.0' : '2.0'})
                        </span>
                      )}
                      {!isCorrect && !isUnattempted && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-black flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" /> Incorrect (-{config.negativeMarking})
                        </span>
                      )}
                      {isUnattempted && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-black">
                          Unattempted (0.0)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-relaxed m-0">
                    {isHi ? q.questionHi || q.questionEn : q.questionEn}
                  </p>

                  {/* Options List with Color Highlights */}
                  <div className="space-y-2 pt-1">
                    {((isHi ? q.optionsHi : q.optionsEn) || q.optionsEn || []).map((optText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isUserSelected = userAns === optIdx;
                      const isRightOption = q.correctAnswerIndex === optIdx;

                      let optBg = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200';
                      if (isRightOption) optBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-extrabold';
                      else if (isUserSelected && !isRightOption) optBg = 'bg-rose-500/20 border-rose-500 text-rose-950 dark:text-rose-200 font-extrabold';

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${optBg}`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isRightOption
                              ? 'bg-emerald-600 text-white'
                              : isUserSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {letter}
                          </span>
                          <span className="flex-1">{optText}</span>
                          {isRightOption && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isUserSelected && !isRightOption && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 text-xs space-y-1.5">
                    <h5 className="font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide flex items-center gap-1.5 m-0">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      {isHi ? 'विस्तृत समाधान एवं व्याख्या:' : 'Detailed Explanation:'}
                    </h5>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed m-0 whitespace-pre-line">
                      {isHi ? q.explanationHi || q.explanationEn : q.explanationEn}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
