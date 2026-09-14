import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Target, Sparkles, BookMarked, User, Settings2, X, Sun, Moon, Layers } from 'lucide-react';

const THEMES = [
  { id: 'light',  label: 'Light',  icon: '☀️' },
  { id: 'medium', label: 'Navy',   icon: '🌙' },
  { id: 'dark',   label: 'Dark',   icon: '🌑' },
];

const ACCENTS = [
  { id: 'blue',    hex: '#2563eb', label: 'Blue' },
  { id: 'emerald', hex: '#059669', label: 'Green' },
  { id: 'violet',  hex: '#7c3aed', label: 'Purple' },
  { id: 'rose',    hex: '#e11d48', label: 'Rose' },
  { id: 'amber',   hex: '#b45309', label: 'Amber' },
  { id: 'cyan',    hex: '#0891b2', label: 'Cyan' },
];

export function MobileNav({ activeTab, setActiveTab }) {
  const { language, theme, setTheme, accentColor, setAccentColor, glassIntensity, setGlassIntensity } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  const isHi = language === 'hi';

  const currentAccentHex = ACCENTS.find(a => a.id === accentColor)?.hex || '#2563eb';

  const tabs = [
    { id: 'home',     icon: Home,      label: isHi ? 'होम'      : 'Home' },
    { id: 'prelims',  icon: Target,    label: isHi ? 'प्रीलिम्स' : 'Prelims' },
    { id: 'evaluate', icon: Sparkles,  label: isHi ? 'मेन्स'    : 'Mains' },
    { id: 'history',  icon: BookMarked, label: isHi ? 'इम्प्रूव' : 'Improve' },
    { id: 'profile',  icon: User,      label: isHi ? 'प्रोफाइल' : 'Profile' },
  ];

  const glassLabel = glassIntensity <= 15 ? 'Solid'
    : glassIntensity <= 35 ? 'Light'
    : glassIntensity <= 60 ? 'Medium'
    : glassIntensity <= 80 ? 'Glassy'
    : 'Max';

  return (
    <>
      {/* ── Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all"
                style={{
                  color: isActive ? `rgb(var(--accent))` : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 600,
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px]">{t.label}</span>
              </button>
            );
          })}

          {/* Settings gear */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all"
            style={{ color: showSettings ? `rgb(var(--accent))` : 'var(--text-muted)' }}
          >
            <Settings2 className="w-5 h-5" />
            <span className="text-[9px] font-semibold">Settings</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile Settings Bottom Sheet ── */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Sheet */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t animate-slideUp"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderColor: 'var(--glass-border)',
              maxHeight: '85vh',
              overflowY: 'auto',
              paddingBottom: 'env(safe-area-inset-bottom, 20px)',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-400/40" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" style={{ color: `rgb(var(--accent))` }} />
                <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'सेटिंग्स' : 'Settings'}
                </span>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-xl"
                style={{ background: 'var(--glass-border)', color: 'var(--text-secondary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-5">

              {/* Theme */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  🎨 Theme
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className="py-2.5 rounded-xl border text-xs font-extrabold transition-all"
                      style={theme === t.id
                        ? { background: `${currentAccentHex}22`, borderColor: currentAccentHex, color: currentAccentHex }
                        : { borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }
                      }
                    >
                      <div className="text-lg">{t.icon}</div>
                      <div className="text-[10px] mt-0.5">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  🔵 Accent Color
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {ACCENTS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAccentColor(a.id)}
                      className="aspect-square rounded-full border-4 transition-all"
                      style={{
                        background: a.hex,
                        borderColor: accentColor === a.id ? '#fff' : 'transparent',
                        transform: accentColor === a.id ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: accentColor === a.id ? `0 0 12px ${a.hex}88` : 'none',
                      }}
                      title={a.label}
                    />
                  ))}
                </div>
              </div>

              {/* Glass Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    🌀 Glass Effect
                  </p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                    style={{ background: `${currentAccentHex}22`, color: currentAccentHex }}>
                    {glassLabel} {glassIntensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={glassIntensity}
                  onChange={e => setGlassIntensity(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${currentAccentHex} 0%, ${currentAccentHex} ${glassIntensity}%, rgba(100,116,139,0.25) ${glassIntensity}%, rgba(100,116,139,0.25) 100%)`
                  }}
                />
                <div className="flex justify-between text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                  <span>Solid</span><span>Light</span><span>Medium</span><span>Max</span>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
