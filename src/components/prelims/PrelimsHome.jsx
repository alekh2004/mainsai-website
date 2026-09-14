import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, BookOpen, ChevronRight, Diamond, Lock
} from 'lucide-react';

export function PrelimsHome({ onSelectAction }) {
  const { activeExam, language } = useApp();
  const { user } = useAuth();
  const isHi = language === 'hi';

  const isPro = user?.plan === 'pro' || user?.plan === 'ultimate';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const actionCards = [
    {
      id: 'tests',
      icon: FileText,
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      accentColor: '#3b82f6',
      gradient: 'from-blue-600/10 to-blue-400/5',
      title: isHi ? 'फुल एवं विषयवार टेस्ट' : 'Full & Subject Tests',
      desc: isHi
        ? `${activeExam === 'bpsc' ? 'BPSC' : 'UPSC'} MCQ मॉक — 10 से 150 प्रश्न, नेगेटिव मार्किंग के साथ`
        : `${activeExam === 'bpsc' ? 'BPSC' : 'UPSC'} MCQ mocks — 10 to 150 questions with negative marking`,
      badge: '🎯 Practice Mocks',
      cta: isHi ? 'टेस्ट शुरू करें' : 'Start Test',
      locked: false,
    },
    {
      id: 'pyqs',
      icon: BookOpen,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      accentColor: '#10b981',
      gradient: 'from-emerald-600/10 to-emerald-400/5',
      title: isHi ? 'PYQs वॉल्ट' : 'PYQs Vault',
      desc: isHi
        ? '2015–2026 के हल प्रश्न, विस्तृत व्याख्या सहित'
        : 'Solved PYQs (2015–2026) with detailed explanations',
      badge: '📜 2015–2026',
      cta: isHi ? 'देखें' : 'Explore',
      locked: false,
    },
    {
      id: 'teacher_questions',
      icon: Diamond,
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      accentColor: '#f59e0b',
      gradient: 'from-amber-500/10 to-amber-300/5',
      title: isHi ? '💎 शिक्षक प्रीमियम प्रश्न' : '💎 Teacher Premium Questions',
      desc: isHi
        ? 'अनुभवी शिक्षकों द्वारा क्यूरेट किए गए उच्च-गुणवत्ता प्रश्न सेट — Pro सदस्यों के लिए'
        : 'Hand-curated high-quality question sets by experienced faculty — For Pro members',
      badge: isPro ? '✨ Pro Unlocked' : '🔒 Pro Only',
      cta: isPro ? (isHi ? 'प्रश्न देखें' : 'View Questions') : (isHi ? 'Pro में अपग्रेड करें' : 'Upgrade to Pro'),
      locked: !isPro,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10">

      {/* Hero Banner */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30 p-6 md:p-8 flex flex-col justify-end"
        style={{
          minHeight: '230px',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: 'url(/prelims_hero.png)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(4,7,18,0.85) 0%, rgba(4,7,18,0.45) 55%, rgba(4,7,18,0.1) 100%)' }}
        />
        <div className="relative z-10 space-y-3 max-w-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/50 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
            {activeExam === 'bpsc' ? '🦁 BPSC 72nd CCE Prelims Zone' : '🏛️ UPSC Prelims 2026 Zone'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black m-0 leading-tight text-white drop-shadow-md">
            {activeExam === 'bpsc' ? 'BPSC 72nd CCE Command' : 'UPSC Prelims 2026 Command'}
          </h2>
          <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed m-0 drop-shadow">
            Practice. Analyse. Improve. {' '}
            <span className="text-amber-300 font-extrabold italic">"Discipline today, Brighter tomorrow."</span>
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectAction(card.id)}
              className={`relative overflow-hidden glass-card-clean glass-card-hover p-5 rounded-3xl border cursor-pointer transition-all group text-left ${
                card.locked ? 'opacity-75' : ''
              }`}
              style={{ borderColor: card.locked ? 'rgba(245,158,11,0.3)' : 'var(--glass-border)' }}
            >
              {/* Gradient tint */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 pointer-events-none`} />

              {card.locked && (
                <div className="absolute top-3 right-3 z-10">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
              )}

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl border"
                    style={{ background: `${card.accentColor}18`, color: card.accentColor, borderColor: `${card.accentColor}30` }}
                  >
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-medium mt-1.5 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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

    </div>
  );
}
