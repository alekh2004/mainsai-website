import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Crown, Check, Zap, Sparkles, X, ShieldCheck, QrCode, CreditCard, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function SubscriptionModal() {
  const { user, upgradePlan, showPayModal, setShowPayModal } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'free' | 'pro' | 'ultimate'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 lg:p-8 border border-amber-500/40 shadow-2xl my-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setShowPayModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Unlock Full Access
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white m-0">
            Choose Your <span className="gradient-text-gold">Mains Preparation</span> Plan
          </h2>
          <p className="text-xs lg:text-sm text-gray-300 m-0">
            Get unlimited Gemini AI evaluations, PYQ bank access, and expert teacher script reviews.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Plan 1: Free Tier */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            selectedPlan === 'free'
              ? 'bg-white/10 border-white/40 shadow-xl'
              : 'bg-slate-900/50 border-white/10 opacity-70 hover:opacity-100'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Starter</span>
                {user.plan === 'free' && <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/30 text-gray-300 font-bold">Current</span>}
              </div>
              <div className="text-2xl font-extrabold text-white">Free Trial</div>
              <div className="text-xs text-gray-400">2 Instant AI Check passes included</div>
              <ul className="space-y-2 text-xs text-gray-300 pt-2 list-none pl-0">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 2 AI Answer Evaluations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Easy & Medium PYQs</li>
                <li className="flex items-center gap-2 text-gray-500"><X className="w-4 h-4" /> No Teacher Verification</li>
              </ul>
            </div>
            <button
              onClick={() => setSelectedPlan('free')}
              className="mt-6 w-full py-2.5 rounded-xl border border-white/20 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all"
            >
              Select Free
            </button>
          </div>

          {/* Plan 2: Pro Scholar (Popular) */}
          <div className={`p-5 rounded-2xl border relative transition-all flex flex-col justify-between ${
            selectedPlan === 'pro'
              ? 'bg-gradient-to-b from-cyan-950/80 to-slate-950 border-cyan-500 shadow-2xl shadow-cyan-500/20 scale-[1.02]'
              : 'bg-slate-900/50 border-white/10 hover:border-cyan-500/40'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              Most Popular Aspirant Choice
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase">Pro Scholar</span>
                {user.plan === 'pro' && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-300 font-bold">Active Plan</span>}
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white">₹499</span>
                <span className="text-xs text-gray-400"> / month</span>
              </div>
              <div className="text-xs text-cyan-300 font-medium">Unlimited Gemini AI Checks</div>
              <ul className="space-y-2 text-xs text-gray-200 pt-2 list-none pl-0">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Unlimited AI Answer Checks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Full Hard-Level Question Vault</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> 2 Teacher Check Passes / Mo</li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlan('pro')}
              className={`mt-6 w-full py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                selectedPlan === 'pro'
                  ? 'gradient-button-primary text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              Choose Pro Scholar (₹499)
            </button>
          </div>

          {/* Plan 3: Ultimate Mentor */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            selectedPlan === 'ultimate'
              ? 'bg-gradient-to-b from-amber-950/80 to-slate-950 border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900/50 border-white/10 hover:border-amber-500/40'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Ultimate Mentor</span>
                {user.plan === 'ultimate' && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold">Active Plan</span>}
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white">₹999</span>
                <span className="text-xs text-gray-400"> / month</span>
              </div>
              <div className="text-xs text-amber-300 font-medium">AI + 10 Teacher Reviews</div>
              <ul className="space-y-2 text-xs text-gray-200 pt-2 list-none pl-0">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Unlimited Gemini AI Checks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> 10 Teacher Script Reviews / Mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Priority Admin Question Access</li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlan('ultimate')}
              className={`mt-6 w-full py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                selectedPlan === 'ultimate'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              Choose Ultimate (₹999)
            </button>
          </div>

        </div>

        {/* Payment Checkout Box */}
        {selectedPlan !== 'free' && (
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/15 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-gray-300">
              <span>Payment Gateway Checkout</span>
              <span className="text-amber-400 font-mono">100% Encrypted & Secure SSL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Payment Method Switcher */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">Choose Payment Method:</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      paymentMethod === 'upi' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span>📱 UPI (GPay, PhonePe, Paytm, BHIM)</span>
                    {paymentMethod === 'upi' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      paymentMethod === 'qr' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span>📷 Scan QR Code</span>
                    {paymentMethod === 'qr' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
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
                  <div className="text-center p-3 rounded-xl bg-slate-900 border border-white/10">
                    <QrCode className="w-16 h-16 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[11px] text-gray-400 font-mono">Scan via GPay / PhonePe App</span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number (4321 •••• •••• 9876)"
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="MM/YY" className="px-3 py-1.5 rounded-xl glass-input text-xs font-mono" />
                      <input type="password" placeholder="CVV" className="px-3 py-1.5 rounded-xl glass-input text-xs font-mono" />
                    </div>
                  </div>
                )}

                {paySuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Payment Successful! Plan Activated 🎉
                  </div>
                ) : (
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Payment...' : `Pay ₹${selectedPlan === 'pro' ? 499 : 999} & Unlock Instant Access`}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
