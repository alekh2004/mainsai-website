import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3, TrendingUp, Award, AlertTriangle, Target, CheckCircle2,
  X, Sparkles, Zap, ArrowUpRight, ArrowDownRight, BookOpen, FileText,
  Trophy, Brain, Crosshair, Percent
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Shared helpers
──────────────────────────────────────────────── */
function ScoreBar({ pct, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-500', emerald: 'bg-emerald-500',
    rose: 'bg-rose-500', amber: 'bg-amber-500',
    cyan: 'bg-cyan-500', violet: 'bg-violet-500'
  };
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[color] || 'bg-blue-500'}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="text-xs font-extrabold w-10 text-right" style={{ color: 'var(--text-primary)' }}>
        {pct}%
      </span>
    </div>
  );
}

function formatDateSafe(val) {
  if (!val) return 'Recent';
  try {
    const d = typeof val?.toDate === 'function'
      ? val.toDate()
      : (val?.seconds ? new Date(val.seconds * 1000) : new Date(val));
    return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  } catch { return 'Recent'; }
}

function SparkLine({ data, color = '#10b981' }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.pct), 1);
  const min = Math.min(...data.map(d => d.pct), 0);
  const range = max - min || 1;
  const w = 240; const h = 56; const pad = 8;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((d.pct - min) / range) * (h - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const going_up = data[data.length - 1].pct >= data[0].pct;
  const lineColor = going_up ? '#10b981' : '#f43f5e';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`${pts[0].split(',')[0]},${h} ${pts.join(' ')} ${pts[pts.length - 1].split(',')[0]},${h}`}
        fill="url(#sg)"
      />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={lineColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((d.pct - min) / range) * (h - 2 * pad);
        return (
          <circle key={i} cx={x} cy={y} r="3.5"
            fill={lineColor} stroke="white" strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

function tagBadge(tag) {
  const t = (tag || '').toLowerCase();
  if (t.includes('excellent')) return 'badge-excellent';
  if (t.includes('good')) return 'badge-good';
  if (t.includes('average') || t.includes('pending')) return 'badge-average';
  return 'badge-poor';
}

/* ─────────────────────────────────────────────
   Prelims Insights Panel
──────────────────────────────────────────────── */
function PrelimsInsightsPanel({ data, evaluations, isHi }) {
  const [selEval, setSelEval] = useState(null);

  if (!data) {
    return (
      <div className="text-center py-16 space-y-3 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl glass-card-clean border border-emerald-500/30 flex items-center justify-center mx-auto">
          <Target className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'कोई Prelims टेस्ट नहीं दिया गया' : 'No Prelims tests attempted yet'}
        </p>
        <p className="text-xs m-0 font-medium opacity-70" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'Prelims Zone में जाकर टेस्ट दें और यहाँ analysis देखें' : 'Go to Prelims Zone and attempt a test to see analytics here'}
        </p>
      </div>
    );
  }

  const { avgPct, best, weakest, byPaper, trend, totalTests, avgAccuracy, avgWrong, subjectAvg } = data;
  const going_up = trend.length > 1 && trend[trend.length - 1].pct >= trend[0].pct;
  const prelimsEvals = evaluations.filter(e => e.evaluationType === 'prelims_test' && e.score != null);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: isHi ? 'कुल टेस्ट' : 'Total Tests',
            value: totalTests,
            unit: '',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 border-emerald-500/30',
            icon: <FileText className="w-4 h-4 text-emerald-500" />
          },
          {
            label: isHi ? 'औसत स्कोर %' : 'Avg Score %',
            value: avgPct,
            unit: '%',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10 border-blue-500/30',
            icon: going_up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />
          },
          {
            label: isHi ? 'Answer Accuracy' : 'Answer Accuracy',
            value: avgAccuracy ?? 0,
            unit: '%',
            color: avgAccuracy >= 70 ? 'text-emerald-500' : avgAccuracy >= 50 ? 'text-amber-500' : 'text-rose-500',
            bg: 'bg-cyan-500/10 border-cyan-500/30',
            icon: <Percent className="w-4 h-4 text-cyan-500" />
          },
          {
            label: isHi ? 'औसत गलत उत्तर' : 'Avg Wrong Ans',
            value: avgWrong ?? 0,
            unit: ' Qs',
            color: 'text-rose-500',
            bg: 'bg-rose-500/10 border-rose-500/30',
            icon: <AlertTriangle className="w-4 h-4 text-rose-500" />
          },
        ].map((kpi, i) => (
          <div key={i} className={`p-4 rounded-3xl glass-card-clean border space-y-2 ${kpi.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{kpi.label}</span>
              {kpi.icon}
            </div>
            <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}{kpi.unit}</div>
          </div>
        ))}
      </div>

      {/* Score Trend */}
      <div className="p-5 rounded-3xl glass-card-clean border border-white/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            {isHi ? 'स्कोर ट्रेंड (हालिया टेस्ट)' : 'Score Trend (Recent Tests)'}
          </h3>
          <span className={`text-xs font-extrabold flex items-center gap-1 ${going_up ? 'text-emerald-500' : 'text-rose-500'}`}>
            {going_up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {going_up ? (isHi ? 'सुधार' : 'Improving') : (isHi ? 'ध्यान दें' : 'Declining')}
          </span>
        </div>
        {trend.length > 1
          ? <SparkLine data={trend} />
          : <p className="text-xs py-4 text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'ट्रेंड के लिए 2+ टेस्ट दें' : 'Attempt 2+ tests to see trend'}
          </p>
        }
        {trend.length > 1 && (
          <div className="flex justify-between text-[9px] font-mono px-1" style={{ color: 'var(--text-secondary)' }}>
            {trend.map((d, i) => <span key={i} className="text-center">{d.date}</span>)}
          </div>
        )}
      </div>

      {/* Subject-wise Accuracy */}
      {subjectAvg && subjectAvg.length > 0 && (
        <div className="p-5 rounded-3xl glass-card-clean border border-white/20 space-y-4">
          <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Brain className="w-4 h-4 text-violet-500" />
            {isHi ? 'विषयवार सटीकता' : 'Subject-wise Accuracy'}
          </h3>
          <div className="space-y-3">
            {subjectAvg.slice(0, 8).map(({ subject, avg }) => {
              const col = avg >= 70 ? 'emerald' : avg >= 55 ? 'blue' : avg >= 40 ? 'amber' : 'rose';
              return (
                <div key={subject} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span className="truncate max-w-[60%]">{subject}</span>
                    <span className={avg >= 70 ? 'text-emerald-500' : avg >= 55 ? 'text-blue-500' : avg >= 40 ? 'text-amber-500' : 'text-rose-500'}>
                      {avg}% accuracy
                    </span>
                  </div>
                  <ScoreBar pct={avg} color={col} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best & Worst */}
      {(best || weakest) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {best && (
            <div className="p-4 rounded-3xl border space-y-2 cursor-pointer hover:opacity-90" style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.25)' }}
              onClick={() => setSelEval(best)}>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-emerald-600">{isHi ? 'सर्वश्रेष्ठ टेस्ट' : 'Best Test'}</span>
              </div>
              <div className="text-2xl font-black text-emerald-500">{best.percentage ?? Math.round((best.score / best.maxMarks) * 100)}%</div>
              <div className="text-xs font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{best.questionTitle}</div>
            </div>
          )}
          {weakest && (
            <div className="p-4 rounded-3xl border space-y-2 cursor-pointer hover:opacity-90" style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)' }}
              onClick={() => setSelEval(weakest)}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-extrabold text-rose-600">{isHi ? 'सुधार जरूरी' : 'Needs Work'}</span>
              </div>
              <div className="text-2xl font-black text-rose-500">{weakest.percentage ?? Math.round((weakest.score / weakest.maxMarks) * 100)}%</div>
              <div className="text-xs font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{weakest.questionTitle}</div>
            </div>
          )}
        </div>
      )}

      {/* All Prelims Tests List */}
      {prelimsEvals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
            {isHi ? 'सभी Prelims टेस्ट रिकॉर्ड' : 'All Prelims Test Records'}
          </h3>
          {prelimsEvals.map(e => {
            const pct = e.percentage ?? Math.round((e.score / e.maxMarks) * 100);
            const accuracy = e.accuracy ?? 0;
            return (
              <button
                key={e.id}
                onClick={() => setSelEval(e)}
                className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover border text-left space-y-2"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        🎯 {e.examLabel || 'Prelims'}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg" style={{ background: 'rgb(var(--accent)/0.10)', color: 'rgb(var(--accent))' }}>
                        {e.paper}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${tagBadge(e.tag)}`}>{e.tag}</span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>{formatDateSafe(e.createdAt)}</span>
                    </div>
                    <div className="text-xs font-extrabold truncate mb-2" style={{ color: 'var(--text-primary)' }}>{e.questionTitle}</div>
                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-emerald-500">✓ {e.correctCount ?? '—'} Correct</span>
                      <span className="text-rose-500">✗ {e.wrongCount ?? '—'} Wrong</span>
                      <span style={{ color: 'var(--text-secondary)' }}>— {e.unattemptedCount ?? '—'} Left</span>
                      {accuracy > 0 && <span className="text-cyan-500">{accuracy}% acc</span>}
                    </div>
                    <ScoreBar pct={pct} color={pct >= 70 ? 'emerald' : pct >= 55 ? 'blue' : pct >= 40 ? 'amber' : 'rose'} />
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black" style={{ color: 'rgb(var(--accent))' }}>{e.score}</div>
                    <div className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>/ {e.maxMarks}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Eval Detail Modal */}
      {selEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-card-clean rounded-3xl p-6 border border-white/20 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">🎯 {selEval.examLabel || 'Prelims'}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${tagBadge(selEval.tag)}`}>{selEval.tag}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>{formatDateSafe(selEval.createdAt)}</span>
                </div>
                <h4 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>{selEval.questionTitle}</h4>
              </div>
              <button onClick={() => setSelEval(null)} className="p-1.5 rounded-xl hover:bg-white/10 transition-all" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score big display */}
            <div className="p-5 rounded-2xl text-center space-y-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div className="text-4xl font-black text-emerald-500">
                {selEval.score} <span className="text-xl font-bold" style={{ color: 'var(--text-secondary)' }}>/ {selEval.maxMarks}</span>
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                {selEval.percentage}% score • {selEval.accuracy}% accuracy
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <div className="text-xl font-black text-emerald-500">{selEval.correctCount ?? '—'}</div>
                <div className="text-[10px] font-bold text-emerald-600">{isHi ? 'सही उत्तर' : 'Correct'}</div>
              </div>
              <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div className="text-xl font-black text-rose-500">{selEval.wrongCount ?? '—'}</div>
                <div className="text-[10px] font-bold text-rose-600">{isHi ? 'गलत उत्तर' : 'Wrong'}</div>
              </div>
              <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.25)' }}>
                <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{selEval.unattemptedCount ?? '—'}</div>
                <div className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'छोड़े' : 'Skipped'}</div>
              </div>
            </div>

            {/* Feedback */}
            {selEval.overallFeedback && (
              <div className="p-4 rounded-2xl space-y-1" style={{ background: 'rgb(var(--accent)/0.06)', border: '1px solid rgb(var(--accent)/0.18)' }}>
                <h5 className="text-xs font-extrabold flex items-center gap-1.5 m-0" style={{ color: 'rgb(var(--accent))' }}>
                  <Sparkles className="w-4 h-4" /> {isHi ? 'परीक्षा सारांश' : 'Test Summary'}
                </h5>
                <p className="text-xs leading-relaxed m-0 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selEval.overallFeedback}
                </p>
              </div>
            )}

            {/* Time taken */}
            {selEval.timeTakenSecs > 0 && (
              <div className="text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                ⏱ Time taken: {Math.floor(selEval.timeTakenSecs / 60)} mins {selEval.timeTakenSecs % 60} secs
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mains Insights Panel (original logic)
──────────────────────────────────────────────── */
function MainsInsightsPanel({ data, evaluations, isHi }) {
  const [selectedEval, setSelectedEval] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  if (!data) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-14 h-14 rounded-2xl glass-card-clean border border-white/30 flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7" style={{ color: 'rgb(var(--accent))' }} />
        </div>
        <p className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'कोई Mains मूल्यांकन नहीं' : 'No Mains evaluations yet'}
        </p>
        <p className="text-xs m-0 font-medium opacity-70" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'Mains Evaluate में जाकर उत्तर सबमिट करें' : 'Go to Mains Evaluate and submit your answers'}
        </p>
      </div>
    );
  }

  const { avgPct, best, weakest, byPaper, trend, topMissed, totalTests } = data;
  const going_up = trend.length > 1 && trend[trend.length - 1].pct >= trend[0].pct;
  const mainsEvals = (evaluations || []).filter(e => e.evaluationType !== 'prelims_test' && e.score != null);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl glass-card-clean border border-white/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'औसत स्कोर' : 'Avg Score'}</span>
            {going_up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
          </div>
          <div className="text-3xl font-black" style={{ color: 'rgb(var(--accent))' }}>{avgPct}%</div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {avgPct >= 70 ? 'Mains ready' : 'Needs improvement'}
          </div>
        </div>
        <div className="p-4 rounded-3xl glass-card-clean border border-white/20 space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'कुल टेस्ट' : 'Total Tests'}</span>
          <div className="text-3xl font-black text-emerald-500">{totalTests}</div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'मूल्यांकित' : 'Evaluated'}</div>
        </div>
        <div className="p-4 rounded-3xl glass-card-clean border border-white/20 space-y-1.5 cursor-pointer" onClick={() => { setSelectedEval(best); setDetailTab('overview'); }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'सर्वश्रेष्ठ' : 'Best Test'}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500">{best.percentage || Math.round(best.score / best.maxMarks * 100)}%</div>
          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{best.questionTitle}</div>
        </div>
        <div className="p-4 rounded-3xl glass-card-clean border border-white/20 space-y-1.5 cursor-pointer" onClick={() => { setSelectedEval(weakest); setDetailTab('overview'); }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{isHi ? 'सुधार चाहिए' : 'Needs Work'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-500">{weakest.percentage || Math.round(weakest.score / weakest.maxMarks * 100)}%</div>
          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{weakest.questionTitle}</div>
        </div>
      </div>

      {/* Score Trend */}
      <div className="p-5 rounded-3xl glass-card-clean border border-white/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
            {isHi ? 'स्कोर ट्रेंड (हालिया 10 टेस्ट)' : 'Score Trend (Last 10 Tests)'}
          </h3>
          <span className={`text-xs font-extrabold flex items-center gap-1 ${going_up ? 'text-emerald-500' : 'text-rose-500'}`}>
            {going_up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {going_up ? (isHi ? 'सुधार' : 'Improving') : (isHi ? 'ध्यान दें' : 'Declining')}
          </span>
        </div>
        {trend.length > 1 ? <SparkLine data={trend} /> : (
          <p className="text-xs font-medium text-center py-4" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'ट्रेंड के लिए 2+ टेस्ट दें' : 'Attempt 2+ tests to see trend'}
          </p>
        )}
        {trend.length > 1 && (
          <div className="flex justify-between text-[9px] font-mono px-1" style={{ color: 'var(--text-secondary)' }}>
            {trend.map((d, i) => (
              <button key={i} onClick={() => {
                const e = evaluations.find(ev => ev.questionTitle === d.questionTitle && ev.evaluationType !== 'prelims_test');
                if (e) { setSelectedEval(e); setDetailTab('overview'); }
              }} className="hover:opacity-70 text-center">{d.date}</button>
            ))}
          </div>
        )}
      </div>

      {/* Paper-wise */}
      <div className="p-5 rounded-3xl glass-card-clean border border-white/20 space-y-4">
        <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Target className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
          {isHi ? 'पेपर-वार प्रदर्शन' : 'Paper-wise Performance'}
        </h3>
        <div className="space-y-3">
          {Object.entries(byPaper).map(([paper, { scores }]) => {
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            const color = avg >= 70 ? 'emerald' : avg >= 55 ? 'blue' : avg >= 40 ? 'amber' : 'rose';
            return (
              <div key={paper} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  <span>{paper}</span>
                  <span className={avg >= 70 ? 'text-emerald-500' : avg >= 55 ? 'text-blue-500' : avg >= 40 ? 'text-amber-500' : 'text-rose-500'}>
                    {avg}% avg · {scores.length} {isHi ? 'टेस्ट' : 'tests'}
                  </span>
                </div>
                <ScoreBar pct={avg} color={color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed demand points */}
      {topMissed.length > 0 && (
        <div className="p-5 rounded-3xl glass-card-clean border border-white/20 space-y-4">
          <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {isHi ? 'सबसे अधिक छूटे हुए बिंदु' : 'Most Missed Demand Points'}
          </h3>
          <div className="space-y-2">
            {topMissed.map(({ point, count }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
                <span className="w-5 h-5 rounded-lg text-[10px] font-extrabold flex items-center justify-center bg-amber-500 text-white shrink-0">{i + 1}</span>
                <span className="text-xs font-bold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{point}</span>
                <span className="text-[10px] font-extrabold text-amber-600 shrink-0">missed ×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Mains Evaluations */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'सभी Mains मूल्यांकन' : 'All Mains Evaluations'}
        </h3>
        {mainsEvals.map(e => {
          const pct = e.percentage ?? Math.round(e.score / e.maxMarks * 100);
          return (
            <button key={e.id} onClick={() => { setSelectedEval(e); setDetailTab('overview'); }}
              className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover border text-left flex items-center gap-4"
              style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg" style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>{e.paper}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>{formatDateSafe(e.createdAt)}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${tagBadge(e.tag)}`}>{e.tag}</span>
                </div>
                <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{e.questionTitle}</div>
                <ScoreBar pct={pct} color={pct >= 70 ? 'emerald' : pct >= 55 ? 'blue' : pct >= 40 ? 'amber' : 'rose'} />
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-lg font-black" style={{ color: 'rgb(var(--accent))' }}>{e.score}</span>
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>/ {e.maxMarks}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Eval Detail Modal (Mains) */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-card-clean rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg" style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>{selectedEval.paper}</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{new Date(selectedEval.createdAt).toLocaleString('en-IN')}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${tagBadge(selectedEval.tag)}`}>{selectedEval.tag}</span>
                </div>
                <h4 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>{selectedEval.questionTitle}</h4>
              </div>
              <button onClick={() => setSelectedEval(null)} className="p-1.5 rounded-xl hover:bg-white/20 transition-all" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.06)' }}>
              {[{ id: 'overview', label: 'Score' }, { id: 'linereview', label: 'Line Review' }, { id: 'model', label: 'Model Answer' }].map(tab => (
                <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all"
                  style={detailTab === tab.id ? { background: 'rgb(var(--accent))', color: '#fff' } : { color: 'var(--text-secondary)' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {detailTab === 'overview' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-5 rounded-2xl text-center space-y-2" style={{ background: 'rgb(var(--accent)/0.08)', border: '1px solid rgb(var(--accent)/0.20)' }}>
                  <div className="text-4xl font-black" style={{ color: 'rgb(var(--accent))' }}>
                    {selectedEval.score} <span className="text-xl font-bold" style={{ color: 'var(--text-secondary)' }}>/ {selectedEval.maxMarks}</span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {selectedEval.percentage ?? Math.round(selectedEval.score / selectedEval.maxMarks * 100)}%
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }}>
                    <h5 className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 m-0"><CheckCircle2 className="w-4 h-4" /> Strengths</h5>
                    <ul className="text-xs space-y-1 pl-3 list-disc m-0 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {(selectedEval.keyStrengths || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                    <h5 className="text-xs font-extrabold text-rose-600 flex items-center gap-1.5 m-0"><AlertTriangle className="w-4 h-4" /> Mistakes</h5>
                    <ul className="text-xs space-y-1 pl-3 list-disc m-0 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {(selectedEval.keyMistakes || []).map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </div>
                {selectedEval.overallFeedback && (
                  <div className="p-4 rounded-2xl" style={{ background: 'rgb(var(--accent)/0.06)', border: '1px solid rgb(var(--accent)/0.18)' }}>
                    <h5 className="text-xs font-extrabold flex items-center gap-1.5 m-0 mb-2" style={{ color: 'rgb(var(--accent))' }}><Sparkles className="w-4 h-4" /> Examiner Feedback</h5>
                    <p className="text-xs leading-relaxed m-0 font-medium" style={{ color: 'var(--text-primary)' }}>{selectedEval.overallFeedback}</p>
                  </div>
                )}
              </div>
            )}
            {detailTab === 'linereview' && (
              <div className="space-y-3 animate-fadeIn">
                {(selectedEval.lineByLineReview || []).length === 0
                  ? <p className="text-center text-sm py-8" style={{ color: 'var(--text-secondary)' }}>No line-by-line review available.</p>
                  : selectedEval.lineByLineReview.map((line, i) => (
                    <div key={i} className={`p-4 rounded-2xl space-y-2 ${line.assessment === 'Strong' ? 'bg-emerald-50/40 border border-emerald-200/60' : line.assessment === 'Adequate' ? 'bg-blue-50/40 border border-blue-200/60' : line.assessment === 'Weak' ? 'bg-amber-50/40 border border-amber-200/60' : 'bg-rose-50/40 border border-rose-200/60'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>{line.section}</span>
                        <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>{line.marksAwarded}/{line.marksMaximum}</span>
                      </div>
                      <p className="text-xs font-medium m-0" style={{ color: 'var(--text-primary)' }}>{line.comment}</p>
                    </div>
                  ))
                }
              </div>
            )}
            {detailTab === 'model' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl" style={{ background: 'rgb(var(--accent)/0.06)', border: '1px solid rgb(var(--accent)/0.18)' }}>
                  <h5 className="text-xs font-extrabold flex items-center gap-2 m-0 mb-2" style={{ color: 'rgb(var(--accent))' }}><Sparkles className="w-4 h-4" /> Model Answer</h5>
                  <pre className="text-xs leading-relaxed m-0 font-medium whitespace-pre-wrap" style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                    {selectedEval.modelAnswer || 'Model answer not available.'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main InsightsView with Tabs
──────────────────────────────────────────────── */
export function InsightsView() {
  const { evaluations, getInsightsData, language } = useApp();
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState('prelims');

  const data = getInsightsData();

  const allEmpty = !data || data.totalTests === 0;

  if (allEmpty) {
    return (
      <div className="text-center py-20 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl glass-card-clean border border-white/30 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" style={{ color: 'rgb(var(--accent))' }} />
        </div>
        <h3 className="text-lg font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'अभी तक कोई टेस्ट नहीं' : 'No Test Data Yet'}
        </h3>
        <p className="text-sm font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'Prelims या Mains में पहला टेस्ट दें' : 'Attempt your first Prelims or Mains test to see analytics here'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl glass-card-clean border border-white/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5" style={{ color: 'rgb(var(--accent))' }} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold m-0 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {isHi ? 'प्रदर्शन विश्लेषण' : 'Performance Insights'}
          </h2>
          <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
            {data.totalTests} {isHi ? 'कुल टेस्ट' : 'total tests'} •
            {data.prelimsCount > 0 && ` ${data.prelimsCount} Prelims`}
            {data.mainsCount > 0 && ` · ${data.mainsCount} Mains`}
          </p>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'rgba(0,0,0,0.07)' }}>
        <button
          onClick={() => setActiveTab('prelims')}
          className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5"
          style={activeTab === 'prelims'
            ? { background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
            : { color: 'var(--text-secondary)' }}
        >
          <Target className="w-3.5 h-3.5" />
          🎯 Prelims
          {data.prelimsCount > 0 && (
            <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'prelims' ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-600'}`}>
              {data.prelimsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mains')}
          className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5"
          style={activeTab === 'mains'
            ? { background: 'rgb(var(--accent))', color: '#fff', boxShadow: '0 4px 12px rgb(var(--accent)/0.3)' }
            : { color: 'var(--text-secondary)' }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          ✍️ Mains
          {data.mainsCount > 0 && (
            <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'mains' ? 'bg-white/20 text-white' : 'bg-blue-500/15 text-blue-600'}`}>
              {data.mainsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'prelims' && (
        <PrelimsInsightsPanel data={data.prelims} evaluations={evaluations} isHi={isHi} />
      )}
      {activeTab === 'mains' && (
        <MainsInsightsPanel data={data.mains} evaluations={evaluations} isHi={isHi} />
      )}

    </div>
  );
}
