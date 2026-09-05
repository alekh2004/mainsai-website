import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  FileText, CheckCircle2, Clock, Award, Eye, X, PlusCircle,
  ArrowRight, ShieldCheck, Sparkles, BookOpen, UserCheck
} from 'lucide-react';

export function StudentTeacherSubmissionsModal({ isOpen, onClose, onViewCheckedResult, onOpenSubmitModal }) {
  const { user } = useAuth();
  const { teacherQueue = [], evaluations = [], language, activeExam } = useApp();
  const isHi = language === 'hi';

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'reviewed' | 'pending'

  if (!isOpen) return null;

  // Combine submissions from teacherQueue and evaluations that have teacher verification
  const allSubmissions = teacherQueue.map(item => {
    // Check if there is an evaluation record matching this queue item
    const matchingEval = evaluations.find(ev => ev.queueId === item.id || ev.id === item.id);
    return {
      id: item.id,
      paper: item.paper,
      examType: item.examType || activeExam,
      questionTitle: item.questionTitle,
      questionText: item.questionText,
      submittedAt: item.submittedAt,
      status: item.status, // 'pending' | 'reviewed'
      maxMarks: item.maxMarks || 15,
      score: item.score,
      feedback: item.feedback || matchingEval?.overallFeedback,
      uploadedFileBase64: item.uploadedFileBase64 || matchingEval?.uploadedFileBase64,
      uploadedFileName: item.uploadedFileName || matchingEval?.uploadedFileName,
      annotatedFileBase64: item.annotatedFileBase64 || matchingEval?.annotatedFileBase64,
      scoreBreakdown: item.scoreBreakdown || matchingEval?.scoreBreakdown
    };
  });

  const filtered = allSubmissions.filter(item => {
    if (activeFilter === 'reviewed') return item.status === 'reviewed';
    if (activeFilter === 'pending') return item.status === 'pending';
    return true;
  });

  const reviewedCount = allSubmissions.filter(s => s.status === 'reviewed').length;
  const pendingCount = allSubmissions.filter(s => s.status === 'pending').length;

  const handleOpenResult = (item) => {
    onClose();
    onViewCheckedResult?.({
      ...item,
      percentage: item.maxMarks ? Math.round(((item.score || 0) / item.maxMarks) * 100) : 70,
      evaluationType: 'teacher_verified'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl glass-card-clean rounded-3xl p-6 lg:p-8 border shadow-2xl my-6 space-y-6"
        style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl font-bold">
            👨‍🏫
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'शिक्षक द्वारा जांची गई कॉपियां' : 'Teacher Evaluated Answer Sheets'}
              </h3>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 uppercase">
                {isHi ? 'छात्र पोर्टल' : 'Student Submissions'}
              </span>
            </div>
            <p className="text-xs m-0 font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
              {isHi
                ? 'विषय विशेषज्ञ शिक्षकों द्वारा लाल पेन, हाइलाइटर एवं सुधार नोट्स के साथ जांची गई आपकी उत्तरपुस्तिकाएं'
                : 'Your answer sheets evaluated by senior faculty with red-pen annotations, underlines & marks'}
            </p>
          </div>
        </div>

        {/* Stats & Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeFilter === 'all' ? 'bg-purple-500/15 border-purple-500 shadow-sm' : 'border-transparent bg-black/5 dark:bg-white/5'
            }`}
          >
            <div className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{allSubmissions.length}</div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'कुल सबमिशन' : 'Total Requests'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('reviewed')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeFilter === 'reviewed' ? 'bg-emerald-500/15 border-emerald-500 shadow-sm' : 'border-transparent bg-black/5 dark:bg-white/5'
            }`}
          >
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{reviewedCount}</div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? '✅ जांची गई कॉपियां' : 'Checked Copies'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
              activeFilter === 'pending' ? 'bg-amber-500/15 border-amber-500 shadow-sm' : 'border-transparent bg-black/5 dark:bg-white/5'
            }`}
          >
            <div className="text-base font-black text-amber-600 dark:text-amber-400">{pendingCount}</div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? '⏳ प्रतीक्षारत (Pending)' : 'In Evaluation'}
            </div>
          </button>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'उत्तरपुस्तिका स्थिति सूची' : 'Submissions & Verification Status'} ({filtered.length})
          </div>

          {filtered.length === 0 ? (
            <div
              className="text-center py-10 rounded-2xl border text-xs font-medium space-y-3"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              <FileText className="w-10 h-10 mx-auto opacity-30" />
              <p className="m-0">
                {isHi
                  ? 'शिक्षक मूल्यांकन के लिए अभी तक कोई उत्तरपुस्तिका जमा नहीं की गई है।'
                  : 'No answer copies submitted for teacher review in this filter.'}
              </p>
              <button
                type="button"
                onClick={() => { onClose(); onOpenSubmitModal?.(); }}
                className="px-4 py-2 rounded-xl btn-primary-clean text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isHi ? 'उत्तरपुस्तिका जमा करें' : 'Submit Answer for Teacher Review'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  style={{
                    background: item.status === 'reviewed' ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                    borderColor: item.status === 'reviewed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                        {item.paper}
                      </span>
                      {item.status === 'reviewed' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {isHi ? `जांची गई: ${item.score}/${item.maxMarks} अंक` : `Checked: ${item.score}/${item.maxMarks} Marks`}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {isHi ? 'शिक्षक समीक्षा जारी है' : 'Evaluation in Progress'}
                        </span>
                      )}
                      <span className="text-[10px] font-mono opacity-60" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(item.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                      {item.questionTitle}
                    </h4>

                    {item.feedback && (
                      <p className="text-xs font-medium line-clamp-1 italic m-0 opacity-85" style={{ color: 'var(--text-secondary)' }}>
                        💬 <span className="font-bold">Faculty Remark:</span> "{item.feedback}"
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  {item.status === 'reviewed' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenResult(item)}
                      className="px-5 py-2.5 rounded-xl btn-primary-clean text-xs font-black flex items-center gap-2 shadow-md shrink-0 hover:scale-105 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isHi ? 'जांची गई कॉपी देखें' : 'View Checked Copy'}</span>
                    </button>
                  ) : (
                    <div
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl border shrink-0 opacity-75"
                      style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
                    >
                      ⏳ {isHi ? 'समीक्षा का इंतजार करें' : 'Waiting for Faculty'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
