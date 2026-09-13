import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2, XCircle, HelpCircle, Award, RotateCcw,
  BookOpen, ChevronDown, ChevronUp, Sparkles, ArrowLeft, BarChart2, Download
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

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups to download/print the PDF.');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ET Academy - Test Paper & Solution Key</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: 900; color: #2563eb; }
          .sub { font-size: 12px; color: #475569; margin-top: 4px; }
          .stats-grid { display: flex; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
          .stat-box { flex: 1; text-align: center; }
          .stat-val { font-size: 18px; font-weight: 800; color: #2563eb; }
          .stat-lbl { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .q-card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 16px; page-break-inside: avoid; }
          .q-num { font-[12px]; font-weight: 800; color: #2563eb; margin-bottom: 6px; }
          .q-txt { font-size: 13px; font-weight: 700; margin-bottom: 12px; line-height: 1.5; }
          .opt { font-size: 12px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 6px; }
          .opt-correct { background: #dcfce7; border-color: #22c55e; font-weight: 700; color: #14532d; }
          .opt-selected { background: #fee2e2; border-color: #ef4444; font-weight: 700; color: #7f1d1d; }
          .exp-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 14px; border-radius: 8px; font-size: 11px; margin-top: 10px; color: #1e3a8a; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">ET Academy</div>
          <div class="sub">Your partner in civil services preparation. • ${isBpsc ? 'BPSC 70th Prelims' : 'UPSC Prelims'} Question Paper &amp; Official Solution Key</div>
          <div class="sub">Date: ${new Date().toLocaleDateString('en-IN')}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-val">${roundedNetScore} / ${totalPossibleMarks}</div>
            <div class="stat-lbl">Net Score</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${accuracyPct}%</div>
            <div class="stat-lbl">Accuracy</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${correctCount} / ${questions.length}</div>
            <div class="stat-lbl">Correct Qs</div>
          </div>
        </div>

        <h3>Question Paper &amp; Explanations</h3>

        ${questions.map((q, idx) => {
          const userAns = selectedAnswers[q.id];
          const opts = isHi ? q.optionsHi : q.optionsEn;
          const letters = ['A', 'B', 'C', 'D', 'E'];

          return `
            <div class="q-card">
              <div class="q-num">Question ${idx + 1} [${q.subject}]</div>
              <div class="q-txt">${isHi ? q.questionHi : q.questionEn}</div>
              <div className="options">
                ${opts.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctIndex;
                  const isSelected = oIdx === userAns;
                  let cls = 'opt';
                  if (isCorrect) cls += ' opt-correct';
                  else if (isSelected) cls += ' opt-selected';
                  return `<div class="${cls}">${letters[oIdx]}. ${opt} ${isCorrect ? '✔ (Correct Answer)' : ''} ${isSelected && !isCorrect ? '✖ (Your Choice)' : ''}</div>`;
                }).join('')}
              </div>
              <div class="exp-box">
                <strong>Explanation:</strong> ${isHi ? q.explanationHi : q.explanationEn}
              </div>
            </div>
          `;
        }).join('')}

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn pb-10">

      {!showDetailedSolutions ? (

        /* ── Screen 7 & 8: Scorecard Overview ── */
        <div className="glass-card-clean p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 text-center" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
          
          {/* Confetti Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'टेस्ट सफलतापूर्वक सबमिट हुआ!' : 'Test Submitted Successfully!'}
            </h2>
            <p className="text-xs font-medium opacity-70 mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
              Great effort! Keep practicing discipline every day.
            </p>
          </div>

          {/* Circular Score Circle Ring */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="opacity-20"
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
              <span className="text-3xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>
                {roundedNetScore}
              </span>
              <span className="text-xs font-bold opacity-60 mt-1" style={{ color: 'var(--text-secondary)' }}>/ {totalPossibleMarks} Score</span>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs font-black">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <div className="text-xl font-black text-emerald-500">{correctCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-400">Correct</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <div className="text-xl font-black text-rose-500">{wrongCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-rose-400">Incorrect</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-500/10 text-slate-400 border border-slate-500/30">
              <div className="text-xl font-black text-slate-400">{unattemptedCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Unattempted</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowDetailedSolutions(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isHi ? 'विस्तृत उत्तर एवं व्याख्या देखें' : 'View Detailed Solutions'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? 'डाउनलोड प्रश्न पत्र & उत्तर (PDF)' : 'Download Questions & Solutions PDF'}</span>
            </button>

            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl glass-card-clean border hover:bg-slate-50 text-xs font-bold"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
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
