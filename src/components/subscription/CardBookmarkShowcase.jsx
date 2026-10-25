import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CardBookmark, SUBSCRIPTION_PLANS } from './CardBookmark';
import { Crown, Sparkles, CheckCircle, Zap } from 'lucide-react';

export function CardBookmarkShowcase({ onSelectPlan }) {
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
    <div className="w-full space-y-6 my-4">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Crown className="w-3.5 h-3.5 fill-amber-400" />
          <span>{isHi ? 'सब्सक्रिप्शन प्लान्स' : 'Subscription Plans'}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">
          {isHi ? 'अपनी मेन्स तैयारी के लिए श्रेष्ठ प्लान चुनें' : 'Choose Your Mains AI Preparation Tier'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300/80 m-0 leading-relaxed">
          {isHi
            ? 'असीमित AI मूल्यांकन, 3D नोट्स, टॉपर्स मॉडल कॉपियां और विशेषज्ञ शिक्षक समीक्षा।'
            : 'Unlimited AI evaluation, 3D notes, topper model answers, and expert teacher script reviews.'}
        </p>
      </div>

      {/* 3 Bookmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto items-stretch pt-2">
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
