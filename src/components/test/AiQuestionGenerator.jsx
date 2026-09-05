import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateFullMainsTestPaper, generateInstantAiModelAnswer } from '../../services/geminiService';
import { Sparkles, Sliders, Play, Clock, Award, FileText, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

export function AiQuestionGenerator({ onAttemptQuestion, onGoBack }) {
  const { apiKey } = useAuth();
  const { activeExam, language } = useApp();

  const isUpsc = activeExam === 'upsc';
  const isHi = language === 'hi';

  const [difficulty, setDifficulty] = useState('medium');
  const [paper, setPaper] = useState(isUpsc ? 'GS 1' : 'GS 1');
  const [subject, setSubject] = useState(isUpsc ? 'History & Culture' : 'Modern Bihar History & Freedom Movement');
  const [customSubject, setCustomSubject] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Subject presets per paper per exam
  const subjectPresets = {
    upsc: {
      'GS 1': [
        'Indian History & Culture', 'Modern Indian History', 'Post-Independence India',
        'World History', 'Indian Society & Diversity', 'Geography — Physical',
        'Geography — Human & Economic', 'Disaster Management', 'Urbanization',
        'Women & Empowerment', 'Communalism, Regionalism, Secularism'
      ],
      'GS 2': [
        'Indian Constitution & Polity', 'Parliament & Legislature', 'Judiciary & SC Verdicts',
        'Federal Structure & Centre-State', 'Governance & Transparency', 'Social Justice & Welfare',
        'International Relations & Diplomacy', 'India & Neighbouring Countries',
        'Bilateral & Regional Groupings', 'Welfare Schemes & Policies'
      ],
      'GS 3': [
        'Indian Economy & Growth', 'Agriculture & Food Security', 'Infrastructure Development',
        'Science & Technology', 'Environment & Ecology', 'Biodiversity & Climate Change',
        'Internal Security & Extremism', 'Disaster & Crisis Management',
        'Border Management', 'Cyber Security'
      ],
      'GS 4': [
        'Ethics & Human Values', 'Integrity in Public Life', 'Attitude & Aptitude',
        'Emotional Intelligence', 'Case Studies — Government Officials',
        'Moral Thinkers & Philosophers', 'Corruption & Accountability',
        'Civil Services Values & Code of Conduct', 'Probity in Governance'
      ],
      'Essay': [
        'Philosophy & Ethics', 'Social Issues & Reform', 'Development & Environment',
        'Democracy & Governance', 'Science & Future', 'India at 75 & Beyond',
        'Gender & Society', 'Education & Youth'
      ]
    },
    bpsc: {
      'GS 1': [
        'Modern Bihar History & Freedom Movement', 'Bihar in Ancient Period',
        'Medieval Bihar & Mughal Period', 'Bihar Post-Independence Development',
        'Bihar Geography & Rivers', 'Culture, Heritage & Fairs of Bihar',
        'Bihar Tribes & Society', 'Bihar Statistics & Census',
        'Indian History & Culture (BPSC)', 'Geography of India & World'
      ],
      'GS 2': [
        'Bihar Economy & Budget', 'Bihar Agriculture & Irrigation',
        'Bihar Industry & Investment', 'Bihar Polity & Administration',
        'Panchayati Raj in Bihar', 'Bihar Welfare Schemes & Yojanas',
        'Environment & Ecology (Bihar focus)', 'Science & Technology (Bihar)',
        'Bihar Disaster & Flood Management', 'Indian Constitution & Governance'
      ],
      'Essay': [
        'Bihar Development Vision', 'Agriculture & Rural Bihar',
        'Education & Skill Development', 'Women Empowerment in Bihar',
        'Environmental Challenges in Bihar', 'Democratic Values & Governance',
        'India\'s Foreign Policy', 'Social Harmony & Secularism'
      ]
    }
  };

  const examKey = isUpsc ? 'upsc' : 'bpsc';
  const currentPresets = subjectPresets[examKey]?.[paper] || [];

  const handlePaperChange = (newPaper) => {
    setPaper(newPaper);
    const presets = subjectPresets[examKey]?.[newPaper];
    if (presets && presets.length > 0) {
      setSubject(presets[0]);
    }
    setIsManualMode(false);
    setCustomSubject('');
  };

  const effectiveSubject = isManualMode && customSubject.trim() ? customSubject.trim() : subject;

  
  // Full Mains Test Paper State
  const [testPaper, setTestPaper] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Instant Model Answer View State
  const [instantModelAnswer, setInstantModelAnswer] = useState(null);
  const [isLoadingModelAnswer, setIsLoadingModelAnswer] = useState(false);

  const handleGenerateTestPaper = async () => {
    setIsGenerating(true);
    setInstantModelAnswer(null);
    try {
      const result = await generateFullMainsTestPaper({
        examType: activeExam,
        paper,
      subject: effectiveSubject,
        difficulty,
        language,
        apiKey
      });
      setTestPaper(result);
      setActiveQuestionIndex(0);
    } catch (err) {
      console.error('Error generating full test paper:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchInstantModelAnswer = async (question) => {
    setIsLoadingModelAnswer(true);
    try {
      const res = await generateInstantAiModelAnswer({
        question,
        language,
        apiKey
      });
      setInstantModelAnswer(res);
    } catch (err) {
      console.error('Error fetching model answer:', err);
    } finally {
      setIsLoadingModelAnswer(false);
    }
  };

  const activeQuestion = testPaper?.questions[activeQuestionIndex];

  return (
    <div className="space-y-6">
      
      {/* Controls Card */}
      <div className="glass-card-clean rounded-3xl p-6 lg:p-7 border shadow-xl" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center justify-between mb-5 pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? '🤖 AI मुख्य परीक्षा प्रश्न पत्र जनरेटर' : '🤖 AI Mains Test Paper Set Generator'}
              </h3>
              <p className="text-xs m-0 opacity-75 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'पूरा परीक्षा प्रश्न पत्र सेट (5 प्रश्न) एक क्लिक में जनरेट करें' : 'Generate Full Mains Test Paper Set (5 Questions) in 1-Click'}
              </p>
            </div>
          </div>

          {onGoBack && (
            <button
              onClick={onGoBack}
              className="px-3.5 py-1.5 rounded-xl glass-card-clean border text-xs font-bold flex items-center gap-1.5 hover:border-blue-400 transition-all"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: 'rgb(var(--accent))' }} /> {isHi ? 'वापस' : 'Back'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Difficulty Level Selector */}
          <div>
            <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'कठिनाई स्तर (Difficulty Level)' : 'Difficulty Level'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'hard'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    difficulty === lvl
                      ? (lvl === 'easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md font-black' :
                        lvl === 'medium' ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md font-black' :
                        'bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400 shadow-md font-black')
                      : 'glass-card-clean hover:border-slate-400'
                  }`}
                  style={difficulty !== lvl ? { borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' } : {}}
                >
                  {lvl === 'easy' ? (isHi ? '🟢 आसान' : '🟢 Easy') : lvl === 'medium' ? (isHi ? '🟡 मध्यम' : '🟡 Medium') : (isHi ? '🔴 कठिन' : '🔴 Hard')}
                </button>
              ))}
            </div>
          </div>

          {/* Mains Paper */}
          <div>
            <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'मुख्य परीक्षा प्रश्न पत्र (Paper)' : 'Mains Paper'}
            </label>
            <select
              value={paper}
              onChange={(e) => handlePaperChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-semibold"
            >
              {isUpsc ? (
                <>
                  <option value="GS 1">GS 1 (History, Geography, Indian Society)</option>
                  <option value="GS 2">GS 2 (Polity, Constitution, Governance, IR)</option>
                  <option value="GS 3">GS 3 (Economy, Science, RE, Security)</option>
                  <option value="GS 4">GS 4 (Ethics, Integrity & Case Studies)</option>
                  <option value="Essay">Essay Paper (125 Marks Topic)</option>
                </>
              ) : (
                <>
                  <option value="GS 1">GS 1 (Bihar Modern History, Culture & Stat)</option>
                  <option value="GS 2">GS 2 (Bihar Economy, Polity & Geography)</option>
                  <option value="Essay">Essay Paper (300 Marks Bihar Special)</option>
                </>
              )}
            </select>
          </div>

        </div>

        {/* Subject Focus — Full Width below the 3-col grid */}
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? '📚 विषय / टॉपिक फोकस (Subject Focus)' : '📚 Subject Focus / Topic'}
            </label>
            <button
              type="button"
              onClick={() => { setIsManualMode(!isManualMode); if (isManualMode) setCustomSubject(''); }}
              className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${
                isManualMode
                  ? 'bg-purple-500/20 border-purple-500/60 text-purple-600 dark:text-purple-400'
                  : 'glass-card-clean border-transparent text-slate-500 hover:border-slate-400'
              }`}
            >
              ✏️ {isManualMode ? (isHi ? 'चिप मोड पर वापस जाएं' : 'Back to Chips') : (isHi ? 'अपना टॉपिक टाइप करें' : 'Type Custom Topic')}
            </button>
          </div>

          {/* Selected indicator */}
          <div
            className="px-3.5 py-2 rounded-xl text-xs font-bold border"
            style={{ background: 'rgb(var(--accent)/0.08)', borderColor: 'rgb(var(--accent)/0.4)', color: 'rgb(var(--accent))' }}
          >
            ✅ {isHi ? 'चयनित:' : 'Selected:'} <span className="font-black">{effectiveSubject}</span>
          </div>

          {/* Manual Type Mode */}
          {isManualMode ? (
            <div className="space-y-2">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder={isHi ? 'अपना टॉपिक यहाँ लिखें... जैसे: Quit India Movement, Bihar Famine' : 'Type your custom topic... e.g. Quit India Movement, Bihar Famine 1943'}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input-clean text-xs font-semibold"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
              <p className="text-[10px] font-medium opacity-70" style={{ color: 'var(--text-secondary)' }}>
                💡 {isHi ? 'कोई भी टॉपिक, घटना, व्यक्तित्व, अवधारणा या पॉलिसी लिख सकते हैं।' : 'You can write any event, personality, concept, policy, or historical period.'}
              </p>
            </div>
          ) : (
            /* Preset Chips Grid */
            <div className="flex flex-wrap gap-2">
              {currentPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSubject(preset)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    subject === preset
                      ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm font-black'
                      : 'glass-card-clean border-transparent hover:border-blue-300'
                  }`}
                  style={subject !== preset ? { color: 'var(--text-primary)', borderColor: 'var(--glass-border)' } : {}}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>



        {/* Generate Full Test Paper Set Button */}
        <button
          onClick={handleGenerateTestPaper}
          disabled={isGenerating}
          className="w-full py-3.5 rounded-2xl btn-primary-clean font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.005] transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{isHi ? 'पूरा Mains प्रश्न पत्र सेट (5 प्रश्न) जनरेट हो रहा है...' : 'Generating Full Mains Test Paper Set (5 Questions)...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{isHi ? `पूरा ${activeExam.toUpperCase()} ${paper} टेस्ट सेट जनरेट करें (5 प्रश्न)` : `Generate Full ${activeExam.toUpperCase()} ${paper} Test Paper Set (5 Questions)`}</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Test Paper View */}
      {testPaper && activeQuestion && (
        <div className="glass-card-clean rounded-3xl p-6 lg:p-7 border shadow-2xl space-y-5 animate-fadeIn" style={{ borderColor: 'var(--glass-border)' }}>
          
          {/* Paper Title & Question Nav Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold uppercase">
                {testPaper.testTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold">
                Q {activeQuestionIndex + 1} / {testPaper.questions.length}
              </span>
            </div>

            {/* Question Quick Jump Pills */}
            <div className="flex items-center gap-1.5">
              {testPaper.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveQuestionIndex(idx);
                    setInstantModelAnswer(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    activeQuestionIndex === idx
                      ? 'bg-blue-600 text-white shadow-md font-extrabold'
                      : 'glass-card-clean hover:border-blue-400'
                  }`}
                  style={activeQuestionIndex !== idx ? { borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' } : {}}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Question Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-lg font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                Q{activeQuestionIndex + 1}. {activeQuestion.title}
              </h4>
              <div className="text-xs font-black text-amber-500 shrink-0">
                {activeQuestion.maxMarks} Marks ({activeQuestion.wordLimit} Words)
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border text-sm leading-relaxed font-medium whitespace-pre-line"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              {activeQuestion.questionText}
            </div>
          </div>

          {/* Instant AI Model Answer Trigger Button */}
          <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Zap className="w-4 h-4 text-blue-500" /> {isHi ? 'तुरंत उत्तर देखने का विकल्प (Instant AI Model Answer)' : 'Instant Model Answer View Option'}
              </div>

              <button
                onClick={() => handleFetchInstantModelAnswer(activeQuestion)}
                disabled={isLoadingModelAnswer}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
              >
                {isLoadingModelAnswer ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isHi ? '⚡ तुरंत मॉडल उत्तर (AI Answer) देखें' : '⚡ Get Instant AI Model Answer'}</span>
              </button>
            </div>

            {/* Render Instant Model Answer Key if fetched */}
            {instantModelAnswer && (
              <div className="p-4 rounded-xl border text-xs space-y-2.5 animate-fadeIn" style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'var(--glass-border)' }}>
                <div className="font-extrabold text-sm pb-1 border-b" style={{ color: 'rgb(var(--accent))', borderColor: 'var(--glass-border)' }}>
                  💎 Topper Framework & Model Outline
                </div>

                <div className="space-y-2" style={{ color: 'var(--text-primary)' }}>
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">1. Introduction Approach:</span>
                    <p className="opacity-90 m-0 leading-relaxed">{instantModelAnswer.intro}</p>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">2. Core Body Demand & Dimensions:</span>
                    <ul className="list-disc pl-4 space-y-1 m-0 opacity-90 leading-relaxed">
                      {instantModelAnswer.bodyPoints?.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {instantModelAnswer.dataAndArticles?.length > 0 && (
                    <div>
                      <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5">3. Essential Data, Articles & Cases:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {instantModelAnswer.dataAndArticles.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">4. Conclusion / Way Forward:</span>
                    <p className="opacity-90 m-0 leading-relaxed">{instantModelAnswer.conclusion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row: Attempt Question Button & Navigation */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
                setInstantModelAnswer(null);
              }}
              disabled={activeQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl glass-card-clean border text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <button
              onClick={() => onAttemptQuestion(activeQuestion)}
              className="flex-1 py-3.5 px-6 rounded-2xl btn-primary-clean font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isHi ? 'यह प्रश्न हल करें (Upload Answer Sheet)' : 'Attempt & Upload Answer Sheet'}</span>
            </button>

            <button
              onClick={() => {
                setActiveQuestionIndex(Math.min(testPaper.questions.length - 1, activeQuestionIndex + 1));
                setInstantModelAnswer(null);
              }}
              disabled={activeQuestionIndex === testPaper.questions.length - 1}
              className="px-4 py-2.5 rounded-xl glass-card-clean border text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
