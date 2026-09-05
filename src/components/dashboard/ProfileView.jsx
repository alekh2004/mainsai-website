import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User, Mail, Shield, Crown, Settings, HelpCircle, Info, LogOut, ChevronRight, Bell, Sparkles } from 'lucide-react';

export function ProfileView({ onOpenSubscription, onOpenSettings }) {
  const { user, logout } = useAuth();
  const { language } = useApp();

  const isHi = language === 'hi';

  return (
    <div className="w-full space-y-6 animate-fadeIn max-w-2xl mx-auto">
      
      {/* Student Profile Card */}
      <div className="p-6 rounded-3xl glass-card-clean border border-cyan-500/30 shadow-2xl space-y-5 text-center relative overflow-hidden">
        
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 border-2 border-cyan-400 flex items-center justify-center text-4xl shadow-xl shadow-cyan-500/30 mx-auto">
          {user?.avatar || '👨‍🎓'}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-white m-0">
            {user?.name || 'Rider Alex'}
          </h3>
          <p className="text-xs opacity-75 font-mono m-0">
            {user?.email || 'alexrider@gmail.com'}
          </p>
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold uppercase tracking-wider mt-1">
            {isHi ? 'UPSC एवं BPSC अभ्यर्थी' : 'UPSC & BPSC Aspirant'}
          </span>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-center">
            <span className="text-[10px] opacity-70 block font-bold uppercase">{isHi ? 'कुल मूल्यांकन' : 'Evaluations'}</span>
            <span className="text-base font-extrabold text-white">18</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-center">
            <span className="text-[10px] opacity-70 block font-bold uppercase">{isHi ? 'औसत स्कोर' : 'Avg Score'}</span>
            <span className="text-base font-extrabold text-cyan-400">128<span className="text-[10px] opacity-60">/250</span></span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-center">
            <span className="text-[10px] opacity-70 block font-bold uppercase">{isHi ? 'सर्वोच्च स्कोर' : 'High Score'}</span>
            <span className="text-base font-extrabold text-amber-400">140<span className="text-[10px] opacity-60">/250</span></span>
          </div>
        </div>

      </div>

      {/* Profile Links List */}
      <div className="space-y-2">
        
        <button
          onClick={onOpenSubscription}
          className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover border border-amber-500/30 flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-extrabold">{isHi ? 'सब्सक्रिप्शन प्लान (Pro Plan)' : 'Subscription Plan (Pro Plan)'}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/10 flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-extrabold">{isHi ? 'ऐप सेटिंग्स (Settings)' : 'App Settings'}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={logout}
          className="w-full p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold text-xs flex items-center justify-between gap-4 transition-all"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span>{isHi ? 'साइन आउट (Logout)' : 'Logout Account'}</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
