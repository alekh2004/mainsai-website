import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Crown, Check, Zap, Sparkles, X, ArrowLeft, ShieldCheck, QrCode, CreditCard, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardBookmark, SUBSCRIPTION_PLANS } from '../subscription/CardBookmark';

export function SubscriptionModal() {
  const { user, upgradePlan, showPayModal, setShowPayModal } = useAuth();
  const { language } = useApp();
  const isHi = language === 'hi';
  
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'free' | 'pro' | 'ultimate'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

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
    }, 1200);
  };

  const activePlanObj = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) || SUBSCRIPTION_PLANS[1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) setShowPayModal(false); }}
    >
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl p-5 sm:p-7 lg:p-8 border border-amber-500/40 shadow-2xl my-6 space-y-6">
        
        {/* Top Header Bar with prominent Back & Close buttons */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <button
            type="button"
            onClick={() => setShowPayModal(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span>{isHi ? 'वापस जाएं (Back)' : 'Back to App'}</span>
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

        {/* Modal Header — Full UPSC & BPSC (Prelims + Mains) Scope */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Unlock Full Access
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white m-0 leading-tight">
            {isHi ? 'UPSC & BPSC संपूर्ण AI तैयारी ' : 'UPSC & BPSC Comprehensive AI '}
            <span className="gradient-text-gold">{isHi ? '(प्रारंभिक + मुख्य परीक्षा)' : '(Prelims + Mains)'}</span>
          </h2>
          <p className="text-xs lg:text-sm text-slate-300 m-0 leading-relaxed">
            {isHi
              ? 'असीमित AI कॉपियां, प्रीलिम्स CBT टेस्ट, 3D नोट्स, टॉपर्स मॉडल उत्तर और शिक्षक समीक्षा।'
              : 'Unlimited AI evaluations, Prelims CBT tests, 3D notes, model answers and faculty script reviews.'}
          </p>
        </div>

        {/* Plans Grid — Scrolltide Card Bookmark Component with Live 3D Ribbons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <CardBookmark
              key={plan.id}
              plan={plan}
              isHi={isHi}
              isCurrent={user?.plan === plan.id}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </div>

        {/* Payment Checkout Box */}
        {selectedPlan !== 'free' && (
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/15 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-gray-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activePlanObj.accentColor }} />
                <span>Selected: <strong className="text-white">{activePlanObj.name}</strong> ({activePlanObj.price} {activePlanObj.period})</span>
              </span>
              <span className="text-amber-400 font-mono">100% Encrypted &amp; Secure SSL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Payment Method Switcher */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">Choose Payment Method:</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'upi' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span>📱 UPI (GPay, PhonePe, Paytm, BHIM)</span>
                    {paymentMethod === 'upi' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'qr' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span>📷 Scan QR Code</span>
                    {paymentMethod === 'qr' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'card' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span>💳 Credit / Debit Card / Netbanking</span>
                    {paymentMethod === 'card' && <CheckCircle className="w-4 h-4 text-purple-400" />}
                  </button>
                </div>
              </div>

              {/* Payment Details Input */}
              <div className="space-y-3">
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Enter UPI ID</label>
                    <input
                      type="text"
                      defaultValue="aspirant@okicici"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                )}

                {paymentMethod === 'qr' && (
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
                    <QrCode className="w-20 h-20 text-white" />
                    <span className="text-[11px] text-gray-400">Scan using any UPI App</span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number (4532 •••• •••• ••••)"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono" />
                      <input type="password" placeholder="CVV" maxLength={3} className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono" />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessing || paySuccess}
                  onClick={handleProcessPayment}
                  className="w-full py-3 rounded-xl gradient-button-primary text-white font-extrabold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <span>Processing Payment Securely...</span>
                  ) : paySuccess ? (
                    <span className="text-emerald-300">✓ Plan Activated Successfully!</span>
                  ) : (
                    <span>Pay {activePlanObj.price} &amp; Activate {activePlanObj.name}</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
