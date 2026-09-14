import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Clock, HelpCircle, AlertCircle, CheckCircle2, ShieldCheck, Play, Loader2 } from 'lucide-react';


export function PrelimsInstructions({ config, onGoBack, onStartTest, questionsReady, isGenerating, generatedCount }) {
  const { language } = useApp();
  const isHi = language === 'hi';

  const [hasAgreed, setHasAgreed] = useState(false);

  const isBpsc = config.exam === 'bpsc';
  const qCount = config.questionCount || 100;
  const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
  const negMark = isBpsc ? 0.33 : 0.66;
  const totalMarks = Math.round(qCount * posMark);
  const durationMins = Math.round(qCount * 1.2); // 1.2 mins per question

  const instructionsList = isHi ? [
    `यह टेस्ट कुल ${qCount} बहुविकल्पीय (MCQ) प्रश्नों का है।`,
    `प्रत्येक सही उत्तर के लिए ${posMark} अंक दिए जाएंगे (कुल अंक: ${totalMarks})।`,
    `प्रत्येक गलत उत्तर के लिए ${negMark} अंक काटे जाएंगे (ऋणात्मक अंकन / Negative Marking)।`,
    isBpsc
      ? `बीपीएससी पैटर्न के अनुसार प्रत्येक प्रश्न में 5 विकल्प (A, B, C, D, E) होंगे, जहाँ विकल्प (E) "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक" है।`
      : `यूपीएससी पैटर्न के अनुसार प्रत्येक प्रश्न में 4 विकल्प (A, B, C, D) होंगे।`,
    `आप टेस्ट के दौरान कभी भी अपने उत्तर बदल सकते हैं या समीक्षा (Mark for Review) के लिए चिन्हित कर सकते हैं।`,
    `टाइमर स्वचलित रूप से चालू रहेगा। समय समाप्त होने पर टेस्ट अपने आप सबमिट हो जाएगा।`,
    `ईमानदारी बनाए रखें और किसी भी अनुचित साधन का प्रयोग न करें।`
  ] : [
    `The test consists of ${qCount} multiple choice questions (MCQs).`,
    `Each correct answer carries ${posMark} marks (Total Marks: ${totalMarks}).`,
    `There is a negative marking of ${negMark} marks for each wrong answer.`,
    isBpsc
      ? `Each question has five options (A, B, C, D, E) as per BPSC pattern, where Option (E) is "None of these / More than one of the above".`
      : `Each question has four options (A, B, C, D) as per UPSC pattern.`,
    `You can review and change your answer any time during the test before final submission.`,
    `The countdown timer will run automatically. The test will auto-submit when time expires.`,
    `Maintain honesty and avoid any unfair means.`
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn pb-10">

      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack}
          className="p-2 rounded-xl glass-card-clean border text-slate-700 hover:bg-slate-50 transition-all"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black m-0" style={{ color: 'var(--text-primary)' }}>
            {isHi ? 'निर्देश एवं नियम' : 'Test Instructions'}
          </h1>
          <p className="text-xs font-medium opacity-70 m-0" style={{ color: 'var(--text-secondary)' }}>
            {isBpsc ? 'BPSC 70th Prelims Test Series' : 'UPSC Prelims GS Paper I'}
          </p>
        </div>
      </div>

      {/* Main Instructions Card */}
      <div
        className="glass-card-clean p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 text-left"
        style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
      >

        {/* Test Name & Badges */}
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black m-0" style={{ color: 'var(--text-primary)' }}>
              {isBpsc ? 'BPSC 70th Prelims Mock Test' : 'UPSC Prelims Mock Test'}
            </h3>
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-600 text-white">
              {config.testType === 'full_length' ? 'Full Length' : 'Practice Test'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-black">
            <div className="p-2.5 rounded-xl glass-card-clean border border-blue-500/30 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>{qCount} Qs</span>
            </div>
            <div className="p-2.5 rounded-xl glass-card-clean border border-emerald-500/30 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{totalMarks} Marks</span>
            </div>
            <div className="p-2.5 rounded-xl glass-card-clean border border-amber-500/30 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{durationMins} Mins</span>
            </div>
            <div className="p-2.5 rounded-xl glass-card-clean border border-rose-500/30 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>-{negMark} Neg</span>
            </div>
          </div>
        </div>

        {/* Numbered Rules List */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider opacity-60 m-0" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'महत्वपूर्ण निर्देश:' : 'Important Guidelines:'}
          </h4>

          <div className="space-y-3">
            {instructionsList.map((inst, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-black flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{inst}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <label className="flex items-center gap-3 cursor-pointer text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>
              {isHi
                ? 'मैंने सभी निर्देश ध्यानपूर्वक पढ़ लिए हैं और मैं सहमत हूँ।'
                : 'I have read and understood all the instructions.'}
            </span>
          </label>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartTest}
          disabled={!hasAgreed || (!questionsReady && isGenerating)}
          className="w-full py-4 rounded-2xl disabled:opacity-40 font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgb(var(--accent))', color: '#fff' }}
        >
          {isGenerating && !questionsReady ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {isHi
                  ? `AI प्रश्न तैयार हो रहे हैं... (${generatedCount || 0} तैयार)`
                  : `Preparing AI questions... (${generatedCount || 0} ready)`}
              </span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{isHi ? 'मैं तैयार हूँ, टेस्ट शुरू करें' : 'I am ready, Start Test'}</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}
