import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Contrast, Palette, ChevronDown, Check, Globe2, Sparkles, Waves, Grid, Layers } from 'lucide-react';

const THEMES = [
  { id: 'dark',   label: 'Dark',   icon: Moon,     desc: 'Deep neon space' },
  { id: 'medium', label: 'Dusk',   icon: Contrast, desc: 'Blue midnight' },
  { id: 'light',  label: 'Light',  icon: Sun,      desc: 'Bright white' }
];

const ACCENTS = [
  { id: 'cyan',    label: 'Cyan',    hex: '#0891b2' },
  { id: 'blue',    label: 'Blue',    hex: '#2563eb' },
  { id: 'emerald', label: 'Green',   hex: '#059669' },
  { id: 'violet',  label: 'Violet',  hex: '#7c3aed' },
  { id: 'rose',    label: 'Rose',    hex: '#e11d48' },
  { id: 'amber',   label: 'Amber',   hex: '#b45309' }
];

const BG_STYLES = [
  { id: 'world-map', label: 'World Map', icon: Globe2,    desc: 'Neon cyber world map' },
  { id: 'universe',  label: 'Universe',  icon: Sparkles,  desc: 'Nebula orbs' },
  { id: 'aurora',    label: 'Aurora',    icon: Waves,     desc: 'Cyber waves' },
  { id: 'minimal',   label: 'Minimal',   icon: Grid,      desc: 'Clean grid' }
];

const GLASS_LEVELS = [
  { id: 'low',  label: 'Low',    desc: 'Almost none' },
  { id: 'med',  label: 'Medium', desc: 'Balanced' },
  { id: 'high', label: 'High',   desc: 'Full blur' }
];

export function ThemeSwitcher() {
  const {
    theme, setTheme,
    accentColor, setAccentColor,
    bgStyle, setBgStyle,
    glassIntensity, setGlassIntensity
  } = useApp();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentAccent = ACCENTS.find(a => a.id === accentColor) || ACCENTS[0];
  const currentBg     = BG_STYLES.find(b => b.id === bgStyle)   || BG_STYLES[0];
  const glassLevel    = GLASS_LEVELS.find(g => g.id === glassIntensity) || GLASS_LEVELS[1];

  // Slider value mapping
  const sliderValue = glassIntensity === 'low' ? 0 : glassIntensity === 'med' ? 50 : 100;
  const handleSlider = (v) => {
    if (v < 34) setGlassIntensity('low');
    else if (v < 67) setGlassIntensity('med');
    else setGlassIntensity('high');
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card-clean border border-white/60 text-xs font-bold hover:border-white/90 transition-all shadow-sm"
        style={{ color: currentAccent.hex }}
        title="Theme, Colors & Background"
      >
        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/60" style={{ background: currentAccent.hex }} />
        <currentBg.icon className="w-3.5 h-3.5" />
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl p-4 space-y-4 animate-fadeIn z-50 max-h-[90vh] overflow-y-auto custom-scroll"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: `blur(var(--glass-blur)) saturate(var(--glass-saturate))`,
            WebkitBackdropFilter: `blur(var(--glass-blur)) saturate(var(--glass-saturate))`,
            borderColor: 'var(--glass-border)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Appearance Settings
          </div>

          {/* 1. Background Matrix */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Background Style
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {BG_STYLES.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setBgStyle(id)}
                  className="flex items-center gap-2 p-2 rounded-xl border text-left transition-all"
                  style={bgStyle === id
                    ? { color: currentAccent.hex, borderColor: currentAccent.hex, background: `${currentAccent.hex}20` }
                    : { color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold truncate">{label}</div>
                    <div className="text-[9px] opacity-75 truncate">{desc}</div>
                  </div>
                  {bgStyle === id && <Check className="w-3 h-3 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Theme Mode */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Theme Mode
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {THEMES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all"
                  style={theme === id
                    ? { color: currentAccent.hex, borderColor: currentAccent.hex, background: `${currentAccent.hex}20` }
                    : { color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-extrabold">{label}</span>
                  {theme === id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Accent Color */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Accent Color
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {ACCENTS.map(({ id, label, hex }) => (
                <button
                  key={id}
                  onClick={() => setAccentColor(id)}
                  title={label}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl border transition-all"
                  style={accentColor === id
                    ? { borderColor: hex, background: `${hex}20`, borderWidth: 2 }
                    : { borderColor: 'var(--glass-border)' }
                  }
                >
                  <div className="w-5 h-5 rounded-full" style={{ background: hex }} />
                  {accentColor === id && <Check className="w-3 h-3" style={{ color: hex }} />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Glassmorphic Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Layers className="w-3.5 h-3.5" /> Glass Effect Intensity
              </p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ background: `${currentAccent.hex}20`, color: currentAccent.hex }}>
                {glassLevel.label}
              </span>
            </div>

            {/* Slider */}
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sliderValue}
                onChange={e => handleSlider(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${currentAccent.hex} 0%, ${currentAccent.hex} ${sliderValue}%, var(--glass-border) ${sliderValue}%, var(--glass-border) 100%)`
                }}
              />
              <div className="flex justify-between text-[9px] font-bold mt-1" style={{ color: 'var(--text-muted, var(--text-secondary))' }}>
                <span>Low</span><span>Medium</span><span>High</span>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="grid grid-cols-3 gap-1">
              {GLASS_LEVELS.map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setGlassIntensity(id)}
                  className="py-1.5 px-2 rounded-lg border text-center transition-all"
                  style={glassIntensity === id
                    ? { color: currentAccent.hex, borderColor: currentAccent.hex, background: `${currentAccent.hex}20` }
                    : { color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }
                  }
                >
                  <div className="text-[10px] font-extrabold">{label}</div>
                  <div className="text-[8px] opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Status pill */}
          <div
            className="text-center text-[10px] font-bold rounded-lg py-1.5 px-2"
            style={{ background: `${currentAccent.hex}18`, color: currentAccent.hex }}
          >
            {currentBg.label} · {theme === 'dark' ? 'Dark' : theme === 'medium' ? 'Dusk' : 'Light'} · Glass {glassLevel.label}
          </div>
        </div>
      )}
    </div>
  );
}
