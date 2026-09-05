import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Crown, Settings, LogOut, ChevronRight, Star, TrendingUp, BarChart3, User } from 'lucide-react';

export function ProfileView({ onOpenSubscription, onOpenSettings }) {
  const { user, logout } = useAuth();
  const { evaluations = [], getInsightsData, language } = useApp();

  const isHi = language === 'hi';
  const insights = getInsightsData();
  const totalCount = evaluations.length;
  const avgScore = totalCount > 0 && insights?.avgPct != null ? `${Math.round(insights.avgPct)}%` : '-';
  const highScore = totalCount > 0 && insights?.best
    ? `${insights.best.percentage || Math.round((insights.best.score / insights.best.maxMarks) * 100)}%`
    : '-';

  const isPro = user?.plan === 'pro' || user?.plan === 'ultimate';

  return (
    <div className="w-full space-y-5 animate-fadeIn max-w-2xl mx-auto">

      {/* ── Profile Card ── */}
      <div
        className="rounded-3xl glass-card-clean border overflow-hidden shadow-xl"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {/* Top gradient strip */}
        <div
          className="h-24 w-full"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.3))' }}
        />

        {/* Avatar + Name — overlapping the strip */}
        <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center space-y-3">

          {/* Avatar circle */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-4 shadow-lg shrink-0"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              borderColor: 'var(--glass-border)',
              boxShadow: '0 8px 32px rgba(6,182,212,0.25)',
            }}
          >
            {user?.avatar || '🎓'}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <h3
              className="text-xl font-black m-0 leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {user?.name || (isHi ? 'अभ्यर्थी' : 'Aspirant')}
            </h3>
            <p
              className="text-xs font-medium m-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              {user?.email || user?.phone || (isHi ? 'खाता सक्रिय' : 'Account Active')}
            </p>

            {/* Plan badge */}
            <span
              className="inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
              style={isPro
                ? { background: 'rgba(251,191,36,0.15)', color: '#f59e0b', border: '1px solid rgba(251,191,36,0.4)' }
                : { background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }
              }
            >
              {isPro ? (isHi ? 'Pro अभ्यर्थी' : 'Pro Aspirant') : (isHi ? 'UPSC/BPSC अभ्यर्थी' : 'UPSC & BPSC Aspirant')}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            {[
              { label: isHi ? 'मूल्यांकन' : 'Evaluations', value: totalCount, icon: BarChart3, color: 'rgb(var(--accent))' },
              { label: isHi ? 'औसत स्कोर' : 'Avg Score',   value: avgScore,    icon: TrendingUp, color: '#4ade80' },
              { label: isHi ? 'सर्वोच्च'  : 'Best Score',  value: highScore,   icon: Star,       color: '#fbbf24' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="p-3 rounded-2xl text-center"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                <span
                  className="text-[10px] font-bold uppercase block leading-tight"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {label}
                </span>
                <span
                  className="text-base font-black block"
                  style={{ color }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="space-y-2">

        {/* Subscription */}
        <button
          onClick={onOpenSubscription}
          className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover flex items-center justify-between gap-4 group transition-all"
          style={{ border: '1px solid rgba(251,191,36,0.35)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(251,191,36,0.15)' }}
            >
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-left">
              <div
                className="text-sm font-extrabold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {isHi ? 'सब्सक्रिप्शन प्लान' : 'Subscription Plan'}
              </div>
              <div
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isPro ? (isHi ? 'Pro - सक्रिय' : 'Pro - Active') : (isHi ? 'निःशुल्क - Pro में अपग्रेड करें' : 'Free - Upgrade to Pro')}
              </div>
            </div>
          </div>
          <ChevronRight
            className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-full p-4 rounded-2xl glass-card-clean glass-card-hover flex items-center justify-between gap-4 group transition-all"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(6,182,212,0.12)' }}
            >
              <Settings className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-left">
              <div
                className="text-sm font-extrabold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {isHi ? 'ऐप सेटिंग्स' : 'App Settings'}
              </div>
              <div
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isHi ? 'API Key और थीम सेटिंग्स' : 'API Key & Theme Settings'}
              </div>
            </div>
          </div>
          <ChevronRight
            className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/15">
              <LogOut className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold leading-tight text-rose-500">
                {isHi ? 'साइन आउट' : 'Sign Out'}
              </div>
              <div
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isHi ? 'अकाउंट से लॉग आउट करें' : 'Log out of your account'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 text-rose-400 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>

      {/* ── App version ── */}
      <p
        className="text-center text-[10px] font-medium pb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        UPSC/BPSC Mains AI Evaluator • v2.0 • Powered by Gemini Vision
      </p>

    </div>
  );
}
