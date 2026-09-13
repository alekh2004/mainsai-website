import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText, BookOpen, ChevronRight, Zap, Trophy, Play
} from 'lucide-react';

export function PrelimsHome({ onSelectAction }) {
  const { activeExam, language } = useApp();
  const isHi = language === 'hi';

  const actionCards = [
    {
      id: 'tests',
      icon: FileText,
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      gradient: 'from-blue-600/10 to-blue-400/5',
      accentColor: '#3b82f6',
      title: isHi ? 'फुल एवं विषयवार टेस्ट' : 'Full & Subject Tests',
      desc: isHi ? 'फुल लेंथ मॉक (100 Qs) एवं विषयवार अभ्यास (10-100 प्रश्न) — नेगेटिव मार्किंग के साथ' : 'Full length 100Q mock & subject-wise practice with negative marking',
      badge: isHi ? '🎯 टेस्ट सीरीज़' : '🎯 Test Series',
      cta: isHi ? 'टेस्ट शुरू करें' : 'Start Test',
    },
    {
      id: 'pyqs',
      icon: BookOpen,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      gradient: 'from-emerald-600/10 to-emerald-400/5',
      accentColor: '#10b981',
      title: isHi ? 'PYQs वॉल्ट' : 'PYQs Vault',
      desc: isHi ? '2015 – 2025 तक के हल प्रश्न, विस्तृत व्याख्या सहित — UPSC एवं BPSC दोनों के लिए' : 'Solved PYQs (2015–2025) with detailed explanations for UPSC & BPSC',
      badge: '📜 2015 – 2025',
      cta: isHi ? 'देखें' : 'Explore',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10">

      {/* ── Clear & Bright Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30 p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(4,10,30,0.92) 0%, rgba(14,35,100,0.80) 55%, rgba(4,10,30,0.50) 100%)',
          minHeight: '180px',
          color: '#ffffff'
        }}
      >
        {/* ── Vivid Background Monument ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/prelims_hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            opacity: 0.55,
            filter: 'saturate(1.2) contrast(1.05) brightness(1.1)'
          }}
        />
        {/* ── Left vignette for text legibility ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(4,7,18,0.82) 0%, rgba(4,7,18,0.40) 50%, rgba(4,7,18,0.05) 100%)'
          }}
        />

        <div className="relative z-10 space-y-3 max-w-lg text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/50 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              {activeExam === 'bpsc' ? '🦁 BPSC 70th Prelims Zone' : '🏛️ UPSC Prelims 2025 Zone'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black m-0 leading-tight text-white drop-shadow-md">
            {activeExam === 'bpsc' ? 'BPSC Prelims Command' : 'UPSC Prelims Command'}
          </h2>
          <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed m-0 drop-shadow">
            Practice. Analyse. Improve. <br />
            <span className="text-amber-300 font-extrabold italic">"Discipline today, Brighter tomorrow."</span>
          </p>
        </div>
      </div>

      {/* ── 2 Action Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actionCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectAction(card.id)}
              className={`relative overflow-hidden glass-card-clean glass-card-hover p-6 rounded-3xl border cursor-pointer transition-all group text-left`}
              style={{ borderColor: 'var(--glass-border)' }}
            >
              {/* Subtle gradient tint */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60 pointer-events-none`}
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.iconBg} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl border"
                    style={{ background: `${card.accentColor}18`, color: card.accentColor, borderColor: `${card.accentColor}30` }}>
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black m-0 group-hover:opacity-90 transition-all" style={{ color: 'var(--text-primary)' }}>
                    {card.title}
                  </h3>
                  <p className="text-xs font-medium mt-1.5 m-0 leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
                    {card.desc}
                  </p>
                </div>

                <div
                  className="flex items-center text-xs font-black group-hover:translate-x-1 transition-transform"
                  style={{ color: card.accentColor }}
                >
                  <span>{card.cta}</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Stats Banner ── */}
      <div
        className="glass-card-clean p-4 rounded-2xl border flex items-center justify-around gap-3 text-center"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {[
          { val: '10K+', label: isHi ? 'PYQ प्रश्न' : 'PYQ Questions', color: 'text-blue-500' },
          { val: '2015-25', label: isHi ? 'वर्ष कवरेज' : 'Year Coverage', color: 'text-emerald-500' },
          { val: '-0.33 / -0.66', label: isHi ? 'नेगेटिव मार्किंग' : 'Neg. Marking', color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="space-y-0.5">
            <div className={`text-sm font-black ${stat.color}`}>{stat.val}</div>
            <div className="text-[10px] font-medium opacity-60" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
