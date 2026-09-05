import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { BookOpen, ShieldAlert, Image, FileText, Play, PlusCircle, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

export function ManualQuestionBank({ onAttemptQuestion, onOpenAdmin, onGoBack }) {
  const { user } = useAuth();
  const { activeExam, adminQuestions, language } = useApp();
  const isHi = language === 'hi';

  const [filterPaper, setFilterPaper] = useState('all');

  const filteredQuestions = adminQuestions.filter(q => {
    if (q.examType !== activeExam) return false;
    if (filterPaper !== 'all' && q.paper !== filterPaper) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="px-3.5 py-1.5 rounded-xl glass-card-clean border text-xs font-bold flex items-center gap-1.5 transition-all hover:border-blue-400"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" style={{ color: 'rgb(var(--accent))' }} />
            {isHi ? 'मोड चयन पर वापस' : 'Back to Mode Selector'}
          </button>
        )}
        <div className="text-xs font-extrabold" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? `क्यूरेटेड ${activeExam.toUpperCase()} प्रश्न बैंक (${filteredQuestions.length})` : `Curated ${activeExam.toUpperCase()} Question Bank (${filteredQuestions.length})`}
        </div>
      </div>

      {/* Admin Restriction Banner */}
      <div
        className="rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
        style={{
          background: 'rgba(245, 158, 11, 0.08)',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'rgb(245, 158, 11)' }}
          >
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span>{isHi ? 'आधिकारिक शिक्षक / एडमिन प्रश्न बैंक' : 'Official Admin / Teacher Question Bank'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase font-bold">
                {isHi ? 'सत्यापित कुंजी' : 'Verified Key'}
              </span>
            </div>
            <p className="text-xs m-0 font-medium opacity-85" style={{ color: 'var(--text-secondary)' }}>
              {isHi
                ? 'विषय विशेषज्ञों एवं शिक्षकों द्वारा तैयार किए गए प्रश्न एवं आदर्श मॉडल उत्तर कुंजी।'
                : 'Curated by subject experts and faculty with complete model answer keys.'}
            </p>
          </div>
        </div>

        {user?.role === 'admin' ? (
          <button
            onClick={onOpenAdmin}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHi ? 'प्रश्न अपलोड करें (Admin)' : 'Upload Question (Admin)'}</span>
          </button>
        ) : (
          <div
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl border shrink-0"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            🔒 {isHi ? 'अभ्यास हेतु उपलब्ध' : 'Available for Practice'}
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'पेपर अनुसार फिल्टर करें:' : 'Filter Mains Paper:'}
        </span>
        <select
          value={filterPaper}
          onChange={(e) => setFilterPaper(e.target.value)}
          className="px-3.5 py-2 rounded-xl glass-input-clean text-xs font-bold"
        >
          <option value="all">{isHi ? 'सभी प्रश्न पत्र (All Papers)' : 'All Mains Papers'}</option>
          <option value="GS 1">GS 1</option>
          <option value="GS 2">GS 2</option>
          <option value="GS 3">GS 3</option>
          <option value="GS 4">GS 4</option>
          <option value="Essay">{isHi ? 'निबंध (Essay)' : 'Essay'}</option>
        </select>
      </div>

      {/* Question Cards Grid */}
      {filteredQuestions.length === 0 ? (
        <div
          className="text-center py-12 glass-card-clean rounded-3xl border"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>
            {isHi ? 'इस फिल्टर के लिए कोई प्रश्न उपलब्ध नहीं है' : 'No questions found for this filter'}
          </h4>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'अन्य पेपर का चयन करें या AI जनरेटर का उपयोग करें।' : 'Select another paper or use AI Generator.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="glass-card-clean rounded-3xl p-5 lg:p-6 border transition-all space-y-4 shadow-xl hover:border-amber-400"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
                    {q.paper}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
                  >
                    {q.subject}
                  </span>
                  <span className="text-xs font-medium opacity-75" style={{ color: 'var(--text-secondary)' }}>
                    Verified Faculty Model
                  </span>
                </div>

                <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {q.maxMarks} Marks ({q.wordLimit || (activeExam === 'bpsc' ? 400 : 250)} Words)
                </div>
              </div>

              <div>
                <h4 className="text-base font-extrabold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  {q.title}
                </h4>
                <p className="text-xs leading-relaxed m-0 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {q.questionText}
                </p>
              </div>

              {/* Demand Points Checklist */}
              {q.keyDemandPoints && q.keyDemandPoints.length > 0 && (
                <div
                  className="p-3.5 rounded-2xl border space-y-1.5"
                  style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'var(--glass-border)' }}
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {isHi ? '📌 मुख्य मांग बिंदु (Demand Points):' : '📌 Core Demand Points Evaluated:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.keyDemandPoints.map((dp, idx) => (
                      <div key={idx} className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{dp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action: Attempt Question */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onAttemptQuestion(q)}
                  className="py-2.5 px-5 rounded-xl btn-primary-clean text-xs font-extrabold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isHi ? 'उत्तरपुस्तिका अपलोड करें' : 'Attempt & Upload Answer'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
