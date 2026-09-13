import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2, XCircle, HelpCircle, Award, RotateCcw,
  BookOpen, ChevronDown, ChevronUp, Sparkles, ArrowLeft, BarChart2
} from 'lucide-react';

export function PrelimsResultAnalysis({ resultData = {}, onBackToDashboard }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [showDetailedSolutions, setShowDetailedSolutions] = useState(false);

  const questions = resultData.questions || [];
  const selectedAnswers = resultData.selectedAnswers || {};
  const config = resultData.config || {};
  const isBpsc = config.exam === 'bpsc';

  const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
  const negMark = isBpsc ? 0.33 : 0.66;

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  questions.forEach(q => {
    const userAns = selectedAnswers[q.id];
    if (userAns === undefined) {
      unattemptedCount++;
    } else if (userAns === q.correctIndex) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const totalPossibleMarks = Math.round(questions.length * posMark);
  const netScore = Math.max(0, (correctCount * posMark) - (wrongCount * negMark));
  const roundedNetScore = Number(netScore.toFixed(2));
  const accuracyPct = (correctCount + wrongCount) > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn pb-10 text-slate-900">

      {!showDetailedSolutions ? (

        /* ── Screen 7 & 8: Scorecard Overview ── */
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
          
          {/* Confetti Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 m-0">
              {isHi ? 'टेस्ट सफलतापूर्वक सबमिट हुआ!' : 'Test Submitted Successfully!'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1 m-0">
              Great effort! Keep practicing discipline every day.
            </p>
          </div>

          {/* Circular Score Circle Ring */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000"
                strokeDasharray={`${accuracyPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {roundedNetScore}
              </span>
              <span className="text-xs font-bold text-slate-400 mt-1">/ {totalPossibleMarks} Score</span>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs font-black">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <div className="text-xl font-black text-emerald-600">{correctCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700">Correct</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200">
              <div className="text-xl font-black text-rose-600">{wrongCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-rose-700">Incorrect</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200">
              <div className="text-xl font-black text-slate-600">{unattemptedCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Unattempted</div>
            </div>
          </div>

          {/* Additional Stats Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around text-xs font-bold text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
              <span className="text-base font-black text-blue-600">{accuracyPct}%</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Questions</span>
              <span className="text-base font-black text-slate-900">{questions.length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowDetailedSolutions(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isHi ? 'विस्तृत उत्तर एवं व्याख्या देखें' : 'View Detailed Solutions'}</span>
            </button>

            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
            >
              {isHi ? 'होम पर लौटें' : 'Back to Dashboard'}
            </button>
          </div>

        </div>

      ) : (

        /* ── Detailed Solutions Accordion ── */
        <div className="space-y-5 animate-fadeIn">
          
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setShowDetailedSolutions(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Performance</span>
            </button>

            <h3 className="text-sm font-black text-slate-900 m-0">
              {isHi ? 'व्याख्या एवं हल' : 'Itemized Solutions & Explanations'}
            </h3>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;
              const isUnattempted = userAns === undefined;

              return (
                <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold">
                    <span className="font-black text-blue-600">Q{qIdx + 1}. {q.subject}</span>
                    {isUnattempted ? (
                      <span className="text-slate-400 font-extrabold">Unattempted</span>
                    ) : isCorrect ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct (+{posMark})
                      </span>
                    ) : (
                      <span className="text-rose-600 font-extrabold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect (-{negMark})
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="text-sm font-black text-slate-900 leading-relaxed whitespace-pre-line">
                    {isHi ? q.questionHi : q.questionEn}
                  </div>

                  {/* Options breakdown */}
                  <div className="space-y-2">
                    {(isHi ? q.optionsHi : q.optionsEn).map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctIndex;
                      const isOptionSelected = oIdx === userAns;

                      let borderStyle = 'border-slate-200 bg-white text-slate-700';
                      if (isOptionCorrect) borderStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-black';
                      else if (isOptionSelected && !isOptionCorrect) borderStyle = 'border-rose-500 bg-rose-50/70 text-rose-900 font-black';

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${borderStyle}`}>
                          <span>{['A', 'B', 'C', 'D', 'E'][oIdx]}. {opt}</span>
                          {isOptionCorrect && <span className="text-[10px] font-black uppercase text-emerald-700">Correct Answer</span>}
                          {isOptionSelected && !isOptionCorrect && <span className="text-[10px] font-black uppercase text-rose-700">Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs leading-relaxed space-y-1">
                    <div className="font-black text-blue-800 text-[11px] uppercase tracking-wider">Explanation:</div>
                    <div className="text-slate-800 font-medium whitespace-pre-line">
                      {isHi ? q.explanationHi : q.explanationEn}
                    </div>
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
