import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CardBookmark, SUBSCRIPTION_PLANS } from './CardBookmark';
import { Crown, Sparkles, CheckCircle, ArrowLeft, X } from 'lucide-react';

export function CardBookmarkShowcase({ onSelectPlan, onBack }) {
  const { user, setShowPayModal } = useAuth();
  const { language } = useApp();
  const isHi = language === 'hi';

  const userPlan = user?.plan || 'free';

  const handlePlanClick = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan.id);
    } else if (setShowPayModal) {
      setShowPayModal(true);
    }
  };

  return (
    <div className="w-full space-y-6 my-2">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer group"
            style={{
              borderColor: 'var(--glass-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" style={{ color: 'rgb(var(--accent))' }} />
            <span>{isHi ? 'वापस जाएं (Back)' : 'Back to Profile'}</span>
          </button>
        ) : <div />}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
          style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}
        >
          <Crown className="w-3.5 h-3.5 fill-amber-400" />
          <span>{isHi ? 'सदस्यता योजनाएं' : 'UPSC & BPSC Plans'}</span>
        </div>
      </div>

      {/* Main Heading — Adaptable to Theme with High Contrast */}
      <div className="text-center space-y-2 max-w-2xl mx-auto px-2">
        <h3
          className="text-2xl sm:text-3xl font-black tracking-tight m-0 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {isHi
            ? 'UPSC & BPSC संपूर्ण तैयारी (Prelims + Mains AI)'
            : 'UPSC & BPSC Comprehensive AI Preparation (Prelims + Mains)'}
        </h3>
        <p
          className="text-xs sm:text-sm font-medium m-0 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isHi
            ? 'असीमित प्रीलिम्स CBT टेस्ट, मेन्स AI कॉपियां, 3D नोट्स, टॉपर्स मॉडल उत्तर और शिक्षक समीक्षा।'
            : 'Unlimited Prelims CBT tests, Mains AI script evaluation, 3D notes, model answers & faculty reviews.'}
        </p>
      </div>

      {/* 3 Bookmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch pt-2">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <CardBookmark
            key={plan.id}
            plan={plan}
            isHi={isHi}
            isCurrent={userPlan === plan.id}
            isSelected={plan.popular}
            onSelect={() => handlePlanClick(plan)}
          />
        ))}
      </div>
    </div>
  );
}
