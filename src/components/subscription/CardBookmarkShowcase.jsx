import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CardBookmark, SUBSCRIPTION_PLANS } from './CardBookmark';
import { Crown, Sparkles, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

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
      {/* ── Top Header Navigation Bar with Clear Back Button ── */}
      <div
        className="flex items-center justify-between pb-3 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs sm:text-sm font-extrabold cursor-pointer group shadow-sm active:scale-95"
            style={{
              borderColor: 'var(--glass-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-blue-500" />
            <span>{isHi ? '← प्रोफाइल पर वापस जाएं (Back to Profile)' : '← Back to Profile'}</span>
          </button>
        ) : <div />}

        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
          style={{ background: 'rgba(251,191,36,0.18)', color: '#d97706', border: '1px solid rgba(251,191,36,0.5)' }}
        >
          <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{isHi ? 'UPSC & BPSC तैयारी सदस्यता' : 'UPSC & BPSC AI Plans'}</span>
        </div>
      </div>

      {/* ── Main Section Heading — Prelims + Mains AI Coverage with High Contrast ── */}
      <div className="text-center space-y-2 max-w-2xl mx-auto px-2">
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight m-0 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {isHi
            ? 'UPSC & BPSC संपूर्ण AI तैयारी (प्रारंभिक + मुख्य परीक्षा)'
            : 'UPSC & BPSC Comprehensive AI Preparation (Prelims + Mains)'}
        </h2>
        <p
          className="text-xs sm:text-sm font-semibold m-0 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isHi
            ? 'असीमित प्रीलिम्स CBT टेस्ट, मेन्स AI कॉपियां, 3D नोट्स, टॉपर्स मॉडल उत्तर और शिक्षक समीक्षा।'
            : 'Unlimited Prelims CBT tests, Mains AI script evaluation, 3D notes, model answers & faculty reviews.'}
        </p>
      </div>

      {/* ── 3 Bookmark Cards Grid (Scrolltide Card-Bookmark System) ── */}
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

      {/* ── Bottom Prominent Back Button (Never leaves the user stranded on mobile or desktop) ── */}
      {onBack && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all text-xs sm:text-sm font-extrabold cursor-pointer group shadow-md active:scale-95"
            style={{
              borderColor: 'var(--glass-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-blue-500" />
            <span>{isHi ? '← वापस प्रोफाइल पर जाएं (Back to Profile)' : '← Back to Profile'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
