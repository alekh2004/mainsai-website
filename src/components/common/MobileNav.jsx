import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Sparkles, History, BarChart3, User } from 'lucide-react';

export function MobileNav({ activeTab, setActiveTab }) {
  const { language } = useApp();

  const isHi = language === 'hi';

  const tabs = [
    { id: 'home', icon: Home, label: isHi ? 'होम' : 'Home' },
    { id: 'evaluate', icon: Sparkles, label: isHi ? 'मूल्यांकन' : 'Evaluate' },
    { id: 'history', icon: History, label: isHi ? 'इतिहास' : 'History' },
    { id: 'insights', icon: BarChart3, label: isHi ? 'इंसाइट्स' : 'Insights' },
    { id: 'profile', icon: User, label: isHi ? 'प्रोफाइल' : 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-header border-t border-white/10 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-extrabold scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
