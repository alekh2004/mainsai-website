import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText, BookOpen, Layers, Settings, Zap, BarChart2,
  ChevronRight, ArrowRight, Play, Sparkles, Trophy
} from 'lucide-react';

export function PrelimsHome({ onSelectAction }) {
  const { activeExam, setActiveExam, language } = useApp();
  const isHi = language === 'hi';

  const actionCards = [
    {
      id: 'tests',
      icon: FileText,
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      title: isHi ? 'फुल एवं शॉर्ट टेस्ट' : 'Full & Short Tests',
      desc: isHi ? '100 प्रश्न फुल मॉक एवं 10/20/30 प्रश्न शॉर्ट टेस्ट' : 'Full 100 Qs & short practice tests',
      badge: isHi ? '100 Qs' : 'Full & Short'
    },
    {
      id: 'pyqs',
      icon: BookOpen,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      title: isHi ? 'PYQs वॉल्ट' : 'PYQs Vault',
      desc: isHi ? '2015 - 2025 तक व्याख्या सहित हल प्रश्न' : 'Solved PYQs (2015 - 2025) with analysis',
      badge: '2015 - 2025'
    },
    {
      id: 'subject_wise',
      icon: Layers,
      iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      title: isHi ? 'विषयवार अभ्यास' : 'Subject-wise Practice',
      desc: isHi ? 'पॉलिटी, हिस्ट्री, साइंस, बिहार स्पेशल इत्यादि' : 'Target specific subjects',
      badge: isHi ? 'सेक्शनल' : 'Sectional'
    },
    {
      id: 'custom_test',
      icon: Settings,
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      title: isHi ? 'कस्टम टेस्ट' : 'Custom Test',
      desc: isHi ? 'शिक्षक द्वारा अपलोड किए गए टेस्ट एवं कस्टमाइज्ड सेट' : 'User & Faculty uploaded custom sets',
      badge: isHi ? 'कस्टमाइज' : 'Custom'
    },
    {
      id: 'performance',
      icon: BarChart2,
      iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
      title: isHi ? 'परफॉरमेंस' : 'Performance Analytics',
      desc: isHi ? 'अपनी रैंक, स्कोर एवं विस्तृत गलतियाँ देखें' : 'Track accuracy %, score & weak areas',
      badge: isHi ? 'एनालिटिक्स' : 'Analytics'
    }
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10 text-slate-900">

      {/* ── Smooth Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30 p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.85) 60%, rgba(15,23,42,0.95) 100%)',
          color: '#ffffff'
        }}
      >
        {/* Soft Blended Background Image */}
        <div
          className="absolute right-0 bottom-0 top-0 w-3/5 bg-cover bg-right opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'url(/prelims_hero.png)',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        />

        <div className="relative z-10 space-y-3 max-w-lg text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-extrabold uppercase tracking-wider">
              {activeExam === 'bpsc' ? '🦁 BPSC 70th Prelims Zone' : '🏛️ UPSC Prelims 2025 Zone'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black m-0 leading-tight text-white">
            {activeExam === 'bpsc' ? 'BPSC Prelims Practice Hub' : 'UPSC Prelims Practice Hub'}
          </h2>
          <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed m-0 opacity-90">
            Practice. Analyse. Improve. <br />
            <span className="text-amber-300 font-extrabold italic">"Discipline today, Brighter tomorrow."</span>
          </p>
        </div>
      </div>

      {/* ── Action Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {actionCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectAction(card.id)}
              className="glass-card-clean glass-card-hover p-5 rounded-3xl border hover:border-blue-500/50 hover:shadow-md cursor-pointer transition-all space-y-3 group text-left"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${card.iconBg} shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black m-0 group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p className="text-xs font-medium mt-1 m-0 leading-normal line-clamp-2 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center text-xs font-black text-blue-500 group-hover:translate-x-1 transition-transform pt-1">
                <span>{isHi ? 'प्रारंभ करें' : 'Start'}</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Continue Your Preparation Card ── */}
      <div
        className="glass-card-clean p-5 rounded-3xl border shadow-sm flex items-center justify-between gap-4 text-left"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'निरंतर अभ्यास' : 'Continue Your Preparation'}
            </div>
            <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              {activeExam === 'bpsc' ? 'BPSC 70th Full Length Mock 1' : 'Polity Quick Target Test'}
            </div>
            <div className="text-xs font-medium opacity-70" style={{ color: 'var(--text-secondary)' }}>20 Questions • 40 Marks</div>
          </div>
        </div>

        <button
          onClick={() => onSelectAction('tests')}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isHi ? 'शुरू करें' : 'Start'}</span>
        </button>
      </div>

    </div>
  );
}
