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
      title: isHi ? 'GS पेपर 1 (आधुनिक इतिहास, IR एवं समसामयिक)' : 'GS Paper 1 (Modern History, IR & Current Affairs)',
      desc: isHi ? 'आधुनिक इतिहास, कला एवं संस्कृति, अंतरराष्ट्रीय संबंध (IR) एवं सांख्यिकी' : 'Modern History, Art & Culture, Current Affairs & IR, Stat Analysis',
      color: 'border-amber-500/40'
    },
    {
      id: 'GS 2',
      title: isHi ? 'GS पेपर 2 (राजव्यवस्था, अर्थव्यवस्था, भूगोल एवं साइंस-टेक)' : 'GS Paper 2 (Polity, Economy, Geo & Science Tech)',
      desc: isHi ? 'भारतीय व बिहार राजव्यवस्था, अर्थव्यवस्था, भूगोल एवं विज्ञान व प्रौद्योगिकी' : 'Indian & Bihar Polity, Economy, Geography, Science & Technology',
      color: 'border-cyan-500/40'
    },
    {
      id: 'Essay',
      title: isHi ? 'निबंध पेपर (300 अंक)' : 'Essay Paper (300 Marks)',
      desc: isHi ? 'बिहार कहावतें एवं समसामयिक निबंध लेखन' : 'Bihar Proverbs & Contemporary Essay Topics (300 Marks)',
      color: 'border-purple-500/40'
    }
  ];

  const papers = isUpsc ? upscPapers : bpscPapers;

  return (
    <div className="w-full space-y-4 animate-fadeIn max-w-3xl mx-auto">
      
      {/* Title */}
      <div className="text-center space-y-1.5 mb-6">
        <span className="px-3.5 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider backdrop-blur-md">
          {activeExam.toUpperCase()} MAINS SELECT PAPER
        </span>
        <h2 className="text-2xl font-black tracking-tight m-0 text-slate-900 dark:text-white">
          {isHi ? `${activeExam.toUpperCase()} मेन्स पेपर चुनें` : `${activeExam.toUpperCase()} Mains Select Paper`}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 m-0 font-bold">
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
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-cyan-400 font-black shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-black m-0 text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-cyan-400 transition-colors">
                  {p.title}
                </h4>
                <p className="text-xs font-semibold m-0 leading-relaxed text-slate-600 dark:text-slate-300">
                  {p.desc}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        ))}
      </div>

      {/* Footer Note & Help */}
      <div className="pt-4 space-y-3">
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 text-center font-bold flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
          <span>{isHi ? 'नोट: आप 24 घंटे में 5 निशुल्क मूल्यांकन कर सकते हैं' : 'Note: You can evaluate up to 5 papers per 24 hours'}</span>
        </div>

        <div className="p-3.5 rounded-xl glass-card-clean border border-white/20 text-xs text-center flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isHi ? 'किसी भी सहायता के लिए सहायता केंद्र पर जाएं' : 'Need help selecting papers? Visit Help Center'}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60 text-slate-600 dark:text-slate-400" />
        </div>
      </div>

    </div>
  );
}
