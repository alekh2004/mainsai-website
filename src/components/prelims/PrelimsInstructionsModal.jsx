import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText, Clock, Award, ShieldAlert, CheckCircle2,
  ArrowRight, X, ArrowLeft
} from 'lucide-react';

export function PrelimsInstructionsModal({ config, onConfirmStart, onCancel }) {
  const { language } = useApp();
  const isHi = language === 'hi';
  const [agreed, setAgreed] = useState(true);

  if (!config) return null;

  const isBpsc = config.examType === 'bpsc';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card-clean rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl my-6 space-y-6">

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-black m-0" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'परीक्षण निर्देश (Test Instructions)' : 'Test Instructions'}
              </h3>
              <p className="text-xs font-bold text-blue-600 m-0">
                {config.examType.toUpperCase()} Prelims Mock Test
              </p>
            </div>
          </div>

          <button onClick={onCancel} className="p-2 rounded-xl text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Banner Card */}
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-black text-blue-950 dark:text-blue-200 m-0">
              {config.examType.toUpperCase()} Prelims Test Paper (GS Paper I)
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-blue-200/50">
              <span className="block text-[10px] font-bold text-slate-500">{isHi ? 'कुल प्रश्न' : 'Questions'}</span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-400">{config.questionCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-blue-200/50">
              <span className="block text-[10px] font-bold text-slate-500">{isHi ? 'कुल अंक' : 'Total Marks'}</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">{config.totalMarks} Marks</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-blue-200/50">
              <span className="block text-[10px] font-bold text-slate-500">{isHi ? 'समय सीमा' : 'Duration'}</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{config.durationMinutes} Mins</span>
            </div>
          </div>
        </div>

        {/* Detailed Instructions List (Numbered) */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 m-0">
            {isHi ? 'महत्वपूर्ण नियम एवं निर्देश:' : 'Important Rules & Instructions:'}
          </h4>

          <ol className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium pl-4 list-decimal leading-relaxed">
            <li>
              {isHi
                ? `यह परीक्षा ${config.questionCount} बहुविकल्पीय प्रश्नों (MCQs) की है।`
                : `The test consists of ${config.questionCount} multiple-choice questions.`}
            </li>
            <li>
              {isHi
                ? `प्रत्येक प्रश्न के लिए ${isBpsc ? '1 अंक' : '2 अंक'} निर्धारित हैं।`
                : `Each question carries ${isBpsc ? '1 mark' : '2 marks'}.`}
            </li>
            <li>
              {isHi
                ? `प्रत्येक गलत उत्तर के लिए ${config.negativeMarking} अंक का ऋणात्मक अंकन (Negative Marking) लागू होगा।`
                : `There is a negative marking of ${config.negativeMarking} marks for each wrong answer.`}
            </li>
            <li>
              {isHi
                ? `प्रत्येक प्रश्न में ${isBpsc ? '5 विकल्प (A, B, C, D, E)' : '4 विकल्प (A, B, C, D)'} दिए गए हैं।`
                : `Each question has ${isBpsc ? '5 options (A, B, C, D, E)' : '4 options (A, B, C, D)'}.`}
            </li>
            {isBpsc && (
              <li className="font-bold text-amber-600 dark:text-amber-400">
                {isHi
                  ? `विकल्प (E): "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक" (None of the above / More than one of the above).`
                  : `Option (E) represents "None of the above / More than one of the above".`}
              </li>
            )}
            <li>
              {isHi
                ? `आप परीक्षा के दौरान किसी भी प्रश्न को रिव्यू (Mark for Review) कर सकते हैं और उत्तर बदल सकते हैं।`
                : `You can review and change your answer anytime during the test before submitting.`}
            </li>
            <li>
              {isHi
                ? `समय समाप्त होते ही उत्तर स्वचालित रूप से जमा हो जाएंगे।`
                : `The clock will continue to run. Make sure to complete the test within the given time.`}
            </li>
          </ol>
        </div>

        {/* Agreement Checkbox & Action Button */}
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {isHi ? 'मैंने सभी निर्देशों को ध्यानपूर्वक पढ़ और समझ लिया है।' : 'I have read and understood the instructions.'}
            </span>
          </label>

          <button
            onClick={onConfirmStart}
            disabled={!agreed}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{isHi ? 'परीक्षा आरंभ करें' : 'Start Test'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
