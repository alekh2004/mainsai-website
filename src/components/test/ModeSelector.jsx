import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Edit3, CheckCircle2, Bot, BookOpen } from 'lucide-react';

export function ModeSelector() {
  const { activeMode, setActiveMode, language } = useApp();
  const isHi = language === 'hi';

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 glass-card-clean rounded-2xl border mb-6"
      style={{ borderColor: 'var(--glass-border)', background: 'var(--card-bg)' }}
    >
      {/* Mode 1: AI Generation Mode */}
      <button
        onClick={() => setActiveMode('ai_gen')}
        className={`w-full sm:w-1/2 p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
          activeMode === 'ai_gen'
            ? 'bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/10'
            : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
        }`}
        style={{ borderColor: activeMode === 'ai_gen' ? 'rgb(var(--accent))' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: activeMode === 'ai_gen' ? 'rgb(var(--accent)/0.2)' : 'rgba(0,0,0,0.05)',
              color: activeMode === 'ai_gen' ? 'rgb(var(--accent))' : 'var(--text-secondary)'
            }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'AI टेस्ट प्रश्न पत्र मोड' : 'AI Test Paper Mode'}
            </div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'पूरा Mains टेस्ट सेट जनरेट करें (5 प्रश्न)' : 'Generate Full Mains Test Paper Set (5 Questions)'}
            </div>
          </div>
        </div>
        {activeMode === 'ai_gen' && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
      </button>

      {/* Mode 2: Admin Manual Question Bank Mode */}
      <button
        onClick={() => setActiveMode('manual_bank')}
        className={`w-full sm:w-1/2 p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
          activeMode === 'manual_bank'
            ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
            : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
        }`}
        style={{ borderColor: activeMode === 'manual_bank' ? 'rgb(245, 158, 11)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: activeMode === 'manual_bank' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.05)',
              color: activeMode === 'manual_bank' ? 'rgb(245, 158, 11)' : 'var(--text-secondary)'
            }}
          >
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {isHi ? 'एडमिन / शिक्षक प्रश्न बैंक' : 'Curated Question Bank'}
            </div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'विस्तृत मॉडल उत्तर एवं डिमांड पॉइंट्स' : 'Pre-loaded Mains Questions + Keys'}
            </div>
          </div>
        </div>
        {activeMode === 'manual_bank' && <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />}
      </button>
    </div>
  );
}
