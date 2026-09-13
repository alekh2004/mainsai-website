import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, Check, ArrowRight, BookOpen, Clock, Target,
  ShieldCheck, HelpCircle, Layers, Award, Zap
} from 'lucide-react';

const SUBJECT_OPTIONS = {
  upsc: [
    { id: 'full', label: 'General Studies I (Full Syllabus)', labelHi: 'सामान्य अध्ययन I (संपूर्ण पाठ्यक्रम)' },
    { id: 'polity', label: 'Polity & Governance', labelHi: 'राजव्यवस्था एवं शासन' },
    { id: 'history', label: 'Modern & Ancient History', labelHi: 'इतिहास (आधुनिक एवं प्राचीन)' },
    { id: 'geography', label: 'Geography & Environment', labelHi: 'भूगोल एवं पर्यावरण' },
    { id: 'economy', label: 'Indian Economy & Budget', labelHi: 'भारतीय अर्थव्यवस्था एवं बजट' },
    { id: 'scitech', label: 'Science & Technology', labelHi: 'विज्ञान एवं प्रौद्योगिकी' },
    { id: 'ca', label: 'Current Affairs & Schemes', labelHi: 'सामयिकी एवं योजनाएं' },
    { id: 'art', label: 'Art, Culture & Heritage', labelHi: 'कला, संस्कृति एवं विरासत' },
    { id: 'misc', label: 'Miscellaneous & Reports', labelHi: 'विविध एवं प्रमुख रिपोर्ट' }
  ],
  bpsc: [
    { id: 'full', label: 'General Studies I (Full BPSC)', labelHi: 'सामान्य अध्ययन I (संपूर्ण BPSC)' },
    { id: 'bihar_special', label: 'Bihar Special & History', labelHi: 'बिहार विशेष एवं इतिहास' },
    { id: 'polity', label: 'Polity & Bihar Panchayati Raj', labelHi: 'राजव्यवस्था एवं बिहार पंचायती राज' },
    { id: 'history', label: 'Modern History & 1942 Bihar', labelHi: 'आधुनिक इतिहास एवं 1942 बिहार' },
    { id: 'geography', label: 'Geography & Rivers of Bihar', labelHi: 'भूगोल एवं बिहार की नदियां' },
    { id: 'economy', label: 'Bihar Survey & Budget 2024', labelHi: 'बिहार आर्थिक सर्वेक्षण एवं बजट' },
    { id: 'scitech', label: 'General Science (Physics/Chem/Bio)', labelHi: 'सामान्य विज्ञान (भौतिकी/रसायन/जीव)' },
    { id: 'ca', label: 'National & Bihar Current Affairs', labelHi: 'राष्ट्रीय एवं बिहार समसामयिकी' }
  ]
};

export function PrelimsDashboard({ onStartTestInstructions }) {
  const { activeExam, setActiveExam, language } = useApp();
  const isHi = language === 'hi';

  const [testType, setTestType] = useState('full'); // 'full' | 'short' | 'subject' | 'custom'
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedSubjects, setSelectedSubjects] = useState(['full']);
  const [examFlash, setExamFlash] = useState(false);

  const subjects = SUBJECT_OPTIONS[activeExam] || SUBJECT_OPTIONS.upsc;

  const handleExamSwitch = (exam) => {
    if (activeExam === exam) return;
    setExamFlash(true);
    setActiveExam(exam);
    setSelectedSubjects(['full']);
    setTimeout(() => setExamFlash(false), 500);
  };

  const toggleSubject = (id) => {
    if (id === 'full') {
      setSelectedSubjects(['full']);
      return;
    }
    const filtered = selectedSubjects.filter(s => s !== 'full');
    if (filtered.includes(id)) {
      const next = filtered.filter(s => s !== id);
      setSelectedSubjects(next.length ? next : ['full']);
    } else {
      setSelectedSubjects([...filtered, id]);
    }
  };

  const handleStart = () => {
    const config = {
      examType: activeExam,
      testType,
      questionCount,
      subjects: selectedSubjects,
      durationMinutes: Math.max(10, Math.round(questionCount * 1.2)),
      totalMarks: activeExam === 'bpsc' ? questionCount * 1 : questionCount * 2,
      negativeMarking: activeExam === 'bpsc' ? 0.33 : 0.66,
      optionCount: activeExam === 'bpsc' ? 5 : 4
    };
    onStartTestInstructions(config);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── TOP HERO BANNER FOR PRELIMS SECTION ── */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/20 shadow-2xl bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-slate-900/85 to-indigo-950/90 z-10" />
        
        {/* Parliament Background Graphic */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 z-0 scale-105 transition-transform duration-700 hover:scale-100"
          style={{ backgroundImage: `url('/src/assets/parliament_prelims_hero.png')` }}
        />

        <div className="relative z-20 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isHi ? 'UPSC & BPSC प्रिलिम्स टेस्ट सीरीज़' : 'UPSC & BPSC Prelims Test Engine'}</span>
            </div>

            {/* High-Flash Animated Exam Switcher */}
            <div className="flex p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <button
                onClick={() => handleExamSwitch('upsc')}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 ${
                  activeExam === 'upsc'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-300'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span>UPSC Prelims</span>
              </button>
              <button
                onClick={() => handleExamSwitch('bpsc')}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 ${
                  activeExam === 'bpsc'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/50 scale-105 ring-2 ring-amber-300'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span>BPSC Prelims</span>
              </button>
            </div>
          </div>

          <div className={examFlash ? 'animate-pulse opacity-90' : ''}>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight m-0">
              {activeExam.toUpperCase()} Prelims Practice & Analysis
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 font-semibold m-0 mt-1 max-w-2xl">
              "Practice. Analyse. Improve. A step closer to a stronger you."
            </p>
          </div>
        </div>
      </div>

      {/* ── TEST CONFIGURATION FORM (MATCHING USER SCREENSHOT) ── */}
      <div className="glass-card-clean rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl space-y-7">
        
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
          <div>
            <h2 className="text-lg font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'अपना टेस्ट कॉन्फ़िगर करें' : 'Create Your Prelims Test'}
            </h2>
            <p className="text-xs font-medium m-0 opacity-70" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'अपनी प्राथमिकताएं चुनें और अभ्यास शुरू करें' : 'Choose your preferences and start practicing'}
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
            {activeExam.toUpperCase()} Mode
          </span>
        </div>

        {/* STEP 1: Select Test Type */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
            {isHi ? 'टेस्ट का प्रकार चुनें' : 'Select Test Type'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'full', label: isHi ? 'फूल लेंथ टेस्ट' : 'Full Length Test', sub: activeExam === 'bpsc' ? '(150 Qs / 2 Hours)' : '(100 Qs / 2 Hours)' },
              { id: 'short', label: isHi ? 'शॉर्ट प्रैक्टिस टेस्ट' : 'Short Practice Test', sub: '(10 / 20 / 30 Qs)' },
              { id: 'subject', label: isHi ? 'विषयवार टेस्ट' : 'Subject-wise Test', sub: isHi ? '(विशेष विषय चुनें)' : '(Choose specific subjects)' },
              { id: 'custom', label: isHi ? 'कस्टम टेस्ट' : 'Custom Test', sub: isHi ? '(अपना टेस्ट बनाएं)' : '(Create your own test)' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setTestType(type.id)}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
                  testType === type.id
                    ? 'border-blue-600 bg-blue-500/10 shadow-md ring-2 ring-blue-500/30'
                    : 'border-white/40 hover:border-white/80'
                }`}
              >
                <div className="font-extrabold text-xs" style={{ color: testType === type.id ? 'rgb(var(--accent))' : 'var(--text-primary)' }}>
                  {type.label}
                </div>
                <div className="text-[11px] font-medium opacity-70 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {type.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: Number of Questions */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
            {isHi ? 'प्रश्नों की संख्या चुनें' : 'Number of Questions'}
          </label>

          <div className="grid grid-cols-5 gap-2 max-w-xl">
            {[10, 20, 30, 50, 100].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-3 rounded-2xl text-xs font-black border transition-all ${
                  questionCount === num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                    : 'border-white/40 hover:border-white/80'
                }`}
                style={questionCount !== num ? { color: 'var(--text-secondary)' } : {}}
              >
                {num} Qs
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: Select Subject(s) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
              {isHi ? 'विषय का चयन करें' : 'Select Subject(s)'}
            </label>
            <span className="text-[11px] font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedSubjects(['full'])}>
              {isHi ? 'सभी विषय चुनें' : 'Select All / Full'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {subjects.map(sub => {
              const isSelected = selectedSubjects.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubject(sub.id)}
                  className={`p-3.5 rounded-2xl text-left border text-xs font-extrabold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-500/12 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-white/30 hover:border-white/70'
                  }`}
                  style={!isSelected ? { color: 'var(--text-secondary)' } : {}}
                >
                  <span className="truncate">{isHi ? sub.labelHi : sub.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: Negative Marking & Exam Format Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs font-extrabold">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>
              {activeExam === 'bpsc'
                ? (isHi ? 'BPSC पैटर्न: +1.00 अंक | 1/3 (-0.33) ऋणात्मक अंकन | 5 विकल्प (A, B, C, D, E)' : 'BPSC Pattern: +1.00 Mark | 1/3 (-0.33) Negative Marking | 5 Options (A-E)')
                : (isHi ? 'UPSC पैटर्न: +2.00 अंक | 1/3 (-0.66) ऋणात्मक अंकन | 4 विकल्प (A-D)' : 'UPSC Pattern: +2.00 Marks | 1/3 (-0.66) Negative Marking | 4 Options (A-D)')}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-500/20 px-2.5 py-1 rounded-lg">
            Standard Marking Applied
          </span>
        </div>

        {/* START TEST ACTION BUTTON */}
        <button
          onClick={handleStart}
          className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <span>{isHi ? 'निर्देश पढ़ें एवं टेस्ट शुरू करें' : 'Read Instructions & Start Test'}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

      </div>

    </div>
  );
}
