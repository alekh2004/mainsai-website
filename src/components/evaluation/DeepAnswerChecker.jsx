/**
 * DeepAnswerChecker.jsx
 *
 * SIMPLIFIED 3-PHASE FLOW:
 *   Phase 1: UPLOAD — Student uploads image/PDF of handwritten answer
 *   Phase 2: EVALUATING — AI reads & scores (single Gemini call, no extra steps)
 *   Phase 3: RESULT — Score card at top + Side-by-side (image | line corrections) + Floating AI chat
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { evaluateStudentAnswer, chatWithAiAboutLine } from '../../services/geminiService';
import {
  Upload, X, Sparkles, RefreshCw, CheckCircle2,
  AlertCircle, MessageSquare, Send, ChevronDown, ChevronUp,
  Star, TrendingUp, AlertTriangle, ThumbsUp, FileText,
  ZoomIn, ZoomOut, Maximize2, Bot, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── Phase constants ──────────────────────────────────────
const PHASE = { UPLOAD: 'upload', EVALUATING: 'evaluating', RESULT: 'result' };

// ── Colour helpers ───────────────────────────────────────
function scoreColor(pct) {
  if (pct >= 75) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', ring: '#10b981' };
  if (pct >= 60) return { text: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',       ring: '#2563eb' };
  if (pct >= 45) return { text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     ring: '#f59e0b' };
  return               { text: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-500/10 border-rose-500/30',       ring: '#ef4444' };
}

function assessIcon(a) {
  if (a === 'Strong')   return { icon: '✅', label: 'Strong', cls: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/30' };
  if (a === 'Adequate') return { icon: '🟡', label: 'Adequate', cls: 'text-amber-600 bg-amber-500/15 border-amber-500/30' };
  if (a === 'Weak')     return { icon: '⚠️', label: 'Weak', cls: 'text-orange-600 bg-orange-500/15 border-orange-500/30' };
  return                       { icon: '❌', label: 'Missing', cls: 'text-rose-600 bg-rose-500/15 border-rose-500/30' };
}

// ── Floating AI Chat ─────────────────────────────────────
function FloatingAIChat({ evalResult, question, apiKey }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: `Hi! 👋 I'm your Gemini AI evaluator. Your answer scored **${evalResult?.score}/${evalResult?.maxMarks}** (${evalResult?.percentage}%). Ask me anything about your evaluation — which line was wrong, what to add, or how to write a topper answer!` }
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
      const context = `You evaluated a student's UPSC/BPSC Mains answer.
Question: ${question?.questionText || 'Mains question'}
Score given: ${evalResult?.score}/${evalResult?.maxMarks} (${evalResult?.percentage}%)
Key mistakes: ${(evalResult?.keyMistakes || []).join('; ')}
Key strengths: ${(evalResult?.keyStrengths || []).join('; ')}
Student asks: ${userMsg}
Reply concisely (2-4 sentences), academically. If asking about a specific line, reference the mistake directly.`;

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
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, could not connect to AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${
          open ? 'bg-rose-500 rotate-45' : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-105 shadow-blue-500/30'
        }`}
        title="Ask AI about your evaluation"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
      </button>

      {/* Chat Panel */}
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
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2 text-white">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-extrabold flex-1">Ask AI Evaluator</span>
            <span className="text-blue-200 text-[10px] font-medium">Gemini 2.5</span>
          </div>

          {/* Messages */}
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

          {/* Input */}
          <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--glass-border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about your evaluation..."
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

// ── Main Component ───────────────────────────────────────
export function DeepAnswerChecker({ isOpen, onClose, question, onEvaluationComplete }) {
  const { apiKey } = useAuth();
  const { activeExam, saveEvaluationResult, language } = useApp();
  const isHi = language === 'hi';

  const [phase, setPhase]           = useState(PHASE.UPLOAD);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [imageZoom, setImageZoom]   = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);
  const fileInputRef = useRef(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPhase(PHASE.UPLOAD);
      setUploadedFile(null);
      setErrorMsg('');
      setEvalResult(null);
      setImageZoom(1);
      setExpandedSection(null);
    }
  }, [isOpen]);

  if (!isOpen || !question) return null;

  // ── File handler ──
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMsg('Only JPG, PNG images or PDF files are supported.');
      return;
    }
    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => setUploadedFile({
      name: file.name,
      base64: reader.result,
      mimeType: file.type,
      previewUrl: file.type.startsWith('image/') ? reader.result : null,
      type: file.type.startsWith('image/') ? 'image' : 'pdf'
    });
    reader.readAsDataURL(file);
  };

  // ── Evaluate ──
  const handleEvaluate = async () => {
    if (!uploadedFile) return;
    if (!apiKey) { setErrorMsg('Please add your Gemini API key in Settings first.'); return; }
    setErrorMsg('');
    setPhase(PHASE.EVALUATING);
    try {
      const result = await evaluateStudentAnswer({
        examType: activeExam,
        question,
        studentAnswerImageBase64: uploadedFile.type === 'image' ? uploadedFile.base64 : null,
        studentAnswerPdfBase64:   uploadedFile.type === 'pdf'   ? uploadedFile.base64 : null,
        imageMimeType: uploadedFile.mimeType,
        apiKey
      });

      const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
      const saved = saveEvaluationResult({
        questionTitle: question.title,
        questionText: question.questionText,
        paper: question.paper,
        examType: activeExam,
        maxMarks: question.maxMarks,
        wordLimit: question.wordLimit,
        keyDemandPoints: question.keyDemandPoints || [],
        modelAnswer: question.modelAnswer || '',
        uploadedFileName: uploadedFile.name,
        uploadedFileBase64: uploadedFile.base64,
        uploadedFileType: uploadedFile.type,
        uploadedFileMimeType: uploadedFile.mimeType,
        uploadExpiresAt: expiresAt,
        evaluationType: 'deep_ai',
        ...result
      });

      if (result.percentage >= 70) confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
      setEvalResult(result);
      setPhase(PHASE.RESULT);
      onEvaluationComplete?.(saved);
    } catch (err) {
      setErrorMsg(err.message || 'AI evaluation failed. Please retry.');
      setPhase(PHASE.UPLOAD);
    }
  };

  // ─────────────────────────────────────────────────────
  // PHASE 1 — UPLOAD
  // ─────────────────────────────────────────────────────
  const renderUpload = () => (
    <div className="space-y-5">
      {/* Question preview strip */}
      <div className="p-4 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-wide mb-1 text-blue-600 dark:text-blue-400">
          {isHi ? 'प्रश्न विवरण' : 'Question'}
        </div>
        <p className="text-xs font-medium leading-relaxed line-clamp-3 m-0" style={{ color: 'var(--text-primary)' }}>
          {question.questionText}
        </p>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">{question.maxMarks}M</span>
          <span className="text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{activeExam.toUpperCase()}</span>
        </div>
      </div>

      {/* Drop zone */}
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-400'
          }`}
          style={{
            background: 'var(--card-bg)',
            borderColor: isDragging ? 'rgb(var(--accent))' : 'var(--glass-border)'
          }}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-sm font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            {isHi ? 'हस्तलिखित उत्तर कॉपी अपलोड करें' : 'Tap to upload your answer sheet'}
          </div>
          <div className="text-xs opacity-75 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'साफ फोटो (JPG / PNG) या PDF स्कैन' : 'Clear photo (JPG / PNG) or PDF scan'}
          </div>
          <div className="mt-3 inline-block text-[11px] font-bold px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
            Gemini Vision AI will evaluate against official rubric
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
          {uploadedFile.previewUrl
            ? <img src={uploadedFile.previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-xl shrink-0 border" style={{ borderColor: 'var(--glass-border)' }} />
            : <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
                <FileText className="w-7 h-7" />
              </div>}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> File ready for evaluation
            </div>
            <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{uploadedFile.name}</div>
          </div>
          <button onClick={() => setUploadedFile(null)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-500/10">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      <button
        onClick={handleEvaluate}
        disabled={!uploadedFile}
        className="w-full py-4 rounded-2xl btn-primary-clean text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-5 h-5" />
        {isHi ? 'उत्तर की जांच करें — AI मूल्यांकन शुरू करें' : 'Check My Answer — Start AI Evaluation'}
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // PHASE 2 — EVALUATING
  // ─────────────────────────────────────────────────────
  const renderEvaluating = () => (
    <div className="flex flex-col items-center justify-center py-14 space-y-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'rgb(var(--accent)/0.15)' }}>
          <Sparkles className="w-10 h-10 animate-pulse" style={{ color: 'rgb(var(--accent))' }} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
          <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {isHi ? 'AI आपकी उत्तरपुस्तिका का मूल्यांकन कर रहा है…' : 'AI Reading & Scoring Your Answer…'}
        </div>
        <div className="text-xs font-medium max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Gemini is analyzing handwriting, line by line, comparing against model rubric and awarding dimension marks.
        </div>
      </div>
      <div className="flex gap-1.5">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>This takes about 10–15 seconds…</div>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // PHASE 3 — RESULT
  // ─────────────────────────────────────────────────────
  const renderResult = () => {
    if (!evalResult) return null;
    const pct = evalResult.percentage || 0;
    const col = scoreColor(pct);

    return (
      <div className="space-y-5">
        {/* ① SCORE CARD — shown first, prominent */}
        <div className={`rounded-3xl border p-5 ${col.bg}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 mb-1" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'प्राप्तांक स्कोर' : 'AI Evaluation Score'}
              </div>
              <div className={`text-4xl sm:text-5xl font-black ${col.text}`}>
                {evalResult.score}
                <span className="text-lg opacity-60 font-bold">/{evalResult.maxMarks}</span>
              </div>
              <div className={`text-sm font-extrabold ${col.text} mt-0.5`}>
                {pct}% • {evalResult.tag}
              </div>
            </div>
            {/* Circular progress */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path strokeWidth="4" stroke="currentColor" className="opacity-15" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path strokeDasharray={`${pct},100`} strokeWidth="4" strokeLinecap="round"
                  stroke={col.ring} fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center text-sm font-black ${col.text}`}>{pct}%</div>
            </div>
          </div>

          {/* Score breakdown pills */}
          {evalResult.scoreBreakdown && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              {Object.entries(evalResult.scoreBreakdown).map(([k, v]) => (
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

        {/* ② SIDE-BY-SIDE: Image LEFT | Corrections RIGHT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h4 className="text-xs font-black uppercase tracking-wider m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'उत्तरपुस्तिका एवं AI विश्लेषण (Side-by-Side)' : 'Answer Copy & AI Line-by-Line Review'}
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT — Scanned copy */}
            <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="px-4 py-2.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}>
                <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'आपकी उत्तर कॉपी' : 'Your Answer'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{Math.round(imageZoom * 100)}%</span>
                  <button onClick={() => setImageZoom(z => Math.min(2.5, z + 0.25))}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="overflow-auto custom-scroll p-3 flex items-center justify-center" style={{ maxHeight: '420px', minHeight: '260px' }}>
                {uploadedFile?.previewUrl ? (
                  <img
                    src={uploadedFile.previewUrl}
                    alt="Your answer"
                    style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                    className="max-w-full rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                    <FileText className="w-12 h-12 opacity-40" />
                    <span className="text-xs font-bold">{uploadedFile?.name || 'File uploaded'}</span>
                    <span className="text-[11px] opacity-75">PDF evaluation completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Line-by-line corrections */}
            <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="px-4 py-2.5 border-b shrink-0" style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}>
                <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'AI जांच व मॉडल सुधार' : 'AI Corrections & Model Answer'}
                </span>
              </div>
              <div className="overflow-y-auto custom-scroll divide-y" style={{ maxHeight: '420px', borderColor: 'var(--glass-border)' }}>
                {(evalResult.lineByLineReview || []).map((sec, idx) => {
                  const badge = assessIcon(sec.assessment);
                  return (
                    <div key={idx} className="p-3.5 space-y-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                      {/* Section header */}
                      <div
                        onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                        className="w-full flex items-center justify-between cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${badge.cls} shrink-0`}>
                            {badge.icon} {badge.label}
                          </span>
                          <span className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>{sec.section}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                            {sec.marksAwarded != null ? `${sec.marksAwarded}/${sec.marksMaximum}` : '—'}
                          </span>
                          {expandedSection === idx
                            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {sec.studentContent && (
                        <div className="text-[11px] font-medium rounded-xl p-2.5 border italic" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                          ✍️ <span className="opacity-75">{isHi ? 'आपने लिखा:' : 'Student wrote:'}</span> "{sec.studentContent}"
                        </div>
                      )}
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
          </div>
        </div>

        {/* ③ MISTAKES & IMPROVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evalResult.keyMistakes?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
              <div className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {isHi ? 'सुधार हेतु त्रुटियां' : 'Key Mistakes'}
              </div>
              <ul className="space-y-1.5 m-0 p-0 list-none">
                {evalResult.keyMistakes.map((m, i) => (
                  <li key={i} className="text-xs font-medium text-rose-700 dark:text-rose-300 flex items-start gap-2 leading-relaxed">
                    <span className="font-black shrink-0 text-rose-400">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evalResult.improvementSuggestions?.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-2">
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> {isHi ? 'स्कोर बढ़ाने के सुझाव' : 'How to Score More'}
              </div>
              <ul className="space-y-1.5 m-0 p-0 list-none">
                {evalResult.improvementSuggestions.map((s, i) => (
                  <li key={i} className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-start gap-2 leading-relaxed">
                    <span className="font-black shrink-0 text-blue-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Strengths */}
        {evalResult.keyStrengths?.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4" /> {isHi ? 'उत्तर की मजबूत कड़ियां' : 'What You Did Well'}
            </div>
            <div className="flex flex-wrap gap-2">
              {evalResult.keyStrengths.map((s, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-emerald-500" /> {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Overall feedback */}
        {evalResult.overallFeedback && (
          <div className="p-4 rounded-2xl border space-y-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
            <div className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'मुख्य परीक्षक का समग्र फीडबैक' : 'Overall Examiner Feedback'}
            </div>
            <p className="text-xs font-medium leading-relaxed whitespace-pre-line m-0" style={{ color: 'var(--text-secondary)' }}>
              {evalResult.overallFeedback}
            </p>
          </div>
        )}

        {/* Done */}
        <button onClick={onClose}
          className="w-full py-3.5 rounded-2xl btn-primary-clean text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg">
          <Check className="w-5 h-5" /> {isHi ? 'समीक्षा पूर्ण — इतिहास में सहेजा गया' : 'Done — Saved to History'}
        </button>
      </div>
    );
  };

  // ── Phase labels ──
  const phaseLabel = {
    [PHASE.UPLOAD]: isHi ? 'उत्तरपुस्तिका अपलोड' : 'Upload Answer Copy',
    [PHASE.EVALUATING]: isHi ? 'AI मूल्यांकन प्रगति पर…' : 'AI Evaluating…',
    [PHASE.RESULT]: isHi ? 'मूल्यांकन परिणाम' : 'Evaluation Result'
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-start justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
        <div
          className="relative w-full max-w-4xl glass-card-clean rounded-3xl border shadow-2xl my-4 sm:my-6 overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b shrink-0"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}
          >
            <div>
              <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{phaseLabel[phase]}</div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {question.paper} • {question.maxMarks}M • {activeExam.toUpperCase()} Mains
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Phase dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {[PHASE.UPLOAD, PHASE.EVALUATING, PHASE.RESULT].map((p) => (
                  <div key={p} className={`h-1.5 rounded-full transition-all duration-300 ${
                    phase === p ? 'w-6 bg-blue-600' : phase === PHASE.RESULT && p !== PHASE.EVALUATING ? 'w-2 bg-emerald-400' : 'w-2 bg-slate-400/40'
                  }`} />
                ))}
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto custom-scroll p-5 sm:p-6 flex-1">
            {phase === PHASE.UPLOAD     && renderUpload()}
            {phase === PHASE.EVALUATING && renderEvaluating()}
            {phase === PHASE.RESULT     && renderResult()}
          </div>

        </div>
      </div>

      {/* Floating AI Chat — only shown on result page */}
      {phase === PHASE.RESULT && evalResult && (
        <FloatingAIChat evalResult={evalResult} question={question} apiKey={apiKey} />
      )}
    </>
  );
}
