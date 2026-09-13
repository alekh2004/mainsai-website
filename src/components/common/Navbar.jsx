import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Key, Languages, LogOut, ShieldCheck, Lock, Check, X,
  Settings2, Sun, Moon, Contrast, Globe2, Sparkles, Waves, Grid,
  Palette, ChevronDown, Layers
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

const FACULTY_PASSCODE = '1234';

const THEMES = [
  { id: 'dark',   label: 'Dark',  icon: Moon     },
  { id: 'medium', label: 'Dusk',  icon: Contrast },
  { id: 'light',  label: 'Light', icon: Sun      }
];
const ACCENTS = [
  { id: 'cyan',    label: 'Cyan',   hex: '#0891b2' },
  { id: 'blue',    label: 'Blue',   hex: '#2563eb' },
  { id: 'emerald', label: 'Green',  hex: '#059669' },
  { id: 'violet',  label: 'Violet', hex: '#7c3aed' },
  { id: 'rose',    label: 'Rose',   hex: '#e11d48' },
  { id: 'amber',   label: 'Amber',  hex: '#b45309' }
];
const BG_STYLES = [
  { id: 'world-map', label: 'World Map', icon: Globe2   },
  { id: 'universe',  label: 'Universe',  icon: Sparkles },
  { id: 'aurora',    label: 'Aurora',    icon: Waves    },
  { id: 'minimal',   label: 'Minimal',   icon: Grid     }
];

export function Navbar({ onOpenApiKey, onOpenAdmin, onOpenTeacherQueue, onGoHome, onOpenQuestion, onOpenEvaluation }) {
  const { user, logout, switchRole } = useAuth();
  const {
    activeExam, setActiveExam, language, toggleLanguage,
    theme, setTheme, accentColor, setAccentColor, bgStyle, setBgStyle
  } = useApp();
  const isHi = language === 'hi';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const [showFacultyPinModal, setShowFacultyPinModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu]         = useState(false);
  const [showSettingsMenu, setShowSettingsMenu]       = useState(false);
  const [pinInput, setPinInput]                       = useState('');
  const [pinError, setPinError]                       = useState('');
  // Flash animation on exam switch
  const [examFlash, setExamFlash]                     = useState(false);

  const profileRef  = useRef(null);
  const settingsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current  && !profileRef.current.contains(e.target))  setShowProfileMenu(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettingsMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExamSwitch = (exam) => {
    if (exam === activeExam) return;
    setExamFlash(true);
    setActiveExam(exam);
    setTimeout(() => setExamFlash(false), 600);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === FACULTY_PASSCODE || pinInput === 'faculty2025' || pinInput === 'admin') {
      switchRole('teacher');
      setShowFacultyPinModal(false);
      onOpenTeacherQueue();
    } else {
      setPinError(isHi ? 'गलत पासकोड! डिफ़ॉल्ट: 1234' : 'Invalid PIN! Default: 1234');
    }
  };

  const currentAccent = ACCENTS.find(a => a.id === accentColor) || ACCENTS[0];

  return (
    <>
      {/* ── Flash overlay when exam switches ── */}
      {examFlash && (
        <div
          className="fixed inset-0 z-[999] pointer-events-none animate-ping"
          style={{
            background: activeExam === 'upsc'
              ? 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(217,119,6,0.18) 0%, transparent 70%)',
            animation: 'examFlash 0.55s ease-out forwards'
          }}
        />
      )}

      <header className="sticky top-0 z-40 w-full glass-header px-3 lg:px-8 py-2.5" style={{ color: 'var(--text-primary)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* ── Brand ── */}
          <div className="flex items-center gap-2 cursor-pointer select-none shrink-0" onClick={onGoHome}>
            <img
              src="/et_logo.png"
              alt="ET Academy"
              className="et-logo-animate"
              style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '12px' }}
            />
            <div className="hidden sm:block">
              <div className="text-sm font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                ET Academy
              </div>
              <p className="text-[10px] opacity-70 m-0 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'स्मार्ट मूल्यांकन' : 'Smart Evaluation'}
              </p>
            </div>
          </div>

          {/* ── Centre: Exam Switcher with flash ── */}
          <div
            className={`hidden md:flex items-center p-1 glass-card-clean rounded-xl border transition-all duration-300 ${examFlash ? 'scale-105 shadow-lg' : ''}`}
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <button
              onClick={() => handleExamSwitch('upsc')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300 ${
                activeExam === 'upsc' ? 'bg-blue-600 text-white shadow-md scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>🏛️</span>
              <span>UPSC Mains</span>
            </button>
            <button
              onClick={() => handleExamSwitch('bpsc')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300 ${
                activeExam === 'bpsc' ? 'bg-amber-600 text-white shadow-md scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>🦁</span>
              <span>BPSC Mains</span>
            </button>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5">

            {/* Notification Bell */}
            <NotificationBell onOpenQuestion={onOpenQuestion} onOpenEvaluation={onOpenEvaluation} />

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl glass-card-clean border transition-all text-xs font-extrabold flex items-center gap-1"
              style={{ borderColor: 'var(--glass-border)', color: 'rgb(var(--accent))' }}
              title="Switch Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isHi ? 'हिं' : 'EN'}</span>
            </button>

            {/* ── Settings Gear Icon ── */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => { setShowSettingsMenu(o => !o); setShowProfileMenu(false); }}
                className="p-2 rounded-xl glass-card-clean border transition-all hover:border-blue-400 active:scale-95"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
                title="Settings"
              >
                <Settings2 className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
              </button>

              {/* Settings Dropdown */}
              {showSettingsMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl p-4 space-y-4 animate-fadeIn z-50 max-h-[85vh] overflow-y-auto"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Settings2 className="w-3.5 h-3.5" /> Settings
                  </div>

                  {/* ── Appearance ── */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Palette className="w-3 h-3" /> Appearance
                    </p>

                    {/* Background */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-secondary)' }}>Background</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {BG_STYLES.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => setBgStyle(id)}
                            className="flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all"
                            style={bgStyle === id
                              ? { color: currentAccent.hex, borderColor: currentAccent.hex, background: `${currentAccent.hex}20` }
                              : { color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px] font-extrabold truncate">{label}</span>
                            {bgStyle === id && <Check className="w-3 h-3 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-secondary)' }}>Theme</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {THEMES.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => setTheme(id)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all"
                            style={theme === id
                              ? { color: currentAccent.hex, borderColor: currentAccent.hex, background: `${currentAccent.hex}20` }
                              : { color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-extrabold">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-secondary)' }}>Accent Color</p>
                      <div className="flex gap-2 flex-wrap">
                        {ACCENTS.map(({ id, label, hex }) => (
                          <button
                            key={id}
                            onClick={() => setAccentColor(id)}
                            title={label}
                            className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                            style={{
                              background: hex,
                              borderColor: accentColor === id ? '#fff' : 'transparent',
                              boxShadow: accentColor === id ? `0 0 0 2px ${hex}` : 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── API Key — ONLY for Teacher/Admin ── */}
                  {isTeacher && (
                    <>
                      <div className="border-t" style={{ borderColor: 'var(--glass-border)' }} />
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <Key className="w-3 h-3 text-blue-500" /> Gemini API Key
                        </p>
                        <button
                          onClick={() => { setShowSettingsMenu(false); onOpenApiKey(); }}
                          className="w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all hover:border-blue-400"
                          style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                        >
                          <Key className="w-3.5 h-3.5 text-blue-500" />
                          Configure API Key
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile / Account Dropdown ── */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setShowProfileMenu(p => !p); setShowSettingsMenu(false); }}
                  className="flex items-center gap-1.5 p-1.5 px-2 rounded-xl glass-card-clean border text-left text-xs hover:border-blue-400 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--glass-border)' }}
                  title="Account & Role"
                >
                  <span className="text-base leading-none">{user.avatar || (isTeacher ? '👨‍🏫' : '👨‍🎓')}</span>
                  <div className="hidden lg:block">
                    <div className="font-bold leading-tight truncate max-w-[90px]" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold capitalize">
                      {isTeacher ? (isHi ? 'शिक्षक' : 'Teacher') : (isHi ? 'छात्र' : 'Student')}
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 py-2 glass-card-clean rounded-2xl shadow-2xl border animate-fadeIn z-50"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-black opacity-50 tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {isHi ? 'अकाउंट और रोल' : 'Account & Role'}
                    </div>

                    {/* Student Mode */}
                    <button
                      onClick={() => { switchRole('student'); setShowProfileMenu(false); }}
                      className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all ${!isTeacher ? 'font-bold' : 'font-medium'}`}
                      style={!isTeacher ? { color: 'rgb(37,99,235)' } : { color: 'var(--text-primary)' }}
                    >
                      <span className="flex items-center gap-2">
                        <span>👨‍🎓</span>
                        <span>{isHi ? 'छात्र मोड' : 'Student Mode'}</span>
                      </span>
                      {!isTeacher && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    {/* Teacher Mode */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (isTeacher) { onOpenTeacherQueue(); }
                        else { setPinInput(''); setPinError(''); setShowFacultyPinModal(true); }
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all ${isTeacher ? 'font-bold' : 'font-medium'}`}
                      style={isTeacher ? { color: 'rgb(147,51,234)' } : { color: 'var(--text-primary)' }}
                    >
                      <span className="flex items-center gap-2">
                        <span>👨‍🏫</span>
                        <span>{isHi ? 'शिक्षक मोड 🔒' : 'Teacher Mode 🔒'}</span>
                      </span>
                      {isTeacher && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>

                    <div className="my-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />

                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full text-left px-3 py-2.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-all font-bold flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isHi ? 'लॉगआउट' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Faculty PIN Modal */}
      {showFacultyPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-sm glass-card-clean rounded-3xl p-6 border shadow-2xl space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'शिक्षक सत्यापन' : 'Faculty Passcode'}
                </h4>
              </div>
              <button onClick={() => setShowFacultyPinModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-medium m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? '🔒 शिक्षक मोड अनलॉक करने के लिए पिन दर्ज करें:' : '🔒 Enter Faculty PIN to unlock Teacher Mode:'}
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: 1234)"
                className="w-full px-4 py-2.5 rounded-xl glass-input-clean text-center text-sm font-mono tracking-widest font-black"
              />
              {pinError && <div className="text-[11px] font-bold text-rose-500 text-center">{pinError}</div>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFacultyPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl glass-card-clean border text-xs font-bold"
                  style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl btn-primary-clean text-xs font-black">
                  {isHi ? 'अनलॉक करें' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
