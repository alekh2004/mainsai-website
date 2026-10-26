import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Crown, Check, Zap, Sparkles, X, ArrowLeft, ShieldCheck, QrCode, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBSCRIPTION_PLANS } from '../subscription/CardBookmark';

export function SubscriptionModal() {
  const { user, upgradePlan, showPayModal, setShowPayModal, payModalPlan } = useAuth();
  const { language } = useApp();
  const isHi = language === 'hi';

  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Sync with payModalPlan whenever modal opens
  useEffect(() => {
    if (showPayModal && payModalPlan) {
      setSelectedPlan(payModalPlan);
    }
  }, [showPayModal, payModalPlan]);

  // Close on Escape key
  useEffect(() => {
    if (!showPayModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowPayModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPayModal, setShowPayModal]);

  if (!showPayModal) return null;

  const activePlanObj = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) || SUBSCRIPTION_PLANS[1];

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      upgradePlan(selectedPlan, { method: paymentMethod });
      setPaySuccess(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });

      setTimeout(() => {
        setPaySuccess(false);
        setShowPayModal(false);
      }, 1500);
    }, 1100);
  };

  const handleActivateFree = () => {
    upgradePlan('free');
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setShowPayModal(false);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) setShowPayModal(false); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-2xl my-auto space-y-5 max-h-[92vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #0d1326 0%, #080c18 100%)',
          color: '#ffffff',
        }}
      >
        {/* ── 1. Top Header Bar with Prominent Back Button & Close ── */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <button
            type="button"
            onClick={() => setShowPayModal(false)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-extrabold text-white transition-all group cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span>{isHi ? '← वापस जाएं (Back to Plans)' : '← Back to Plans'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPayModal(false)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title={isHi ? 'बंद करें (Close)' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── 2. Header: Prelims + Mains AI Coverage ── */}
        <div className="text-center space-y-1.5 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{isHi ? 'सदस्यता चेकआउट' : 'Subscription Checkout'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white m-0 leading-tight">
            {isHi ? 'UPSC & BPSC संपूर्ण AI तैयारी ' : 'UPSC & BPSC Comprehensive AI '}
            <span className="text-amber-400">{isHi ? '(Prelims + Mains)' : '(Prelims + Mains)'}</span>
          </h2>
        </div>

        {/* ── 3. Plan Switcher Tabs (Never repeat 3 giant cards) ── */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isTabActive = plan.id === selectedPlan;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  isTabActive
                    ? 'shadow-lg border text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                style={isTabActive ? {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  borderColor: plan.accentColor,
                  boxShadow: `0 4px 16px rgba(${plan.accentRgb}, 0.35)`
                } : {}}
              >
                <span className="text-[11px] sm:text-xs font-black truncate max-w-full">
                  {plan.name}
                </span>
                <span className="text-[10px] font-bold" style={{ color: isTabActive ? plan.accentColor : undefined }}>
                  {plan.price}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 4. Selected Plan Summary Card (Compact & High Contrast) ── */}
        <div
          className="p-4 sm:p-5 rounded-2xl border space-y-3"
          style={{
            backgroundColor: '#050814',
            borderColor: activePlanObj.accentColor,
            boxShadow: `0 8px 30px rgba(${activePlanObj.accentRgb}, 0.25)`
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white">
                  {activePlanObj.name}
                </span>
                {activePlanObj.popular && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-black">
                    ★ {isHi ? 'सर्वाधिक लोकप्रिय' : 'Most Popular'}
                  </span>
                )}
                {user?.plan === activePlanObj.id && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-black">
                    ✓ {isHi ? 'सक्रिय' : 'Current'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 m-0 mt-0.5">
                {activePlanObj.description}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-white">
                {activePlanObj.price}
              </span>
              <span className="text-xs font-bold text-slate-300 ml-1">
                {activePlanObj.period}
              </span>
            </div>
          </div>

          {/* Key Inclusions */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 m-0 pt-1">
            {(isHi ? activePlanObj.featuresHi : activePlanObj.featuresEn).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-100 font-medium leading-tight">
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 5. Payment Methods & Checkout ── */}
        {selectedPlan === 'free' ? (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-center">
            <p className="text-xs text-slate-300 m-0">
              {isHi
                ? 'स्टार्टर टियर में आपको 2 AI चेक और अभ्यास बैंक निःशुल्क मिलता है।'
                : 'Starter tier provides 2 AI checks and PYQ vault completely free of cost.'}
            </p>
            <button
              type="button"
              onClick={handleActivateFree}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>{isHi ? 'फ्री ट्रायल सक्रिय करें (Activate Free Trial)' : 'Activate Free Trial'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/15 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activePlanObj.accentColor }} />
                <span>{isHi ? 'भुगतान विधि चुनें:' : 'Choose Payment Method:'}</span>
              </span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted SSL
              </span>
            </div>

            {/* Payment Method Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>📱 UPI / GPay / PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'qr'
                    ? 'bg-amber-500/25 border-amber-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>📷 Scan QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-purple-500/25 border-purple-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>💳 Card / NetBanking</span>
              </button>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Enter UPI ID / VPA</label>
                <input
                  type="text"
                  defaultValue="aspirant@upi"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-white/20 text-center space-y-1.5">
                <QrCode className="w-20 h-20 text-white" />
                <span className="text-[11px] text-slate-300 font-medium">Scan using GPay, PhonePe, Paytm or BHIM</span>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Card Number (4532 •••• •••• ••••)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono" />
                  <input type="password" placeholder="CVV" maxLength={3} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono" />
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessing || paySuccess}
              onClick={handleProcessPayment}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-110 active:scale-98"
              style={{
                background: `linear-gradient(135deg, ${activePlanObj.accentColor}, #1e3a8a)`,
                boxShadow: `0 8px 24px rgba(${activePlanObj.accentRgb}, 0.5)`
              }}
            >
              {isProcessing ? (
                <span>सुरक्षित भुगतान संसाधित हो रहा है (Processing)...</span>
              ) : paySuccess ? (
                <span className="text-emerald-300 font-black">✓ भुगतान सफल! प्लान एक्टिवेट हो गया!</span>
              ) : (
                <span>
                  {isHi
                    ? `${activePlanObj.price} भुगतान करें एवं ${activePlanObj.name} शुरू करें`
                    : `Pay ${activePlanObj.price} & Activate ${activePlanObj.name}`}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── 6. Bottom Prominent Back Button ── */}
        <div className="flex justify-center pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowPayModal(false)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-extrabold text-white transition-all group cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
            <span>{isHi ? '← दूसरे प्लान देखें (Back to All Plans)' : '← Back to All Plans'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
