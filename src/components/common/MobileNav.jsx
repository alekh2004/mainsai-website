import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home, Target, Sparkles, Layers, BookOpen,
  BookMarked, BarChart3, User
} from 'lucide-react';

export function MobileNav({
  activeTab,
  setActiveTab,
  onOpenFlashcards,
  onOpenMainsNotes,
  isTestActive
}) {
  const { language } = useApp();
  const isHi = language === 'hi';

  if (isTestActive) return null;

  const tabs = [
    {
      id: 'home',
      icon: Home,
      label: isHi ? 'होम' : 'Home',
      onClick: () => setActiveTab('home'),
      isTab: true,
    },
    {
      id: 'prelims',
      icon: Target,
      label: isHi ? 'प्रीलिम्स' : 'Prelims',
      onClick: () => setActiveTab('prelims'),
      isTab: true,
    },
    {
      id: 'evaluate',
      icon: Sparkles,
      label: isHi ? 'मेन्स' : 'Mains',
      onClick: () => setActiveTab('evaluate'),
      isTab: true,
    },
    {
      id: 'flashcards',
      icon: Layers,
      label: isHi ? 'फ्लैशकार्ड' : 'Flashcards',
      onClick: () => onOpenFlashcards?.(),
      isModal: true,
    },
    {
      id: 'notes',
      icon: BookOpen,
      label: isHi ? 'नोट्स' : 'Notes',
      onClick: () => onOpenMainsNotes?.(),
      isModal: true,
    },
    {
      id: 'history',
      icon: BookMarked,
      label: isHi ? 'इम्प्रूवमेंट' : 'Improve',
      onClick: () => setActiveTab('history'),
      isTab: true,
    },
    {
      id: 'insights',
      icon: BarChart3,
      label: isHi ? 'इंसाइट्स' : 'Insights',
      onClick: () => setActiveTab('insights'),
      isTab: true,
    },
    {
      id: 'profile',
      icon: User,
      label: isHi ? 'प्रोफाइल' : 'Profile',
      onClick: () => setActiveTab('profile'),
      isTab: true,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'var(--glass-border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.14)',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      }}
    >
      <div className="flex items-center justify-between px-1 py-1 overflow-x-auto no-scrollbar max-w-lg mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.isTab && activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={t.onClick}
              className="relative flex-1 min-w-[44px] flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer select-none active:scale-95"
              style={{
                color: isActive ? 'rgb(var(--accent))' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                background: isActive ? 'rgb(var(--accent)/0.12)' : 'transparent',
              }}
              title={t.label}
              aria-label={t.label}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
                style={isActive ? { color: 'rgb(var(--accent))' } : {}}
              />
              <span className="text-[9px] font-bold leading-tight tracking-tight whitespace-nowrap">
                {t.label}
              </span>
              {isActive && (
                <span
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'rgb(var(--accent))',
                    boxShadow: '0 0 8px rgb(var(--accent))',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
