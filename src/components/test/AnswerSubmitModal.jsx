import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { evaluateStudentAnswer } from '../../services/geminiService';
import {
  Upload, Image, FileText, Sparkles, UserCheck, X,
  RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, Eye, Trash2, Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AnswerSubmitModal({ isOpen, onClose, question, onEvaluationComplete, onOpenDeepChecker }) {
  const { user, apiKey, consumeEvaluation } = useAuth();
  const { activeExam, saveEvaluationResult, language } = useApp();
  const isHi = language === 'hi';

  const [uploadedFile, setUploadedFile] = useState(null);   // { name, base64, mimeType, previewUrl, type, sizeFormatted }
  const [evalMode, setEvalMode] = useState('ai');            // 'ai' | 'deep' | 'teacher'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !question) return null;

  const handleFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      setErrorMessage('Only image files (JPG, PNG, WebP) or PDF scans are allowed.');
      return;
    }
    setErrorMessage('');

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFile({
        name: file.name,
        base64: reader.result,
        mimeType: file.type,
        previewUrl: isImage ? reader.result : null,
        type: isImage ? 'image' : 'pdf',
        sizeFormatted
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!uploadedFile) {
      setErrorMessage(isHi ? 'कृपया पहले अपनी उत्तरपुस्तिका की फ़ोटो या PDF अपलोड करें।' : 'Please upload your answer sheet photo or PDF first.');
      return;
    }

    // Deep mode — open the deep checker modal
    if (evalMode === 'deep') {
      onOpenDeepChecker?.(question);
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      if (evalMode === 'ai') {
        const evalResult = await evaluateStudentAnswer({
          examType: activeExam,
          question,
          studentAnswerImageBase64: uploadedFile.type === 'image' ? uploadedFile.base64 : null,
          studentAnswerPdfBase64: uploadedFile.type === 'pdf' ? uploadedFile.base64 : null,
          imageMimeType: uploadedFile.mimeType,
          apiKey
        });

        consumeEvaluation?.();

        const expiresAt = Date.now() + (2 * 24 * 60 * 60 * 1000); // 48 hours
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
          evaluationType: 'instant_ai',

          score: evalResult.score,
          percentage: evalResult.percentage,
          tag: evalResult.tag,
          handwritingLegibility: evalResult.handwritingLegibility,
          wordCountEstimate: evalResult.wordCountEstimate,
          hasDiagram: evalResult.hasDiagram,
          diagramQuality: evalResult.diagramQuality,
          lineByLineReview: evalResult.lineByLineReview || [],
          scoreBreakdown: evalResult.scoreBreakdown || {},
          keyStrengths: evalResult.keyStrengths || [],
          keyMistakes: evalResult.keyMistakes || [],
          missedDemandPoints: evalResult.missedDemandPoints || [],
          improvementSuggestions: evalResult.improvementSuggestions || [],
          overallFeedback: evalResult.overallFeedback || '',
          modelComparisonNote: evalResult.modelComparisonNote || '',
          modelUsed: evalResult.modelUsed || 'gemini'
        });

        if (evalResult.percentage >= 70) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
        }
        onEvaluationComplete?.(saved);
        onClose();
      } else {
        // Teacher submit
        saveEvaluationResult({
          questionTitle: question.title,
          questionText: question.questionText,
          paper: question.paper,
          examType: activeExam,
          maxMarks: question.maxMarks,
          keyDemandPoints: question.keyDemandPoints || [],
          modelAnswer: question.modelAnswer || '',
          uploadedFileName: uploadedFile.name,
          uploadedFileBase64: uploadedFile.base64,
          uploadedFileType: uploadedFile.type,
          uploadExpiresAt: Date.now() + (2 * 24 * 60 * 60 * 1000),
          tag: 'Pending Teacher Review',
          score: null,
          overallFeedback: 'Submitted to teacher for manual evaluation.'
        });

        alert(isHi ? '✅ उत्तरपुस्तिका शिक्षक मूल्यांकन के लिए सफलतापूर्वक जमा कर दी गई है!' : '✅ Answer sheet submitted for Teacher Evaluation!');
        onClose();
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage(err?.message || 'Evaluation failed. Please check your Gemini API key or network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-2xl glass-card-clean rounded-3xl p-6 lg:p-8 border shadow-2xl my-6 space-y-5"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" /> {isHi ? 'वापस' : 'Back'}
            </button>
            <div className="w-px h-4 bg-slate-300 opacity-40" />
            <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
              {question.paper} • {question.maxMarks} Marks • {activeExam.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Preview */}
        <div className="p-4 rounded-2xl border space-y-1" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{question.title}</div>
          <div className="text-xs line-clamp-3 leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
            {question.questionText}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Upload Zone */}
          <div>
            <label className="block text-xs font-black mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Upload className="w-4 h-4 text-blue-600" />
              {isHi ? 'हस्तलिखित उत्तर कॉपी अपलोड करें (Photo या PDF)' : 'Upload Handwritten Answer Sheet (Photo or PDF)'}
            </label>

            {!uploadedFile ? (
              <div
                className={`glass-upload-zone p-8 text-center cursor-pointer border-2 border-dashed rounded-2xl transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-400'
                }`}
                style={{ borderColor: isDragging ? 'rgb(var(--accent))' : 'var(--glass-border)', background: 'var(--card-bg)' }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}
                >
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'अपलोड करने के लिए यहाँ क्लिक करें या फ़ाइल ड्रैग करें' : 'Click to Upload or Drag & Drop'}
                </div>
                <div className="text-xs font-medium opacity-75" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'फ़ोटो (JPG, PNG) या स्कैन किया हुआ PDF' : 'Photo (PNG, JPG) or Scanned PDF'}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
                {uploadedFile.previewUrl ? (
                  <img
                    src={uploadedFile.previewUrl}
                    alt="Upload preview"
                    className="w-14 h-14 object-cover rounded-xl border shrink-0"
                    style={{ borderColor: 'var(--glass-border)' }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {isHi ? 'फ़ाइल चुनी गई' : 'File Selected'}
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{uploadedFile.name}</div>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {uploadedFile.sizeFormatted} • {uploadedFile.type.toUpperCase()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                  title="Remove and re-upload"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? '🔒 गोपनीयता: अपलोड की गई प्रतियां 48 घंटे बाद स्वतः हटा दी जाती हैं।' : '🔒 Privacy: Uploaded answer sheets are automatically cleared after 48 hours.'}
            </p>
          </div>

          {/* Evaluation Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'मूल्यांकन का तरीका चुनें:' : 'Select Evaluation Mode:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEvalMode('ai')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  evalMode === 'ai'
                    ? 'bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'glass-card-clean hover:border-blue-400'
                }`}
                style={{ borderColor: evalMode === 'ai' ? 'rgb(var(--accent))' : 'var(--glass-border)' }}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  {isHi ? 'AI त्वरित जांच (Instant Check)' : 'Instant AI Check'}
                </div>
                <div className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? '10 सेकंड में विस्तृत अंक एवं लाइन-बाय-लाइन जांच' : 'Quick score in ~10 sec — line-by-line feedback'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEvalMode('deep')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  evalMode === 'deep'
                    ? 'bg-indigo-500/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'glass-card-clean hover:border-indigo-400'
                }`}
                style={{ borderColor: evalMode === 'deep' ? 'rgb(99, 102, 241)' : 'var(--glass-border)' }}
              >
                <div className="absolute -top-2 right-3 text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">
                  {isHi ? 'अधिक सटीक' : 'Deep Mode'}
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Brain className="w-4 h-4 text-indigo-500" />
                  {isHi ? 'AI डीप परीक्षक (Deep AI)' : 'Deep AI Checker'}
                </div>
                <div className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {isHi ? 'हस्तलेखन का गहन विश्लेषण + मॉडल उत्तर तुलना' : 'Deep handwriting reading & model key comparison'}
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}

          {/* Submit Action Row */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3.5 rounded-xl glass-card-clean border text-xs font-bold transition-all flex items-center gap-1.5"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" /> {isHi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !uploadedFile}
              className="flex-1 py-3.5 rounded-2xl btn-primary-clean font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isHi ? 'AI उत्तरपुस्तिका जांच रहा है...' : 'Scanning & Evaluating via Gemini AI...'}</span>
                </>
              ) : evalMode === 'deep' ? (
                <>
                  <Brain className="w-5 h-5" />
                  <span>{isHi ? 'AI डीप चेकर खोलें' : 'Open Deep AI Checker'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isHi ? 'उत्तरपुस्तिका का मूल्यांकन करें' : 'Evaluate Answer Sheet Now'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
