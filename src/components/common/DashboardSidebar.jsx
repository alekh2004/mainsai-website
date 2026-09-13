import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Home, Sparkles, History, BarChart3, User, Target,
  Layers, BookOpen, Crown, ChevronRight, ShieldCheck
} from 'lucide-react';

export function DashboardSidebar({ activeTab, setActiveTab, onOpenFlashcards, onOpenMainsNotes, onOpenSubscription, isTestActive }) {
  const { user } = useAuth();
  const { language } = useApp();
  const isHi = language === 'hi';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isPro = user?.plan === 'pro' || user?.plan === 'ultimate';

  const navItems = [
    { id: 'home',       icon: Home,      label: isHi ? 'होम'             : 'Home',           onClick: () => setActiveTab('home') },
    { id: 'prelims',    icon: Target,    label: isHi ? 'प्रीलिम्स जोन'    : 'Prelims Zone',   onClick: () => setActiveTab('prelims') },
    { id: 'evaluate',   icon: Sparkles,  label: isHi ? 'मुख्य मूल्यांकन'  : 'Mains Evaluate',  onClick: () => setActiveTab('evaluate') },
    { id: 'history',    icon: History,   label: isHi ? 'इतिहास'         : 'History',        onClick: () => setActiveTab('history') },
    { id: 'insights',   icon: BarChart3, label: isHi ? 'इंसाइट्स'      : 'Insights',       onClick: () => setActiveTab('insights') },
    { id: 'flashcards', icon: Layers,    label: isHi ? 'फ्लैशकार्ड'      : 'Flashcards',     onClick: () => onOpenFlashcards?.(), isModal: true },
    { id: 'notes',      icon: BookOpen,  label: isHi ? 'मेन्स नोट्स'     : 'Mains Notes',    onClick: () => onOpenMainsNotes?.(), isModal: true },
    { id: 'profile',    icon: User,      label: isHi ? 'प्रोफाइल'       : 'Profile',        onClick: () => setActiveTab('profile') },
  ];

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 py-4 px-3 overflow-hidden transition-all duration-500 ease-in-out"
      style={{
        width: isTestActive ? '0px' : '256px',
        minWidth: isTestActive ? '0px' : '256px',
        opacity: isTestActive ? 0 : 1,
        pointerEvents: isTestActive ? 'none' : 'auto',
        background: 'rgba(8,12,26,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: isTestActive ? 'none' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Brand */}
      <div className="px-3 pt-1 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent)/0.55))' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-black text-white leading-tight whitespace-nowrap">UPSC / BPSC</div>
            <div className="text-[10px] font-extrabold whitespace-nowrap" style={{ color: 'rgb(var(--accent))' }}>Mains AI</div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-3 pb-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/25 whitespace-nowrap">
          {isHi ? 'नेविगेशन' : 'Navigation'}
        </span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-0.5">
        {navItems.map(({ id, icon: Icon, label, onClick, isModal }) => {
          const isActive = !isModal && activeTab === id;
          return (
            <button
              key={id}
              onClick={onClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group text-left ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              style={isActive ? {
                background: 'linear-gradient(90deg, rgb(var(--accent)/0.22), rgb(var(--accent)/0.04))',
                boxShadow: 'inset 3px 0 0 rgb(var(--accent))',
              } : {}}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-all ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`}
                style={isActive ? { color: 'rgb(var(--accent))' } : {}}
              />
              <span className="truncate">{label}</span>
              {isModal && (
                <ChevronRight className="w-3 h-3 ml-auto opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* Teacher Badge */}
      {isTeacher && (
        <div className="px-3 py-2 rounded-xl border border-purple-500/25 bg-purple-500/10 flex items-center gap-2 mx-1 mb-1">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-extrabold text-purple-300 whitespace-nowrap">
            {isHi ? 'शिक्षक पोर्टल' : 'Faculty Portal'}
          </span>
        </div>
      )}

      {/* Upgrade to Pro */}
      {!isPro ? (
        <button
          onClick={() => onOpenSubscription?.()}
          className="w-full rounded-2xl p-4 text-left group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.16), rgba(249,115,22,0.16))',
            border: '1px solid rgba(234,179,8,0.3)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-300 whitespace-nowrap">
              {isHi ? 'Pro में अपग्रेड करें' : 'Upgrade to Pro'}
            </span>
          </div>
          <p className="text-[10px] text-amber-200/70 font-medium leading-tight m-0">
            {isHi ? 'असीमित AI मूल्यांकन, फ्लैशकार्ड और नोट्स' : 'Unlimited AI evaluation, flashcards & notes'}
          </p>
        </button>
      ) : (
        <div className="px-3 py-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-extrabold text-emerald-300">Pro Active ✓</div>
            <div className="text-[10px] text-emerald-400/70">{isHi ? 'सभी सुविधाएं अनलॉक' : 'All features unlocked'}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
