import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRELIMS_QUESTION_BANK } from '../../data/prelimsQuestions';
import { PrelimsTestRunner } from './PrelimsTestRunner';
import {
  Sparkles, Target, Award, BookOpen, Layers, Clock, CheckCircle2,
  ChevronRight, ArrowRight, ShieldCheck, Zap, HelpCircle, Trophy
} from 'lucide-react';

export function PrelimsHub() {
  const { activeExam, setActiveExam, language } = useApp();
  const isHi = language === 'hi';

  const [activeTest, setActiveTest] = useState(null); // { questions, title, examType }
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [examFlash, setExamFlash] = useState(false);

  const handleExamToggle = (exam) => {
    if (exam === activeExam) return;
    setExamFlash(true);
    setActiveExam(exam);
    setTimeout(() => setExamFlash(false), 550);
  };

  const filteredQuestions = PRELIMS_QUESTION_BANK.filter(q => {
    const matchesExam = q.exam === activeExam;
    const matchesSub = selectedSubject === 'All' || q.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    return matchesExam && matchesSub;
  });

  const subjects = activeExam === 'bpsc'
    ? ['All', 'Bihar Special History', 'Bihar Special Geography', 'Polity', 'General Science', 'Bihar Special Economy']
    : ['All', 'Polity', 'History', 'Economy', 'Environment', 'Aptitude & CSAT'];

  const startQuickTest = (subjectFilter = 'All', testTitle = '') => {
    let qSet = PRELIMS_QUESTION_BANK.filter(q => q.exam === activeExam);
    if (subjectFilter !== 'All') {
      qSet = qSet.filter(q => q.subject.toLowerCase().includes(subjectFilter.toLowerCase()));
    }
    if (qSet.length === 0) {
      qSet = PRELIMS_QUESTION_BANK.filter(q => q.exam === activeExam);
    }
    setActiveTest({
      questions: qSet,
      title: testTitle || (isHi ? `${activeExam.toUpperCase()} प्रीलिम्स मॉक टेस्ट` : `${activeExam.toUpperCase()} Prelims Practice Set`),
      examType: activeExam
    });
  };

  if (activeTest) {
    return (
      <PrelimsTestRunner
        questions={activeTest.questions}
        examType={activeTest.examType}
        title={activeTest.title}
        onBack={() => setActiveTest(null)}
      />
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">

      {/* Flash effect overlay */}
      {examFlash && (
        <div
          className="fixed inset-0 z-[999] pointer-events-none animate-ping"
          style={{
            background: activeExam === 'upsc'
              ? 'radial-gradient(ellipse at center, rgba(37,99,235,0.22) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(217,119,6,0.22) 0%, transparent 70%)',
            animation: 'examFlash 0.5s ease-out forwards'
          }}
        />
      )}

      {/* ── 1. HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '230px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/prelims_hero.png)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(4,7,18,0.85) 0%, rgba(4,7,18,0.55) 60%, rgba(4,7,18,0.2) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,7,18,0.7) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full space-y-4" style={{ minHeight: '230px' }}>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}
              >
                {activeExam === 'bpsc' ? '🦁 BPSC 70th Prelims Zone' : '🏛️ UPSC Prelims Zone'}
              </span>
              <span className="text-xs font-bold text-amber-300/80">
                — {isHi ? 'सिविल सेवा परीक्षा की तैयारी में आपका साथी' : 'Your partner in civil services preparation.'}
              </span>
            </div>

            {/* High flash Exam Switcher */}
            <div className="flex items-center p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
              <button
                onClick={() => handleExamToggle('upsc')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1 ${
                  activeExam === 'upsc' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-white/60 hover:text-white'
                }`}
              >
                🏛️ UPSC
              </button>
              <button
                onClick={() => handleExamToggle('bpsc')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1 ${
                  activeExam === 'bpsc' ? 'bg-amber-600 text-white shadow-lg scale-105' : 'text-white/60 hover:text-white'
                }`}
              >
                🦁 BPSC
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-1" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
              {activeExam === 'bpsc' ? 'BPSC 70th Prelims Practice Hub' : 'UPSC Prelims Smart Practice Hub'}
            </h2>
            <p className="text-xs md:text-sm font-medium text-white/80 max-w-xl leading-relaxed">
              {isHi
                ? 'सटीक नकारात्मक अंकन (Negative Marking), पिछले वर्षों के प्रश्न पत्र (PYQ) और विषयवार मॉक टेस्ट के साथ अभ्यास करें।'
                : 'Practice with exact exam negative marking, previous year question vault (PYQs) & subject-wise target test series.'}
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeExam === 'bpsc' ? '150 Questions • +1 / -0.33' : 'GS 1 (100 Qs) & CSAT (80 Qs)'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'तत्काल हल एवं विस्तृत व्याख्या' : 'Instant Solutions & Explanations'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. QUICK TEST MODE CARDS ── */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          {isHi ? 'अभ्यास मोड चुनें' : 'Select Practice Mode'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Full Mock Test */}
          <div
            onClick={() => startQuickTest('All', isHi ? `${activeExam.toUpperCase()} संपूर्ण मॉक टेस्ट` : `${activeExam.toUpperCase()} Full Mock Test`)}
            className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.1))' }}
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {isHi ? 'फुल लेंथ' : 'Full Length'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black m-0 group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'फुल लेंथ स्पीड टेस्ट' : 'Full Length Speed Test'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed text-white/70">
                {isHi ? 'परीक्षा जैसा टाइमर और नेगेटिव मार्किंग पैटर्न' : 'Exam-like timer, cut-off evaluation & negative marking'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform pt-1">
              <span>{isHi ? 'टेस्ट शुरू करें' : 'Start Test Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Subject Wise Sectional Quiz */}
          <div
            onClick={() => startQuickTest(selectedSubject === 'All' ? 'Polity' : selectedSubject, isHi ? `${selectedSubject} विषयवार टेस्ट` : `${selectedSubject} Sectional Test`)}
            className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.1))' }}
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {isHi ? 'विषयवार' : 'Sectional'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black m-0 group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'विषयवार लक्ष्य अभ्यास' : 'Subject Sectional Practice'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed text-white/70">
                {isHi ? 'कमजोर विषयों को मजबूत करने के लिए सेक्शनल टेस्ट' : 'Focus on individual subjects (Polity, History, Science, Bihar Special)'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform pt-1">
              <span>{isHi ? 'विषय चुनें' : 'Choose Subject'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* PYQ Vault */}
          <div
            onClick={() => startQuickTest('All', isHi ? `${activeExam.toUpperCase()} पिछले वर्षों के प्रश्न (PYQ)` : `${activeExam.toUpperCase()} PYQ Vault`)}
            className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 cursor-pointer group space-y-3"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.1))' }}
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                PYQ 2015-2024
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black m-0 group-hover:text-amber-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'PYQ सॉल्व्ड वॉल्ट' : 'Previous Year Questions Vault'}
              </h4>
              <p className="text-xs font-medium mt-1 m-0 leading-relaxed text-white/70">
                {isHi ? 'विस्तृत व्याख्या के साथ पिछले 10 वर्षों के प्रश्न' : 'Solved PYQs with in-depth official explanation & analysis'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform pt-1">
              <span>{isHi ? 'PYQ हल करें' : 'Solve PYQs'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. SUBJECT FILTER TABS & QUESTION PREVIEW LIST ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'विषयवार प्रश्न बैंक' : 'Subject Question Bank'}
          </h4>
          <span className="text-xs font-bold text-blue-400">
            {filteredQuestions.length} {isHi ? 'प्रश्न उपलब्ध' : 'Questions Available'}
          </span>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedSubject === sub
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'glass-card-clean border border-white/20 hover:border-white/40 opacity-70 hover:opacity-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Question Cards List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center rounded-3xl glass-card-clean border border-dashed border-white/30">
              <HelpCircle className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <p className="text-xs font-bold opacity-60">
                {isHi ? 'इस विषय में कोई प्रश्न नहीं मिला।' : 'No questions found for this subject filter.'}
              </p>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => startQuickTest(q.subject, `${q.subject} Target Quiz`)}
                className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/60 space-y-3 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {q.subject}
                    </span>
                    <span className="text-white/40">{q.year}</span>
                  </div>
                  <span className="text-amber-400 font-extrabold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {q.difficulty}
                  </span>
                </div>

                <p className="text-xs font-extrabold leading-relaxed m-0 group-hover:text-blue-300 transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                  {idx + 1}. {isHi ? q.questionHi : q.questionEn}
                </p>

                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 pt-1">
                  <span>4 Options • Negative Marking</span>
                  <span className="text-blue-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {isHi ? 'अभ्यास करें' : 'Practice Question'} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
