import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Check, ArrowRight, ShieldCheck, Layers, HelpCircle } from 'lucide-react';

export function PrelimsTestConfig({ onGoBack, onProceedToInstructions }) {
  const { activeExam, setActiveExam, language } = useApp();
  const isHi = language === 'hi';

  const [testType, setTestType] = useState('full_length'); // 'full_length' | 'short' | 'subject_wise' | 'custom'
  const [questionCount, setQuestionCount] = useState(100);
  const [difficulty, setDifficulty] = useState('mixed'); // 'easy' | 'medium' | 'hard' | 'mixed'
  const [selectAllSubjects, setSelectAllSubjects] = useState(true);

  const defaultSubjects = activeExam === 'bpsc'
    ? [
        { id: 'gs1', label: 'General Studies I (Full Syllabus)' },
        { id: 'bihar_hist', label: 'Bihar Special History' },
        { id: 'bihar_geo', label: 'Bihar Special Geography' },
        { id: 'polity', label: 'Polity' },
        { id: 'science', label: 'General Science' },
        { id: 'economy', label: 'Economy & Bihar Survey' },
        { id: 'current', label: 'Current Affairs' },
        { id: 'math', label: 'Math & Reasoning' }
      ]
    : [
        { id: 'gs1', label: 'General Studies I (Full Syllabus)' },
        { id: 'history', label: 'History' },
        { id: 'geography', label: 'Geography' },
        { id: 'polity', label: 'Polity' },
        { id: 'economy', label: 'Economy' },
        { id: 'environment', label: 'Environment' },
        { id: 'science', label: 'Science & Tech' },
        { id: 'current', label: 'Current Affairs' },
        { id: 'art_culture', label: 'Art & Culture' },
        { id: 'csat', label: 'CSAT & Aptitude' }
      ];

  const [selectedSubjects, setSelectedSubjects] = useState(() =>
    defaultSubjects.reduce((acc, sub) => ({ ...acc, [sub.id]: true }), {})
  );

  const toggleSubject = (id) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSelectAll = () => {
    const nextVal = !selectAllSubjects;
    setSelectAllSubjects(nextVal);
    const updated = {};
    defaultSubjects.forEach(sub => { updated[sub.id] = nextVal; });
    setSelectedSubjects(updated);
  };

  const handleTestTypeChange = (type) => {
    setTestType(type);
    if (type === 'full_length') setQuestionCount(100);
    else if (type === 'subject_wise') setQuestionCount(30);
  };

  const handleNext = () => {
    const configData = {
      exam: activeExam,
      testType,
      questionCount,
      difficulty,
      selectedSubjects,
      negMarking: activeExam === 'bpsc' ? 0.33 : 0.66,
      posMarking: activeExam === 'bpsc' ? 1.0 : (testType === 'csat' ? 2.5 : 2.0)
    };
    onProceedToInstructions(configData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn pb-10">

      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 m-0">
            {isHi ? 'टेस्ट कॉन्फ़िगरेशन' : 'Create Your Test'}
          </h1>
          <p className="text-xs font-medium text-slate-500 m-0">
            {isHi ? 'अपनी पसंद का टेस्ट सेट करें और अभ्यास शुरू करें' : 'Choose your preferences and start practicing'}
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-7 text-left text-slate-900">

        {/* Exam Switcher Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveExam('upsc')}
            className={`py-3 rounded-2xl text-xs font-black transition-all border ${
              activeExam === 'upsc'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🏛️ UPSC Prelims
          </button>

          <button
            onClick={() => setActiveExam('bpsc')}
            className={`py-3 rounded-2xl text-xs font-black transition-all border ${
              activeExam === 'bpsc'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🦁 BPSC 70th Prelims
          </button>
        </div>

        {/* 1. Select Test Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
            <h3 className="text-sm font-black text-slate-900 m-0">
              {isHi ? 'टेस्ट प्रकार चुनें' : 'Select Test Type'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'full_length', title: 'Full Length Test', sub: '(Full Syllabus • 100 Qs)' },
              { id: 'subject_wise', title: 'Subject-wise Test', sub: '(Choose specific subjects • 10–100 Qs)' }
            ].map(type => (
              <div
                key={type.id}
                onClick={() => handleTestTypeChange(type.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  testType === type.id
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'glass-card-clean hover:border-slate-300'
                }`}
                style={testType !== type.id ? { borderColor: 'var(--glass-border)' } : {}}
              >
                <div>
                  <div className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{type.title}</div>
                  <div className="text-[11px] font-medium mt-0.5 opacity-70" style={{ color: 'var(--text-secondary)' }}>{type.sub}</div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  testType === type.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                }`}>
                  {testType === type.id && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Number of Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">2</span>
            <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'प्रश्नों की संख्या' : 'Number of Questions'}
            </h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[10, 20, 30, 50, 100].map(count => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all ${
                  questionCount === count
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'glass-card-clean hover:border-blue-400'
                }`}
                style={questionCount !== count ? { borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' } : {}}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Difficulty Level Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">3</span>
            <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'कठिनाई स्तर (Difficulty Level)' : 'Difficulty Level'}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { id: 'mixed', label: isHi ? '⚡ मिक्स्ड (Mixed)' : '⚡ Mixed' },
              { id: 'easy', label: isHi ? '🟢 आसान (Easy)' : '🟢 Easy' },
              { id: 'medium', label: isHi ? '🟡 मध्यम (Medium)' : '🟡 Medium' },
              { id: 'hard', label: isHi ? '🔴 कठिन (Hard)' : '🔴 Hard' },
            ].map(diff => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all ${
                  difficulty === diff.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'glass-card-clean hover:border-blue-400'
                }`}
                style={difficulty !== diff.id ? { borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' } : {}}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Select Subjects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">4</span>
              <h3 className="text-sm font-black text-slate-900 m-0">
                {isHi ? 'विषय चुनें' : 'Select Subject(s)'}
              </h3>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAllSubjects}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>{isHi ? 'सभी चुनें' : 'Select All'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {defaultSubjects.map(sub => {
              const isChecked = !!selectedSubjects[sub.id];
              return (
                <label
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 text-xs font-bold ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50/50 text-slate-900'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{sub.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4. Negative Marking Rule Info */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 font-extrabold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>
              {activeExam === 'bpsc'
                ? 'Negative Marking: -0.33 Marks per wrong answer (Includes 5th Option E)'
                : 'Negative Marking: -0.66 Marks per wrong answer (Auto applied)'}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <span>{isHi ? 'अगला: निर्देश पढ़ें' : 'Next: Read Instructions'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
