import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronRight, TrendingUp, Award, Calendar, Search,
  AlertCircle, CheckCircle2, FileImage, FileText, X,
  AlertTriangle, Sparkles, Eye, History, ArrowLeft, Layers, Zap
} from 'lucide-react';

function tagBadge(tag) {
  if (!tag) return 'badge-average';
  const t = tag.toLowerCase();
  if (t.includes('excellent')) return 'badge-excellent';
  if (t.includes('good')) return 'badge-good';
  if (t.includes('average') || t.includes('pending')) return 'badge-average';
  return 'badge-poor';
}

// Check if uploaded file is still within 2-day window
function isFileValid(evalItem) {
  if (!evalItem.uploadExpiresAt) return false;
  return Date.now() < evalItem.uploadExpiresAt;
}

function formatDateSafe(val) {
  if (!val) return 'Recent';
  try {
    const d = typeof val?.toDate === 'function' ? val.toDate() : (val?.seconds ? new Date(val.seconds * 1000) : new Date(val));
    return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-IN');
  } catch (e) {
    return 'Recent';
  }
}

export function TestHistory({ onViewReport, onGoBack }) {
  const { evaluations, language } = useApp();
  const isHi = language === 'hi';

  const [search, setSearch] = useState('');
  const [selectedEval, setSelectedEval] = useState(null);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'linereview' | 'model'

  const filtered = (evaluations || []).filter(e =>
    (e.questionTitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.paper || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fadeIn">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight">
              {isHi ? 'मूल्यांकन इतिहास' : 'Test History'}
            </h2>
            <p className="text-xs text-slate-500 m-0 font-medium">
              {isHi ? 'सभी AI-जांचित उत्तरपुस्तिकाएं' : 'All AI-evaluated answer sheets'} • {filtered.length} records
            </p>
          </div>
        </div>
        {onGoBack && (
          <button onClick={onGoBack} className="glass-card-clean px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5 hover:border-blue-400 transition-all">
            <ArrowLeft className="w-4 h-4" /> {isHi ? 'वापस' : 'Back'}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isHi ? 'प्रश्न या पेपर खोजें...' : 'Search by question or paper...'}
          className="w-full pl-10 pr-4 py-2.5 glass-input-clean text-xs font-medium rounded-2xl"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-14 glass-card-clean rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <h4 className="text-base font-extrabold text-slate-700 m-0">
            {isHi ? 'कोई परीक्षा रिकॉर्ड नहीं मिला' : 'No test records found'}
          </h4>
          <p className="text-xs text-slate-500 m-0 font-medium">
            {isHi ? 'पहला टेस्ट देकर AI मूल्यांकन कराएं' : 'Attempt a test to get your first AI evaluation'}
          </p>
        </div>
      )}

      {/* History Cards */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => { setSelectedEval(item); setActiveSection('overview'); }}
            className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-slate-200/80 cursor-pointer flex items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                {item.uploadedFileType === 'image'
                  ? <FileImage className="w-5 h-5 text-blue-500" />
                  : <FileText className="w-5 h-5 text-blue-500" />
                }
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-extrabold uppercase">
                    {item.paper || 'GS Paper'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateSafe(item.createdAt)}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 m-0 truncate group-hover:text-blue-700 transition-colors">
                  {item.questionTitle || item.paper}
                </h4>
                <p className="text-[11px] text-slate-500 m-0 line-clamp-1 font-medium">
                  {item.questionText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-base font-black text-blue-700">
                  {item.score != null ? item.score : '—'} <span className="text-xs text-slate-400 font-bold">/ {item.maxMarks}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${tagBadge(item.tag)}`}>
                  {item.tag || 'Pending'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FULL EVALUATION DETAIL MODAL ── */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xl animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-card-clean rounded-3xl p-6 lg:p-8 border border-white/80 shadow-2xl my-8 space-y-5">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-extrabold uppercase">
                  {selectedEval.paper}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(selectedEval.createdAt).toLocaleString('en-IN')}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${tagBadge(selectedEval.tag)}`}>
                  {selectedEval.tag}
                </span>
              </div>
              <button onClick={() => setSelectedEval(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              {[
                { id: 'overview', label: isHi ? 'स्कोर सारांश' : 'Score Overview' },
                { id: 'linereview', label: isHi ? 'लाइन-बाय-लाइन' : 'Line-by-Line Review' },
                { id: 'model', label: isHi ? 'मॉडल उत्तर' : 'Model Answer Key' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                    activeSection === tab.id
                      ? 'bg-white shadow border border-slate-200 text-blue-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section 1: Score Overview */}
            {activeSection === 'overview' && (
              <div className="space-y-4 animate-fadeIn">

                {/* Question */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="text-xs font-extrabold text-slate-700 mb-1">{selectedEval.questionTitle}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{selectedEval.questionText}</div>
                </div>

                {/* Uploaded Image Preview (if within 2 days) */}
                {selectedEval.uploadedFileBase64 && isFileValid(selectedEval) && selectedEval.uploadedFileType === 'image' && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                      <FileImage className="w-4 h-4 text-blue-500" />
                      {isHi ? 'अपलोड की गई उत्तरपुस्तिका (48 घंटे में हटाई जाएगी)' : 'Uploaded Answer Sheet (auto-deleted in 48h)'}
                    </div>
                    <img
                      src={selectedEval.uploadedFileBase64}
                      alt="Uploaded answer sheet"
                      className="w-full max-h-52 object-contain rounded-2xl border border-slate-200 bg-white"
                    />
                  </div>
                )}
                {selectedEval.uploadedFileBase64 && !isFileValid(selectedEval) && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {isHi ? 'उत्तरपुस्तिका फ़ाइल 48 घंटे बाद स्वचालित रूप से हटा दी गई है।' : 'Answer sheet file was automatically deleted after 48 hours.'}
                  </div>
                )}

                {/* Score Hero */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center space-y-2">
                  <div className="text-4xl font-black text-blue-700">
                    {selectedEval.score ?? '—'} <span className="text-xl text-slate-400 font-bold">/ {selectedEval.maxMarks}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-600">
                    {selectedEval.percentage != null ? `${selectedEval.percentage}% • ` : ''}{selectedEval.modelComparisonNote || ''}
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                {selectedEval.scoreBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(selectedEval.scoreBreakdown).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 capitalize font-bold">{k.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-sm font-extrabold text-blue-700">{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths & Mistakes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                    <h5 className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 m-0">
                      <CheckCircle2 className="w-4 h-4" />
                      {isHi ? 'ताकत (Strengths)' : 'Strengths'}
                    </h5>
                    <ul className="text-xs text-emerald-800 space-y-1 pl-3 list-disc m-0 font-medium">
                      {(selectedEval.keyStrengths || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                    <h5 className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5 m-0">
                      <AlertTriangle className="w-4 h-4" />
                      {isHi ? 'गलतियां (Mistakes)' : 'Mistakes'}
                    </h5>
                    <ul className="text-xs text-rose-800 space-y-1 pl-3 list-disc m-0 font-medium">
                      {(selectedEval.keyMistakes || []).map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Missed Demand Points */}
                {(selectedEval.missedDemandPoints || []).length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                    <h5 className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5 m-0">
                      <AlertCircle className="w-4 h-4" />
                      {isHi ? 'छूटे हुए मांग बिंदु' : 'Missed Demand Points'}
                    </h5>
                    <ul className="text-xs text-amber-800 space-y-1 pl-3 list-disc m-0 font-medium">
                      {selectedEval.missedDemandPoints.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {/* AI Overall Feedback */}
                {selectedEval.overallFeedback && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                    <h5 className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5 m-0">
                      <Sparkles className="w-4 h-4" />
                      {isHi ? 'AI परीक्षक फीडबैक' : 'AI Examiner Feedback'}
                      {selectedEval.modelUsed && (
                        <span className="text-[10px] text-blue-400 font-mono ml-auto">via {selectedEval.modelUsed}</span>
                      )}
                    </h5>
                    <p className="text-xs text-blue-800 leading-relaxed m-0 font-medium">{selectedEval.overallFeedback}</p>
                  </div>
                )}

              </div>
            )}

            {/* Section 2: Line-by-Line Review */}
            {activeSection === 'linereview' && (
              <div className="space-y-3 animate-fadeIn">
                {(selectedEval.lineByLineReview || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">No line-by-line review available for this record.</div>
                ) : (
                  selectedEval.lineByLineReview.map((line, i) => (
                    <div key={i} className={`p-4 rounded-2xl border space-y-1.5 ${
                      line.assessment === 'Strong' ? 'bg-emerald-50 border-emerald-100' :
                      line.assessment === 'Adequate' ? 'bg-blue-50 border-blue-100' :
                      line.assessment === 'Weak' ? 'bg-amber-50 border-amber-100' :
                      'bg-rose-50 border-rose-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700">{line.section}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
                            line.assessment === 'Strong' ? 'badge-excellent' :
                            line.assessment === 'Adequate' ? 'badge-good' :
                            line.assessment === 'Weak' ? 'badge-average' : 'badge-poor'
                          }`}>
                            {line.assessment}
                          </span>
                          <span className="text-xs font-extrabold text-slate-600">
                            {line.marksAwarded} / {line.marksMaximum}
                          </span>
                        </div>
                      </div>
                      {line.studentContent && (
                        <p className="text-[11px] text-slate-600 italic m-0">"{line.studentContent}"</p>
                      )}
                      <p className="text-xs text-slate-700 m-0 font-medium">{line.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Section 3: Model Answer Key */}
            {activeSection === 'model' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <h5 className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5 m-0 mb-2">
                    <Sparkles className="w-4 h-4" />
                    {isHi ? 'AI टॉपर्स मॉडल उत्तर कुंजी' : 'AI Toppers Model Answer Key'}
                  </h5>
                  <div className="text-xs text-blue-900 leading-relaxed whitespace-pre-line font-medium">
                    {selectedEval.modelAnswer || 'Model answer not available for this record.'}
                  </div>
                </div>

                {(selectedEval.keyDemandPoints || []).length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h5 className="text-xs font-extrabold text-slate-700 m-0">
                      {isHi ? 'अनिवार्य मांग बिंदु (Key Demand Points)' : 'Key Demand Points Required'}
                    </h5>
                    <ul className="text-xs text-slate-700 space-y-1.5 pl-3 list-disc m-0 font-medium">
                      {selectedEval.keyDemandPoints.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {(selectedEval.improvementSuggestions || []).length > 0 && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                    <h5 className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5 m-0">
                      <Zap className="w-4 h-4" />
                      {isHi ? 'अगली बार के लिए सुधार के सुझाव' : 'Improvement Tips for Next Attempt'}
                    </h5>
                    <ul className="text-xs text-indigo-800 space-y-1 pl-3 list-disc m-0 font-medium">
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
