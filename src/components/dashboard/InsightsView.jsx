import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3, TrendingUp, Award, AlertTriangle, Target, Calendar,
  ChevronRight, CheckCircle2, X, Sparkles, Zap, FileText, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

function ScoreBar({ pct, color = 'blue' }) {
  const colors = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-500' };
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden border border-white/20">
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

// Mini sparkline SVG
function SparkLine({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.pct));
  const min = Math.min(...data.map(d => d.pct));
  const range = max - min || 1;
  const w = 200; const h = 50; const pad = 6;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((d.pct - min) / range) * (h - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const going_up = data[data.length - 1].pct >= data[0].pct;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={going_up ? '#10b981' : '#f43f5e'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((d.pct - min) / range) * (h - 2 * pad);
        return (
          <circle key={i} cx={x} cy={y} r="3"
            fill={going_up ? '#10b981' : '#f43f5e'}
            stroke="white" strokeWidth="1.5"
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

export function InsightsView() {
  const { evaluations, getInsightsData, language } = useApp();
  const isHi = language === 'hi';
  const [selectedEval, setSelectedEval] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  const data = getInsightsData();

  if (!data || data.totalTests === 0) {
    return (
      <div className="text-center py-20 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl glass-card-clean border border-white/60 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" style={{ color: 'rgb(var(--accent))' }} />
        </div>
        <h3 className="text-lg font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'अभी तक कोई टेस्ट नहीं' : 'No Test Data Yet'}
        </h3>
        <p className="text-sm font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'पहला AI टेस्ट दें और यहाँ अपनी progress देखें' : 'Attempt your first AI test to see your analytics here'}
        </p>
      </div>
    );
  }

  const { avgPct, best, weakest, byPaper, trend, topMissed, totalTests } = data;
  const going_up = trend.length > 1 && trend[trend.length - 1].pct >= trend[0].pct;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl glass-card-clean border border-white/60 flex items-center justify-center">
          <BarChart3 className="w-5 h-5" style={{ color: 'rgb(var(--accent))' }} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold m-0 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {isHi ? 'प्रदर्शन विश्लेषण' : 'Performance Insights'}
          </h2>
          <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
            {totalTests} {isHi ? 'टेस्ट विश्लेषण किए गए' : 'tests analyzed'} • {isHi ? 'क्लिक करके विस्तार देखें' : 'Click any card for details'}
          </p>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 rounded-3xl glass-card-clean glass-card-hover border border-white/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'औसत स्कोर' : 'Avg Score'}
            </span>
            {going_up
              ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              : <ArrowDownRight className="w-4 h-4 text-rose-500" />
            }
          </div>
          <div className="text-3xl font-black" style={{ color: 'rgb(var(--accent))' }}>{avgPct}%</div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {avgPct >= 70 ? 'On track for mains' : 'Needs improvement'}
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-card-clean glass-card-hover border border-white/60 space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'कुल टेस्ट' : 'Total Tests'}
          </span>
          <div className="text-3xl font-black text-emerald-500">{totalTests}</div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'AI द्वारा मूल्यांकित' : 'AI evaluated'}
          </div>
        </div>

        <div
          className="p-4 rounded-3xl glass-card-clean glass-card-hover border border-white/60 space-y-1.5 cursor-pointer"
          onClick={() => { setSelectedEval(best); setDetailTab('overview'); }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'सर्वश्रेष्ठ टेस्ट' : 'Best Test'}
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500">{best.percentage || Math.round(best.score / best.maxMarks * 100)}%</div>
          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{best.questionTitle}</div>
        </div>

        <div
          className="p-4 rounded-3xl glass-card-clean glass-card-hover border border-white/60 space-y-1.5 cursor-pointer"
          onClick={() => { setSelectedEval(weakest); setDetailTab('overview'); }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'सुधार चाहिए' : 'Needs Work'}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-500">{weakest.percentage || Math.round(weakest.score / weakest.maxMarks * 100)}%</div>
          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{weakest.questionTitle}</div>
        </div>

      </div>

      {/* ── Score Trend ── */}
      <div className="p-5 rounded-3xl glass-card-clean border border-white/60 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
            {isHi ? 'स्कोर ट्रेंड (हालिया 10 टेस्ट)' : 'Score Trend (Last 10 Tests)'}
          </h3>
          <span className={`text-xs font-extrabold flex items-center gap-1 ${going_up ? 'text-emerald-500' : 'text-rose-500'}`}>
            {going_up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {going_up ? (isHi ? 'सुधार हो रहा है' : 'Improving') : (isHi ? 'ध्यान दें' : 'Declining')}
          </span>
        </div>

        {trend.length > 1 ? (
          <>
            <SparkLine data={trend} />
            {/* X-axis labels */}
            <div className="flex justify-between text-[9px] font-mono px-1" style={{ color: 'var(--text-secondary)' }}>
              {trend.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const e = evaluations.find(ev => ev.questionTitle === d.questionTitle);
                    if (e) { setSelectedEval(e); setDetailTab('overview'); }
                  }}
                  className="hover:opacity-70 transition-opacity text-center leading-none"
                  title={`${d.questionTitle} — ${d.pct}%`}
                >
                  {d.date}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs font-medium text-center py-4" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'ट्रेंड के लिए 2+ टेस्ट दें' : 'Attempt 2+ tests to see your trend'}
          </p>
        )}
      </div>

      {/* ── Paper-wise Performance ── */}
      <div className="p-5 rounded-3xl glass-card-clean border border-white/60 space-y-4">
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
                  <span className={`font-extrabold ${
                    avg >= 70 ? 'text-emerald-500' : avg >= 55 ? 'text-blue-500' : avg >= 40 ? 'text-amber-500' : 'text-rose-500'
                  }`}>{avg}% avg · {scores.length} {isHi ? 'टेस्ट' : 'tests'}</span>
                </div>
                <ScoreBar pct={avg} color={color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Missed Demand Points (most frequent) ── */}
      {topMissed.length > 0 && (
        <div className="p-5 rounded-3xl glass-card-clean border border-white/60 space-y-4">
          <h3 className="text-sm font-extrabold m-0 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {isHi ? 'सबसे अधिक छूटे हुए बिंदु' : 'Most Frequently Missed Demand Points'}
          </h3>
          <div className="space-y-2">
            {topMissed.map(({ point, count }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
                <span className="w-5 h-5 rounded-lg text-[10px] font-extrabold flex items-center justify-center bg-amber-500 text-white shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-bold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{point}</span>
                <span className="text-[10px] font-extrabold text-amber-600 shrink-0">
                  missed ×{count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All Tests List (clickable) ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'सभी मूल्यांकन (क्लिक करके विवरण देखें)' : 'All Evaluations — Click to View Details'}
        </h3>
        {evaluations.filter(e => e.score != null).map(e => {
          const pct = e.percentage ?? Math.round(e.score / e.maxMarks * 100);
          return (
            <button
              key={e.id}
              onClick={() => { setSelectedEval(e); setDetailTab('overview'); }}
              className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 text-left flex items-center gap-4"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg"
                    style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>
                    {e.paper}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${tagBadge(e.tag)}`}>{e.tag}</span>
                </div>
                <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{e.questionTitle}</div>
                <ScoreBar pct={pct} color={pct >= 70 ? 'emerald' : pct >= 55 ? 'blue' : pct >= 40 ? 'amber' : 'rose'} />
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-lg font-black" style={{ color: 'rgb(var(--accent))' }}>{e.score}</span>
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>/ {e.maxMarks}</span>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Evaluation Detail Modal ── */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-card-clean rounded-3xl p-6 lg:p-8 border border-white/70 shadow-2xl my-8 space-y-5">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg"
                    style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}>
                    {selectedEval.paper}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(selectedEval.createdAt).toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${tagBadge(selectedEval.tag)}`}>
                    {selectedEval.tag}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>{selectedEval.questionTitle}</h4>
              </div>
              <button onClick={() => setSelectedEval(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-all" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detail Tabs */}
            <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.06)' }}>
              {[
                { id: 'overview', label: isHi ? 'स्कोर' : 'Score' },
                { id: 'linereview', label: isHi ? 'लाइन रिव्यू' : 'Line Review' },
                { id: 'model', label: isHi ? 'मॉडल उत्तर' : 'Model Answer' }
              ].map(tab => (
                <button key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all"
                  style={detailTab === tab.id
                    ? { background: 'rgb(var(--accent))', color: '#fff' }
                    : { color: 'var(--text-secondary)' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Score Overview */}
            {detailTab === 'overview' && (
              <div className="space-y-4 animate-fadeIn">

                <div className="p-5 rounded-2xl text-center space-y-2"
                  style={{ background: 'rgb(var(--accent)/0.08)', border: '1px solid rgb(var(--accent)/0.20)' }}>
                  <div className="text-4xl font-black" style={{ color: 'rgb(var(--accent))' }}>
                    {selectedEval.score} <span className="text-xl font-bold" style={{ color: 'var(--text-secondary)' }}>/ {selectedEval.maxMarks}</span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {selectedEval.percentage ?? Math.round(selectedEval.score / selectedEval.maxMarks * 100)}% • {selectedEval.modelComparisonNote}
                  </div>
                </div>

                {/* Score Breakdown */}
                {selectedEval.scoreBreakdown && (
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(selectedEval.scoreBreakdown).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl text-center"
                        style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)' }}>
                        <div className="text-[9px] font-bold capitalize leading-tight" style={{ color: 'var(--text-secondary)' }}>
                          {k.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="text-sm font-extrabold" style={{ color: 'rgb(var(--accent))' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths / Mistakes */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }}>
                    <h5 className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 m-0">
                      <CheckCircle2 className="w-4 h-4" /> {isHi ? 'ताकत' : 'Strengths'}
                    </h5>
                    <ul className="text-xs space-y-1 pl-3 list-disc m-0 font-medium text-emerald-800">
                      {(selectedEval.keyStrengths || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                    <h5 className="text-xs font-extrabold text-rose-600 flex items-center gap-1.5 m-0">
                      <AlertTriangle className="w-4 h-4" /> {isHi ? 'गलतियां' : 'Mistakes'}
                    </h5>
                    <ul className="text-xs space-y-1 pl-3 list-disc m-0 font-medium text-rose-800">
                      {(selectedEval.keyMistakes || []).map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Missed demand points */}
                {(selectedEval.missedDemandPoints || []).length > 0 && (
                  <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
                    <h5 className="text-xs font-extrabold text-amber-600 flex items-center gap-1.5 m-0">
                      <Target className="w-4 h-4" /> {isHi ? 'छूटे हुए मांग बिंदु' : 'Missed Demand Points'}
                    </h5>
                    <ul className="text-xs space-y-1 pl-3 list-disc m-0 font-medium text-amber-800">
                      {selectedEval.missedDemandPoints.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {/* Feedback */}
                {selectedEval.overallFeedback && (
                  <div className="p-4 rounded-2xl space-y-1"
                    style={{ background: 'rgb(var(--accent)/0.06)', border: '1px solid rgb(var(--accent)/0.18)' }}>
                    <h5 className="text-xs font-extrabold flex items-center gap-1.5 m-0" style={{ color: 'rgb(var(--accent))' }}>
                      <Sparkles className="w-4 h-4" /> AI {isHi ? 'परीक्षक फीडबैक' : 'Examiner Feedback'}
                      {selectedEval.modelUsed && (
                        <span className="text-[10px] ml-auto font-mono" style={{ color: 'var(--text-secondary)' }}>via {selectedEval.modelUsed}</span>
                      )}
                    </h5>
                    <p className="text-xs leading-relaxed m-0 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedEval.overallFeedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Line-by-Line Review */}
            {detailTab === 'linereview' && (
              <div className="space-y-3 animate-fadeIn">
                {(selectedEval.lineByLineReview || []).length === 0 ? (
                  <p className="text-center text-sm py-8" style={{ color: 'var(--text-secondary)' }}>
                    No line-by-line review available for this record.
                  </p>
                ) : (
                  selectedEval.lineByLineReview.map((line, i) => (
                    <div key={i} className={`p-4 rounded-2xl space-y-2 ${
                      line.assessment === 'Strong' ? 'bg-emerald-50/60 border border-emerald-200/60' :
                      line.assessment === 'Adequate' ? 'bg-blue-50/60 border border-blue-200/60' :
                      line.assessment === 'Weak' ? 'bg-amber-50/60 border border-amber-200/60' :
                      'bg-rose-50/60 border border-rose-200/60'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>{line.section}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
                            line.assessment === 'Strong' ? 'badge-excellent' :
                            line.assessment === 'Adequate' ? 'badge-good' :
                            line.assessment === 'Weak' ? 'badge-average' : 'badge-poor'
                          }`}>{line.assessment}</span>
                          <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
                            {line.marksAwarded}/{line.marksMaximum}
                          </span>
                        </div>
                      </div>
                      {line.studentContent && (
                        <p className="text-[11px] italic m-0" style={{ color: 'var(--text-secondary)' }}>
                          "{line.studentContent}"
                        </p>
                      )}
                      <p className="text-xs font-medium m-0" style={{ color: 'var(--text-primary)' }}>{line.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Model Answer */}
            {detailTab === 'model' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl space-y-2"
                  style={{ background: 'rgb(var(--accent)/0.06)', border: '1px solid rgb(var(--accent)/0.18)' }}>
                  <h5 className="text-xs font-extrabold flex items-center gap-2 m-0" style={{ color: 'rgb(var(--accent))' }}>
                    <Sparkles className="w-4 h-4" /> {isHi ? 'AI टॉपर्स मॉडल उत्तर' : 'AI Toppers Model Answer Key'}
                  </h5>
                  <pre className="text-xs leading-relaxed m-0 font-medium whitespace-pre-wrap" style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                    {selectedEval.modelAnswer || 'Model answer not available.'}
                  </pre>
                </div>

                {(selectedEval.keyDemandPoints || []).length > 0 && (
                  <div className="p-4 rounded-2xl space-y-2"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--glass-border)' }}>
                    <h5 className="text-xs font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                      {isHi ? 'अनिवार्य मांग बिंदु' : 'Key Demand Points Required'}
                    </h5>
                    <ul className="text-xs space-y-1.5 pl-3 list-disc m-0 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedEval.keyDemandPoints.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {(selectedEval.improvementSuggestions || []).length > 0 && (
                  <div className="p-4 rounded-2xl space-y-2"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.20)' }}>
                    <h5 className="text-xs font-extrabold text-indigo-600 flex items-center gap-1.5 m-0">
                      <Zap className="w-4 h-4" /> {isHi ? 'सुधार के सुझाव' : 'Improvement Tips'}
                    </h5>
                    <ul className="text-xs space-y-1 pl-3 list-disc m-0 font-medium text-indigo-800">
                      {selectedEval.improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
