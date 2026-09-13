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
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      title: isHi ? 'टेस्ट सीरीज़' : 'Tests',
      desc: isHi ? 'फुल लेंथ एवं शॉर्ट मॉक टेस्ट' : 'Attempt full & topic tests',
      badge: isHi ? '100 प्रश्न' : 'Full & Short'
    },
    {
      id: 'pyqs',
      icon: BookOpen,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: isHi ? 'PYQs वॉल्ट' : 'PYQs',
      desc: isHi ? '2015 - 2025 तक हल किए गए प्रश्न' : 'Previous year papers',
      badge: '2015 - 2025'
    },
    {
      id: 'subject_wise',
      icon: Layers,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      title: isHi ? 'विषयवार अभ्यास' : 'Subject-wise',
      desc: isHi ? 'विषय चुनकर लक्ष्य अभ्यास करें' : 'Practice by subject',
      badge: isHi ? 'सेक्शनल' : 'Sectional'
    },
    {
      id: 'custom_test',
      icon: Settings,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      title: isHi ? 'कस्टम टेस्ट' : 'Custom Test',
      desc: isHi ? 'प्रश्नों की संख्या और विषय स्वयं चुनें' : 'Create your own test',
      badge: isHi ? 'कस्टमाइज' : 'Custom'
    },
    {
      id: 'daily_quiz',
      icon: Zap,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      title: isHi ? 'डेली क्विज़' : 'Daily Quiz',
      desc: isHi ? 'रोजाना 10/20 प्रश्नों का अभ्यास' : '10/20 questions daily',
      badge: isHi ? 'डेली' : 'Daily'
    },
    {
      id: 'performance',
      icon: BarChart2,
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      title: isHi ? 'परफॉरमेंस' : 'Performance',
      desc: isHi ? 'अपनी रैंक, स्कोर एवं गलतियाँ देखें' : 'Track your progress',
      badge: isHi ? 'एनालिटिक्स' : 'Analytics'
    }
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn max-w-4xl mx-auto pb-10">

      {/* ── Top Header & Exam Switcher ── */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/et_logo.png"
            alt="ET Academy"
            className="w-10 h-10 object-contain rounded-xl shadow-sm"
          />
          <div>
            <h1 className="text-base font-black text-slate-900 m-0 leading-none">ET Academy</h1>
            <p className="text-[11px] font-bold text-blue-600 m-0 mt-0.5">Learn • Practice • Succeed</p>
          </div>
        </div>

        {/* UPSC / BPSC Pill Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveExam('upsc')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeExam === 'upsc'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            UPSC
          </button>
          <button
            onClick={() => setActiveExam('bpsc')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeExam === 'bpsc'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BPSC
          </button>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-lg border border-blue-900/20 p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #172554 100%)',
          color: '#ffffff'
        }}
      >
        {/* Parliament Background Overlay */}
        <div
          className="absolute right-0 bottom-0 top-0 w-1/2 bg-cover bg-right opacity-20 pointer-events-none"
          style={{ backgroundImage: 'url(/parliament_hero.jpg)' }}
        />

        <div className="relative z-10 space-y-3 max-w-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-extrabold uppercase tracking-wider">
            {activeExam === 'bpsc' ? '🦁 BPSC 70th Prelims' : '🏛️ UPSC Prelims 2025'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black m-0 leading-tight text-white">
            {activeExam === 'bpsc' ? 'BPSC Prelims Command' : 'UPSC Prelims Command'}
          </h2>
          <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed m-0 opacity-90">
            Practice. Analyse. Improve. <br />
            <span className="text-amber-300 font-extrabold italic">"A step closer to a stronger you."</span>
          </p>
        </div>
      </div>

      {/* ── 6 Core Action Cards Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actionCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectAction(card.id)}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all space-y-3 group text-left"
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${card.iconBg} shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 m-0 leading-normal line-clamp-2">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform pt-1">
                <span>{isHi ? 'प्रारंभ करें' : 'Start'}</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Continue Your Preparation Card ── */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              {isHi ? 'निरंतर अभ्यास' : 'Continue Your Preparation'}
            </div>
            <div className="text-sm font-black text-slate-900">
              {activeExam === 'bpsc' ? 'BPSC 70th Full Length Mock 1' : 'Polity Quick Target Test'}
            </div>
            <div className="text-xs font-medium text-slate-500">20 Questions • 40 Marks</div>
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
