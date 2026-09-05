/**
 * EvaluationResultModal.jsx
 *
 * Clean, modern evaluation viewer:
 *   - Score Card at top with dimension breakdown
 *   - Side-by-side: Uploaded Answer Sheet (Left) | Detailed AI Line-by-line Review (Right)
 *   - Key Mistakes & Improvement Suggestions
 *   - Overall Examiner Feedback
 *   - Floating AI Chat with Gemini to discuss score or lines
 *   - Fully responsive, high-contrast in both Light & Dark modes
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { chatWithAiAboutLine } from '../../services/geminiService';
import {
  X, CheckCircle2, AlertTriangle, TrendingUp, ThumbsUp, Star,
  ZoomIn, ZoomOut, FileText, Bot, Send, ChevronDown, ChevronUp,
  Award, ShieldCheck, Sparkles, MessageSquare
} from 'lucide-react';

function scoreColor(pct) {
  if (pct >= 75) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', ring: '#10b981' };
  if (pct >= 60) return { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', ring: '#2563eb' };
  if (pct >= 45) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', ring: '#f59e0b' };
  return { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', ring: '#ef4444' };
}

function assessBadge(a) {
  if (a === 'Strong') return { icon: '✅', label: 'Strong', cls: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/30' };
  if (a === 'Adequate') return { icon: '🟡', label: 'Adequate', cls: 'text-amber-600 bg-amber-500/15 border-amber-500/30' };
  if (a === 'Weak') return { icon: '⚠️', label: 'Weak', cls: 'text-orange-600 bg-orange-500/15 border-orange-500/30' };
  return { icon: '❌', label: 'Missing', cls: 'text-rose-600 bg-rose-500/15 border-rose-500/30' };
}

// ── Floating AI Chat Panel ──
function FloatingAIChat({ evalResult, apiKey }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hi! 👋 I'm your Gemini AI Examiner. Your answer scored **${evalResult?.score}/${evalResult?.maxMarks}** (${evalResult?.percentage}%). Ask me any doubt about this evaluation, which line had mistakes, or how to write a topper answer!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const context = `You evaluated this UPSC/BPSC answer.
Question: ${evalResult?.questionText || evalResult?.questionTitle || 'Mains Question'}
Marks: ${evalResult?.score}/${evalResult?.maxMarks} (${evalResult?.percentage}%)
Key Mistakes: ${(evalResult?.keyMistakes || []).join('; ')}
Strengths: ${(evalResult?.keyStrengths || []).join('; ')}
Student asks: ${userMsg}
Reply concisely (2-4 sentences) with academic precision.`;

      const { reply } = await chatWithAiAboutLine({
        lineNumber: 0,
        lineText: userMsg,
        studentMessage: userMsg,
        questionText: context,
        conversationHistory: messages.slice(-6).map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        apiKey
      });
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Could not connect to AI. Please verify your API key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${
          open ? 'bg-rose-500 rotate-45' : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-105 shadow-blue-500/30'
        }`}
        title="Ask AI about this copy"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-3xl shadow-2xl overflow-hidden border flex flex-col"
          style={{
            maxHeight: '60vh',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2 text-white">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-extrabold flex-1">Ask AI Evaluator</span>
            <span className="text-blue-200 text-[10px] font-medium">Gemini 2.5</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-black/5 dark:bg-white/10 rounded-bl-sm'
                  }`}
                  style={m.role !== 'user' ? { color: 'var(--text-primary)' } : {}}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/5 dark:bg-white/10 rounded-2xl px-3 py-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--glass-border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about marks or mistakes..."
              className="flex-1 text-xs glass-input-clean px-3 py-2 outline-none"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function EvaluationResultModal({ isOpen, result, onClose, onRequestTeacherReview }) {
  const { apiKey } = useAuth();
  const { language, activeExam } = useApp();
  const isHi = language === 'hi';

  const [imageZoom, setImageZoom] = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);

  if (!isOpen || !result) return null;

  const totalScore = result.score ?? 0;
  const maxMarks = result.maxMarks || 15;
  const percentage = result.percentage || (maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0);
  const col = scoreColor(percentage);

  // Line by line review list with fallback
  const reviewList = result.lineByLineReview && result.lineByLineReview.length > 0
    ? result.lineByLineReview
    : [
        {
          section: 'Introduction',
          studentContent: result.studentContent || 'Answer submitted',
          assessment: percentage >= 60 ? 'Strong' : 'Weak',
          marksAwarded: Math.round(totalScore * 0.2),
          marksMaximum: Math.round(maxMarks * 0.2),
          comment: 'Context and conceptual clarity reviewed.'
        },
        {
          section: 'Main Body & Core Demand',
          studentContent: result.studentContent || 'Content evaluated against model rubric',
          assessment: percentage >= 50 ? 'Adequate' : 'Missing',
          marksAwarded: Math.round(totalScore * 0.6),
          marksMaximum: Math.round(maxMarks * 0.6),
          comment: 'Coverage of key points and core syllabus demand.'
        },
        {
          section: 'Conclusion & Way Forward',
          studentContent: 'Concluding thoughts',
          assessment: percentage >= 50 ? 'Adequate' : 'Weak',
          marksAwarded: Math.round(totalScore * 0.2),
          marksMaximum: Math.round(maxMarks * 0.2),
          comment: 'Forward-looking recommendations and balanced conclusion.'
        }
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-4xl glass-card-clean rounded-3xl border shadow-2xl my-4 sm:my-6 overflow-hidden flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-extrabold uppercase">
              {result.paper || `${activeExam.toUpperCase()} Mains`}
            </span>
            <div>
              <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
                {result.questionTitle || 'Evaluation Report'}
              </h3>
              <p className="text-[10px] font-medium m-0 opacity-75" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'विस्तृत AI मूल्यांकन रिपोर्ट' : 'Comprehensive AI Evaluation Report'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scroll p-5 sm:p-6 space-y-6 flex-1">
          {/* ① PROMINENT SCORE CARD */}
          <div className={`p-5 rounded-3xl border ${col.bg} transition-all`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'प्राप्तांक स्कोर' : 'Marks Awarded'}
                </span>
                <div className={`text-4xl sm:text-5xl font-black ${col.text}`}>
                  {totalScore} <span className="text-xl font-bold opacity-60">/ {maxMarks}</span>
                </div>
                <div className={`text-sm font-extrabold ${col.text}`}>
                  {percentage}% • {result.tag || (percentage >= 70 ? 'Excellent' : percentage >= 55 ? 'Good' : percentage >= 40 ? 'Average' : 'Needs Work')}
                </div>
              </div>

              {/* Circular score meter */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    strokeWidth="4"
                    stroke="currentColor"
                    className="opacity-15"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeDasharray={`${percentage},100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke={col.ring}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-sm font-black ${col.text}`}>
                  {percentage}%
                </div>
              </div>
            </div>

            {/* Score Breakdown Pills */}
            {result.scoreBreakdown && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                {Object.entries(result.scoreBreakdown).map(([k, v]) => (
                  <div
                    key={k}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold capitalize flex items-center gap-1.5"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                  >
                    <span className="opacity-70">{k}:</span>
                    <span className={`font-black ${col.text}`}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ② QUESTION TEXT */}
          {result.questionText && (
            <div className="p-4 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                {isHi ? 'प्रश्न विवरण' : 'Question Text'}
              </div>
              <p className="text-xs font-medium leading-relaxed m-0" style={{ color: 'var(--text-primary)' }}>
                {result.questionText}
              </p>
            </div>
          )}

          {/* ③ SIDE-BY-SIDE VIEW: Before (Original) 🆚 After (Teacher Checked Copy or AI Analysis) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                <h4 className="text-xs font-black uppercase tracking-wider m-0" style={{ color: 'var(--text-primary)' }}>
                  {result.annotatedFileBase64
                    ? (isHi ? 'तुलनात्मक समीक्षा: मूल कॉपी (Left) 🆚 शिक्षक जांची गई कॉपी (Right)' : 'Side-by-Side: Original Copy (Left) 🆚 Teacher Evaluated Copy (Right)')
                    : (isHi ? 'उत्तरपुस्तिका एवं AI विश्लेषण (Side-by-Side)' : 'Answer Copy & AI Line-by-Line Review')}
                </h4>
              </div>

              {result.annotatedFileBase64 && (
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-extrabold flex items-center gap-1.5">
                  👨‍🏫 {isHi ? 'फैकल्टी द्वारा लाल पेन से जांची गई' : 'Faculty Red-Pen Evaluated'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT: Original Student Copy (Before Checking) */}
              <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}>
                  <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span>📝</span> {isHi ? '1. आपकी मूल उत्तर कॉपी (Before)' : '1. Original Submitted Copy (Before)'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{Math.round(imageZoom * 100)}%</span>
                    <button
                      onClick={() => setImageZoom(z => Math.min(2.5, z + 0.25))}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-auto custom-scroll p-3 flex items-center justify-center" style={{ maxHeight: '440px', minHeight: '280px' }}>
                  {result.uploadedFileBase64 ? (
                    <img
                      src={result.uploadedFileBase64}
                      alt="Original Answer"
                      style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                      className="max-w-full rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="text-center py-10 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                      <FileText className="w-12 h-12 mx-auto opacity-40" />
                      <div className="text-xs font-bold">
                        {isHi ? 'मूल उत्तर कॉपी' : 'Original Student Sheet'}
                      </div>
                      <div className="text-[10px] opacity-75 max-w-xs mx-auto">
                        {result.uploadedFileName || 'Scanned answer sheet'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Teacher Annotated Copy (After Checking) OR AI Review */}
              {result.annotatedFileBase64 ? (
                <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
                  <div className="px-4 py-2.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <span>✍️</span> {isHi ? '2. शिक्षक द्वारा जांची गई कॉपी (After)' : '2. Faculty Annotated Copy (After)'}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25">
                      Red Pen & Marks
                    </span>
                  </div>

                  <div className="overflow-auto custom-scroll p-3 flex items-center justify-center" style={{ maxHeight: '440px', minHeight: '280px' }}>
                    <img
                      src={result.annotatedFileBase64}
                      alt="Faculty Checked Answer Copy"
                      style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                      className="max-w-full rounded-xl shadow-md border"
                      style={{ borderColor: 'var(--glass-border)' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
                  <div className="px-4 py-2.5 border-b shrink-0" style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}>
                    <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                      {isHi ? 'AI जांच व मॉडल सुधार' : 'AI Corrections & Model Answer'}
                    </span>
                  </div>

                  <div className="overflow-y-auto custom-scroll divide-y" style={{ maxHeight: '440px', borderColor: 'var(--glass-border)' }}>
                    {reviewList.map((sec, idx) => {
                      const badge = assessBadge(sec.assessment);
                      return (
                        <div key={idx} className="p-3.5 space-y-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${badge.cls} shrink-0`}>
                                {badge.icon} {badge.label}
                              </span>
                              <span className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>
                                {sec.section}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                                {sec.marksAwarded != null ? `${sec.marksAwarded}/${sec.marksMaximum}` : '—'}
                              </span>
                              {expandedSection === idx ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                            </div>
                          </div>

                          {/* Student quote */}
                          {sec.studentContent && (
                            <div className="text-[11px] font-medium rounded-xl p-2.5 border italic" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                              ✍️ <span className="opacity-75">{isHi ? 'आपने लिखा:' : 'Student wrote:'}</span> "{sec.studentContent}"
                            </div>
                          )}

                          {/* AI Comment / Model Expected Solution */}
                          {sec.comment && (
                            <div className="text-[11px] font-medium leading-relaxed flex items-start gap-1.5" style={{ color: 'var(--text-primary)' }}>
                              <span className="text-blue-500 font-bold shrink-0">💡</span>
                              <span>{sec.comment}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ④ MISTAKES & IMPROVEMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mistakes */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
              <div className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {isHi ? 'सुधार हेतु त्रुटियां (Mistakes)' : 'Key Mistakes Identified'}
              </div>
              <ul className="space-y-1.5 m-0 p-0 list-none">
                {(result.keyMistakes || ['Review key demand points and constitutional articles.']).map((m, i) => (
                  <li key={i} className="text-xs font-medium text-rose-700 dark:text-rose-300 flex items-start gap-2 leading-relaxed">
                    <span className="font-black shrink-0 text-rose-400">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Suggestions */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-2">
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> {isHi ? 'स्कोर बढ़ाने के सुझाव (Topper Tips)' : 'How to Score More'}
              </div>
              <ul className="space-y-1.5 m-0 p-0 list-none">
                {(result.improvementSuggestions || ['Add data points and Supreme Court citations.']).map((s, i) => (
                  <li key={i} className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-start gap-2 leading-relaxed">
                    <span className="font-black shrink-0 text-blue-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ⑤ STRENGTHS */}
          {result.keyStrengths && result.keyStrengths.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4" /> {isHi ? 'उत्तर की मजबूत कड़ियां (Strengths)' : 'Strong Points in Your Answer'}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keyStrengths.map((st, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 text-emerald-500" />
                    {st}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ⑥ OVERALL EXAMINER FEEDBACK */}
          {result.overallFeedback && (
            <div className="p-4 rounded-2xl border space-y-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="text-xs font-black flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-4 h-4 text-blue-500" />
                {isHi ? 'मुख्य परीक्षक का समग्र फीडबैक' : 'Chief Examiner Overall Feedback'}
              </div>
              <p className="text-xs font-medium leading-relaxed whitespace-pre-line m-0" style={{ color: 'var(--text-secondary)' }}>
                {result.overallFeedback}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl btn-primary-clean text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" /> {isHi ? 'समीक्षा पूर्ण — बंद करें' : 'Close Review'}
            </button>

            {onRequestTeacherReview && (
              <button
                onClick={onRequestTeacherReview}
                className="py-3.5 px-6 rounded-2xl glass-card-clean border border-purple-500/40 text-purple-600 dark:text-purple-400 text-xs font-extrabold hover:bg-purple-500/10 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                {isHi ? 'शिक्षक से पुनः जांच का अनुरोध' : 'Request Human Teacher Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Chat button */}
      <FloatingAIChat evalResult={result} apiKey={apiKey} />
    </div>
  );
}
