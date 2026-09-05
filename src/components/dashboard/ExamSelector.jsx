import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export function ExamSelector({ onSelectExam }) {
  const { activeExam, setActiveExam, language } = useApp();

  const isHi = language === 'hi';

  const handleChoose = (exam) => {
    setActiveExam(exam);
    if (onSelectExam) onSelectExam(exam);
  };

  return (
    <div className="w-full space-y-4 animate-fadeIn">
      
      {/* Title Header */}
      <div className="text-center space-y-1 mb-6">
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold uppercase tracking-wider">
          {isHi ? '🏛️ मुख्य परीक्षा चयन' : '🏛️ Target Exam Selection'}
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight m-0">
          {isHi ? 'परीक्षा चुनें' : 'Select Exam'}
        </h2>
        <p className="text-xs opacity-75 m-0 font-medium">
          {isHi ? 'कृपया वह परीक्षा चुनें जिसका मूल्यांकन करना है' : 'Choose the exam you want to evaluate your answers for'}
        </p>
      </div>

      {/* 3D Exam Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        
        {/* UPSC Mains Card with 3D Emblem */}
        <button
          onClick={() => handleChoose('upsc')}
          className={`w-full p-6 rounded-3xl glass-card-clean glass-card-hover border transition-all text-left flex items-center justify-between gap-5 group relative overflow-hidden ${
            activeExam === 'upsc' ? 'border-cyan-500 shadow-2xl ring-2 ring-cyan-500/30' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-5 z-10">
            {/* 3D Ashoka Emblem Image Badge */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl shadow-amber-500/20 bg-slate-950 shrink-0 emblem-3d-badge">
              <img
                src="/ashoka_emblem_3d.jpg"
                alt="3D Ashoka Emblem UPSC"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold m-0">UPSC Mains</h3>
                {activeExam === 'upsc' && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold">ACTIVE</span>
                )}
              </div>
              <p className="text-xs opacity-80 m-0 leading-relaxed">
                {isHi ? 'संघ लोक सेवा आयोग (Union Public Service Commission)' : 'Union Public Service Commission • GS 1-4 & Essay'}
              </p>
              <div className="text-[11px] font-bold text-cyan-400 pt-1">
                {isHi ? '150 / 250 शब्द सीमा पैटर्न' : '150 & 250 Words Standard Pattern'}
              </div>
            </div>
          </div>

          <ChevronRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 z-10" />
        </button>

        {/* BPSC Mains Card with 3D Emblem */}
        <button
          onClick={() => handleChoose('bpsc')}
          className={`w-full p-6 rounded-3xl glass-card-clean glass-card-hover border transition-all text-left flex items-center justify-between gap-5 group relative overflow-hidden ${
            activeExam === 'bpsc' ? 'border-amber-500 shadow-2xl ring-2 ring-amber-500/30' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-5 z-10">
            {/* 3D Bihar Emblem Badge */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl shadow-amber-500/20 bg-slate-950 shrink-0 emblem-3d-badge">
              <img
                src="/ashoka_emblem_3d.jpg"
                alt="3D Bihar Emblem BPSC"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold m-0">BPSC Mains</h3>
                {activeExam === 'bpsc' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold">ACTIVE</span>
                )}
              </div>
              <p className="text-xs opacity-80 m-0 leading-relaxed">
                {isHi ? 'बिहार लोक सेवा आयोग (Bihar Public Service Commission)' : 'Bihar Public Service Commission • GS 1-2 & Essay'}
              </p>
              <div className="text-[11px] font-bold text-amber-400 pt-1">
                {isHi ? '38 अंक दीर्घ उत्तरीय एवं 7 अंक नोट्स' : '38-Mark Long Answer & 7-Mark Short Notes'}
              </div>
            </div>
          </div>

          <ChevronRight className="w-6 h-6 text-amber-400 group-hover:translate-x-1 transition-all shrink-0 z-10" />
        </button>

      </div>

    </div>
  );
}
