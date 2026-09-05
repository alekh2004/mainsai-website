import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  UserCheck, CheckCircle2, Clock, FileText, Image, Award, Send, X,
  Edit3, Highlighter, MessageSquare, Undo, Trash2, Check, ZoomIn, ZoomOut,
  Sparkles, ShieldCheck, ArrowLeft, Eye, RotateCw, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ── DIGITAL COPY CHECKING CANVAS COMPONENT ──
function TeacherCanvasModal({ item, onClose, onSaveEvaluation }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const canvasRef = useRef(null);
  const [tool, setTool] = useState('red_pen'); // 'red_pen' | 'blue_pen' | 'highlighter' | 'eraser' | 'text'
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Grading form
  const [marks, setMarks] = useState(item?.score != null ? String(item.score) : '');
  const [feedback, setFeedback] = useState(item?.feedback || '');
  const [breakdown, setBreakdown] = useState({
    intro: Math.round((item?.maxMarks || 15) * 0.15),
    body: Math.round((item?.maxMarks || 15) * 0.60),
    conclusion: Math.round((item?.maxMarks || 15) * 0.15),
    presentation: Math.round((item?.maxMarks || 15) * 0.10)
  });

  const baseImageRef = useRef(null);

  // Initialize Canvas with Student's Image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    // If student uploaded an image, use it; otherwise generate a placeholder answer sheet
    img.src = item.uploadedFileBase64 || createMockStudentAnswerImage(item);

    img.onload = () => {
      baseImageRef.current = img;
      canvas.width = img.width || 800;
      canvas.height = img.height || 1100;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveState();
    };
  }, [item]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, historyStep + 1), dataUrl]);
    setHistoryStep(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prevStep = historyStep - 1;
    const img = new window.Image();
    img.src = history[prevStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryStep(prevStep);
    };
  };

  const handleClear = () => {
    if (!baseImageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
    saveState();
  };

  // Drawing Handlers
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    if (tool === 'text') {
      const { x, y } = getCanvasCoords(e);
      setTextPos({ x, y });
      return;
    }

    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'red_pen') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'blue_pen') {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = lineWidth * 5;
      ctx.globalAlpha = 0.5;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
    } else if (tool === 'eraser') {
      // Redraw base image pixel on eraser
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 4;
      ctx.globalAlpha = 1.0;
    }

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || tool === 'text') return;
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(`✍️ ${textInput}`, textPos.x, textPos.y);

    setTextInput('');
    setTextPos(null);
    saveState();
  };

  const handleSaveAndSubmit = (e) => {
    e.preventDefault();
    if (!marks) {
      alert(isHi ? 'कृपया छात्र के अंक (Marks) दर्ज करें।' : 'Please enter student marks.');
      return;
    }

    const canvas = canvasRef.current;
    const annotatedBase64 = canvas ? canvas.toDataURL('image/jpeg', 0.85) : item.uploadedFileBase64;

    onSaveEvaluation(item.id, {
      score: Number(marks),
      feedback: feedback || 'Well written answer. Follow the red pen annotations to improve structure and citations.',
      annotatedFileBase64: annotatedBase64,
      scoreBreakdown: breakdown
    });

    confetti({ particleCount: 80, spread: 70 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-6xl glass-card-clean rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-4"
        style={{ maxHeight: 'calc(100vh - 1.5rem)', background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              👨‍🏫
            </div>
            <div>
              <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? `उत्तरपुस्तिका जांच: ${item.studentName}` : `Evaluating Copy: ${item.studentName}`}
              </h3>
              <p className="text-[11px] font-medium m-0 opacity-75" style={{ color: 'var(--text-secondary)' }}>
                {item.paper} • Max {item.maxMarks} Marks • {item.questionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace Grid: Canvas Left (65%) | Grading Form Right (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* ── LEFT: INTERACTIVE CANVAS TOOL ── */}
          <div className="lg:col-span-8 p-4 flex flex-col border-b lg:border-b-0 lg:border-r overflow-hidden" style={{ borderColor: 'var(--glass-border)' }}>
            
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-2 rounded-2xl border mb-3 shrink-0" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-1">
                {/* Red Pen */}
                <button
                  type="button"
                  onClick={() => setTool('red_pen')}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                    tool === 'red_pen' ? 'bg-red-500 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  style={tool !== 'red_pen' ? { color: 'var(--text-secondary)' } : {}}
                  title="Red Pen (Underline & Circle)"
                >
                  <Edit3 className="w-4 h-4 text-red-500" style={tool === 'red_pen' ? { color: '#fff' } : {}} />
                  <span className="hidden sm:inline">Red Pen</span>
                </button>

                {/* Blue Pen */}
                <button
                  type="button"
                  onClick={() => setTool('blue_pen')}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                    tool === 'blue_pen' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  style={tool !== 'blue_pen' ? { color: 'var(--text-secondary)' } : {}}
                  title="Blue Pen"
                >
                  <Edit3 className="w-4 h-4 text-blue-500" style={tool === 'blue_pen' ? { color: '#fff' } : {}} />
                  <span className="hidden sm:inline">Blue Pen</span>
                </button>

                {/* Highlighter */}
                <button
                  type="button"
                  onClick={() => setTool('highlighter')}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                    tool === 'highlighter' ? 'bg-amber-400 text-slate-950 shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  style={tool !== 'highlighter' ? { color: 'var(--text-secondary)' } : {}}
                  title="Highlighter"
                >
                  <Highlighter className="w-4 h-4 text-amber-500" style={tool === 'highlighter' ? { color: '#000' } : {}} />
                  <span className="hidden sm:inline">Highlight</span>
                </button>

                {/* Text Note */}
                <button
                  type="button"
                  onClick={() => setTool('text')}
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                    tool === 'text' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  style={tool !== 'text' ? { color: 'var(--text-secondary)' } : {}}
                  title="Click to write correction note"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Write Note</span>
                </button>
              </div>

              {/* Action Tools: Undo, Clear, Zoom */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all disabled:opacity-30"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Undo last stroke"
                >
                  <Undo className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all"
                  title="Clear all annotations"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1 opacity-50" />

                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(2.0, z + 0.2))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sticky Text Input Popup when in text tool mode */}
            {textPos && (
              <div className="p-3 rounded-2xl border mb-2 flex items-center gap-2 animate-fadeIn shadow-lg" style={{ background: 'var(--card-bg)', borderColor: 'rgb(var(--accent))' }}>
                <span className="text-xs font-bold text-red-500 shrink-0">✍️ Add Note:</span>
                <input
                  type="text"
                  autoFocus
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddText()}
                  placeholder="e.g. Add Article 32 reference, Improve conclusion..."
                  className="flex-1 px-3 py-1.5 rounded-xl glass-input-clean text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddText}
                  className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold"
                >
                  Place
                </button>
                <button
                  type="button"
                  onClick={() => setTextPos(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Interactive Drawing Canvas Container */}
            <div className="flex-1 overflow-auto custom-scroll rounded-2xl border p-2 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--glass-border)' }}>
              <canvas
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  cursor: tool === 'text' ? 'crosshair' : 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\'/></svg>") 0 16, crosshair',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                }}
                className="max-w-full rounded-xl bg-white select-none"
              />
            </div>

          </div>

          {/* ── RIGHT: OFFICIAL GRADING & FEEDBACK FORM ── */}
          <div className="lg:col-span-4 p-5 overflow-y-auto custom-scroll space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-xs font-black uppercase tracking-wider m-0" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'आधिकारिक शिक्षक अंकन' : 'Faculty Official Grading'}
                </h4>
              </div>

              {/* Total Score Input */}
              <div className="p-4 rounded-2xl border space-y-1.5" style={{ background: 'rgba(147, 51, 234, 0.08)', borderColor: 'rgba(147, 51, 234, 0.3)' }}>
                <label className="block text-xs font-extrabold text-purple-700 dark:text-purple-300">
                  {isHi ? `प्राप्तांक स्कोर (कुल ${item.maxMarks} में से):` : `Marks Awarded (Out of ${item.maxMarks}):`}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={item.maxMarks}
                    step="0.5"
                    required
                    value={marks}
                    onChange={e => setMarks(e.target.value)}
                    placeholder={`e.g. ${Math.round(item.maxMarks * 0.68)}`}
                    className="w-full px-4 py-2.5 rounded-xl glass-input-clean text-base font-black"
                  />
                  <span className="text-sm font-bold opacity-60">/ {item.maxMarks}</span>
                </div>
              </div>

              {/* Dimension Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wide block" style={{ color: 'var(--text-secondary)' }}>
                  Dimension Scoring
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold block opacity-75" style={{ color: 'var(--text-secondary)' }}>Intro:</label>
                    <input
                      type="number"
                      value={breakdown.intro}
                      onChange={e => setBreakdown({ ...breakdown, intro: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input-clean text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block opacity-75" style={{ color: 'var(--text-secondary)' }}>Body Demand:</label>
                    <input
                      type="number"
                      value={breakdown.body}
                      onChange={e => setBreakdown({ ...breakdown, body: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input-clean text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block opacity-75" style={{ color: 'var(--text-secondary)' }}>Conclusion:</label>
                    <input
                      type="number"
                      value={breakdown.conclusion}
                      onChange={e => setBreakdown({ ...breakdown, conclusion: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input-clean text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block opacity-75" style={{ color: 'var(--text-secondary)' }}>Presentation:</label>
                    <input
                      type="number"
                      value={breakdown.presentation}
                      onChange={e => setBreakdown({ ...breakdown, presentation: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input-clean text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Written Faculty Feedback */}
              <div className="space-y-1">
                <label className="block text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'शिक्षक की विस्तृत टिप्पणी व सुझाव:' : 'Faculty Remarks & Suggestions:'}
                </label>
                <textarea
                  rows="4"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder={isHi ? 'प्रस्तावना में सुधार करें, कुंवर सिंह की 1857 भूमिका और जगदीशपुर लड़ाई का उल्लेख जोड़ें...' : 'Good structure. Add Article 32 in intro, cite Kesavananda case in body...'}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-medium"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="button"
              onClick={handleSaveAndSubmit}
              className="w-full py-3.5 rounded-2xl btn-primary-clean text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all mt-4"
            >
              <Send className="w-4 h-4" />
              <span>{isHi ? 'जांच पूर्ण करें और छात्र को भेजें' : 'Save Checked Copy & Send to Student'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── MOCK ANSWER SHEET GENERATOR FOR DEMO (If no raw base64) ──
function createMockStudentAnswerImage(item) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');

  // Paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Margin rule
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, canvas.height);
  ctx.stroke();

  // Horizontal blue lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let y = 80; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Header Text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px serif';
  ctx.fillText(`Student: ${item.studentName || 'Aspirant'} | Roll: ${item.rollNumber || 'UPSC-2025'}`, 100, 50);

  // Handwritten Mock Content
  ctx.font = '16px "Comic Sans MS", cursive, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  
  const textLines = [
    `Q. ${item.questionTitle || 'Mains Question'}`,
    '',
    'Introduction:',
    'Judicial Activism refers to the proactive role played by the judiciary in',
    'protecting the rights of citizens and promoting justice in society.',
    'Under Article 32 and 226 of the Constitution, the Supreme Court has wide powers.',
    '',
    'Body Paragraph 1 - Key Dimensions:',
    '1. Basic Structure Doctrine established in Kesavananda Bharati (1973).',
    '2. PIL mechanism introduced by Justice P.N. Bhagwati.',
    '3. Vishaka Guidelines for protection against sexual harassment.',
    '',
    'Judicial Overreach vs Activism:',
    'When judiciary enters the domain of Executive or Legislature, it becomes overreach.',
    'Example: Highway Liquor ban case, cancellation of 2G spectrum licenses.',
    'Article 50 provides for Separation of Powers between Judiciary & Executive.',
    '',
    'Conclusion:',
    'Judicial restraint is necessary to maintain constitutional equilibrium.',
    'A fine balance between proactive justice and self-restraint is required.'
  ];

  let y = 100;
  textLines.forEach(line => {
    ctx.fillText(line, 100, y);
    y += 32;
  });

  return canvas.toDataURL('image/jpeg');
}

// ── MAIN TEACHER REVIEW QUEUE COMPONENT ──
export function TeacherReviewQueue({ isOpen, onClose }) {
  const { user, switchRole } = useAuth();
  const { teacherQueue = [], completeTeacherEvaluation, language } = useApp();
  const isHi = language === 'hi';

  const [selectedItemForCanvas, setSelectedItemForCanvas] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const handleUnlockTeacher = (e) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'faculty2025' || pinInput === 'admin') {
      switchRole('teacher');
      setPinError('');
    } else {
      setPinError(isHi ? 'गलत शिक्षक पासकोड! डिफ़ॉल्ट कोड: 1234' : 'Invalid Faculty PIN! Default: 1234');
    }
  };

  // ── STRICT SECURITY: If in Student Mode, show Restricted Lock Screen ──
  if (!isTeacher) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
        <div
          className="relative w-full max-w-md glass-card-clean rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-5 text-center"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'शिक्षक डिजिटल चेकिंग पोर्टल (प्रतिबंधित)' : 'Faculty Checking Portal (Restricted)'}
            </h3>
            <p className="text-xs font-medium opacity-80 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {isHi
                ? 'यह पोर्टल केवल अधिकृत परीक्षकों के लिए है। छात्र कॉपियां जांचने या अंक देने के लिए अधिकृत नहीं हैं।'
                : 'This portal is restricted to authorized faculty examiners. Students cannot grade copies or award marks.'}
            </p>
          </div>

          {/* Unlock with Faculty Passcode */}
          <form onSubmit={handleUnlockTeacher} className="space-y-3 pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'शिक्षक पासकोड दर्ज करें:' : 'Enter Faculty PIN:'}
            </label>
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="Enter Faculty PIN (Default: 1234)"
              className="w-full px-4 py-2.5 rounded-xl glass-input-clean text-center text-sm font-mono tracking-widest font-black"
            />
            {pinError && (
              <div className="text-xs font-bold text-rose-500">
                {pinError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl glass-card-clean border text-xs font-bold"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
              >
                {isHi ? 'वापस जाएं' : 'Go Back'}
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl btn-primary-clean text-xs font-black"
              >
                {isHi ? 'प्रवेश करें' : 'Unlock Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
        <div
          className="relative w-full max-w-4xl glass-card-clean rounded-3xl p-6 lg:p-8 border shadow-2xl my-6 space-y-6"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black m-0" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'शिक्षक डिजिटल मूल्यांकन पोर्टल' : 'Teacher Digital Evaluation & Verification Portal'}
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 uppercase">
                  Faculty Access
                </span>
              </div>
              <p className="text-xs m-0 font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'डिजिटल लाल पेन, हाइलाइटर एवं सीधे कॉपी पर सुधार नोट्स द्वारा उत्तरपुस्तिका जांच' : 'Interactive copy checking with digital red pen, highlighter, sticky notes & scoring'}
              </p>
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              <span>Submitted Student Answer Copies ({teacherQueue.length})</span>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                Pending: {teacherQueue.filter(q => q.status === 'pending').length}
              </span>
            </div>

            {teacherQueue.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border text-xs font-medium space-y-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                <FileText className="w-10 h-10 mx-auto opacity-40" />
                <p className="m-0">No answer copies currently waiting in teacher queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                    style={{
                      background: item.status === 'reviewed' ? 'rgba(0,0,0,0.02)' : 'rgba(147, 51, 234, 0.08)',
                      borderColor: item.status === 'reviewed' ? 'var(--glass-border)' : 'rgba(147, 51, 234, 0.35)'
                    }}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{item.studentName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                          {item.rollNumber || 'UPSC-2025'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] uppercase font-bold">
                          {item.paper}
                        </span>
                        {item.status === 'reviewed' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Checked ({item.score}/{item.maxMarks} Marks)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Waiting for Faculty Check
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                        {item.questionTitle}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedItemForCanvas(item)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shrink-0 transition-all hover:scale-105 ${
                        item.status === 'reviewed'
                          ? 'glass-card-clean border hover:border-purple-400'
                          : 'btn-primary-clean'
                      }`}
                      style={item.status === 'reviewed' ? { borderColor: 'var(--glass-border)', color: 'var(--text-primary)' } : {}}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{item.status === 'reviewed' ? 'Re-check / View Markings' : 'Check Copy with Red Pen'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Interactive Digital Canvas Modal */}
      {selectedItemForCanvas && (
        <TeacherCanvasModal
          item={selectedItemForCanvas}
          onClose={() => setSelectedItemForCanvas(null)}
          onSaveEvaluation={(id, evalData) => {
            completeTeacherEvaluation(id, evalData);
            setSelectedItemForCanvas(null);
          }}
        />
      )}
    </>
  );
}
