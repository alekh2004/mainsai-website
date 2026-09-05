import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, HelpCircle, Info, BookOpen } from 'lucide-react';

export function PaperSelector({ onSelectPaper }) {
  const { activeExam, language } = useApp();

  const isUpsc = activeExam === 'upsc';
  const isHi = language === 'hi';

  const upscPapers = [
    {
      id: 'GS 1',
      title: isHi ? 'GS पेपर 1' : 'GS Paper 1',
      desc: isHi ? 'भारतीय विरासत और संस्कृति, इतिहास और भूगोल' : 'Indian Heritage & Culture, History & Geography',
      color: 'border-cyan-500/30'
    },
    {
      id: 'GS 2',
      title: isHi ? 'GS पेपर 2' : 'GS Paper 2',
      desc: isHi ? 'शासन व्यवस्था, संविधान, राजनीति, सामाजिक न्याय' : 'Governance, Constitution, Polity, Social Justice & IR',
      color: 'border-indigo-500/30'
    },
    {
      id: 'GS 3',
      title: isHi ? 'GS पेपर 3' : 'GS Paper 3',
      desc: isHi ? 'तकनीक, आर्थिक विकास, पर्यावरण, सुरक्षा' : 'Technology, Economic Development, Biodiversity, Environment & Security',
      color: 'border-emerald-500/30'
    },
    {
      id: 'GS 4',
      title: isHi ? 'GS पेपर 4' : 'GS Paper 4',
      desc: isHi ? 'नीतिशास्त्र, सत्यनिष्ठा और अभिरुचि' : 'Ethics, Integrity & Aptitude (Case Studies)',
      color: 'border-purple-500/30'
    },
    {
      id: 'Essay',
      title: isHi ? 'निबंध पेपर' : 'Essay Paper',
      desc: isHi ? 'निबंध लेखन (125/250 अंक विषय)' : 'Mains Essay Paper (Section A & B Topics)',
      color: 'border-amber-500/30'
    }
  ];

  const bpscPapers = [
    {
      id: 'GS 1',
      title: isHi ? 'GS पेपर 1 (बिहार विशेष)' : 'GS Paper 1 (Bihar Special)',
      desc: isHi ? 'बिहार आधुनिक इतिहास, संस्कृति एवं सांख्यिकी' : 'Modern Bihar History, Art & Culture, Stat Analysis',
      color: 'border-amber-500/30'
    },
    {
      id: 'GS 2',
      title: isHi ? 'GS पेपर 2 (बिहार व्यवस्था)' : 'GS Paper 2 (Bihar Economy & Polity)',
      desc: isHi ? 'बिहार राजव्यवस्था, अर्थव्यवस्था एवं भूगोल (38 अंक)' : 'Bihar Economy, Geography & Governance Pattern',
      color: 'border-cyan-500/30'
    },
    {
      id: 'Essay',
      title: isHi ? 'निबंध पेपर (300 अंक)' : 'Essay Paper (300 Marks)',
      desc: isHi ? 'बिहार कहावतें एवं समसामयिक निबंध' : 'Bihar Proverbs & Contemporary Essay Topics',
      color: 'border-purple-500/30'
    }
  ];

  const papers = isUpsc ? upscPapers : bpscPapers;

  return (
    <div className="w-full space-y-4 animate-fadeIn max-w-3xl mx-auto">
      
      {/* Title */}
      <div className="text-center space-y-1 mb-6">
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold uppercase tracking-wider">
          {activeExam.toUpperCase()} MAINS
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight m-0">
          {isHi ? 'पेपर चुनें' : 'Select Paper'}
        </h2>
        <p className="text-xs opacity-75 m-0 font-medium">
          {isHi ? 'मूल्यांकन के लिए अपना पेपर चुनें' : 'Choose the paper you want to evaluate'}
        </p>
      </div>

      {/* Paper List */}
      <div className="space-y-3">
        {papers.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPaper(p.id)}
            className={`w-full p-4.5 rounded-2xl glass-card-clean glass-card-hover border ${p.color} transition-all text-left flex items-center justify-between gap-4 group`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-extrabold shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-extrabold m-0 group-hover:text-cyan-400 transition-colors">
                  {p.title}
                </h4>
                <p className="text-xs opacity-70 m-0 leading-relaxed font-medium">
                  {p.desc}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        ))}
      </div>

      {/* Footer Note & Help */}
      <div className="pt-4 space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/10 text-xs opacity-80 text-center font-medium flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{isHi ? 'नोट: आप 24 घंटे में 5 निशुल्क मूल्यांकन कर सकते हैं' : 'Note: You can evaluate up to 5 papers per 24 hours'}</span>
        </div>

        <div className="p-3.5 rounded-xl glass-card-clean border border-white/10 text-xs text-center flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{isHi ? 'किसी भी सहायता के लिए सहायता केंद्र पर जाएं' : 'Need help selecting papers? Visit Help Center'}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </div>
      </div>

    </div>
  );
}
