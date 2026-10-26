import React, { useState } from 'react';
import { Check, Sparkles, Crown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { RibbonCanvas3D } from './RibbonCanvas3D';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Starter Tier',
    tag: 'STARTER TIER®',
    title: 'Start Free.',
    price: '₹0',
    priceNum: 0,
    period: '2 AI Check Passes',
    description: 'BPSC & UPSC प्रारंभिक उत्तर लेखन एवं PYQ अभ्यास।',
    ribbonQuoteHi: 'सीखो • अभ्यास करो • शुरुआत करें',
    ribbonQuoteEn: 'Start Free. Build Momentum.',
    accentColor: '#3b82f6',
    accentRgb: '59, 130, 246',
    themeName: 'blue',
    dotIndex: 0,
    badgeHi: 'फ्री ट्रायल',
    badgeEn: 'Free Starter',
    featuresHi: [
      '2 AI Answer Evaluations (Marks & Breakdown)',
      'BPSC & UPSC Easy & Medium PYQs Vault',
      'Instant Weak-area Diagnostic Scorecard',
      'Hindi & English Answer Checking Support'
    ],
    featuresEn: [
      '2 AI Answer Checks (Instant Marks & Breakdown)',
      'Easy & Medium PYQ Question Bank',
      'Diagnostic Weakness Assessment',
      'Bilingual Hindi & English Support'
    ],
    ctaHi: 'निःशुल्क शुरू करें (Start Free)',
    ctaEn: 'Start Free Trial (₹0)',
  },
  {
    id: 'pro',
    name: 'Pro Scholar',
    tag: 'PRO SCHOLAR®',
    title: '+240% Growth',
    price: '₹499',
    priceNum: 499,
    period: '/ month',
    description: 'असीमित AI चेक + 2 शिक्षक समीक्षा पास + मॉडल उत्तर।',
    ribbonQuoteHi: 'हर टेस्ट के साथ निरंतर रैंक सुधार',
    ribbonQuoteEn: 'Growth that compounds every test.',
    accentColor: '#f97316',
    accentRgb: '249, 115, 22',
    themeName: 'orange',
    dotIndex: 1,
    popular: true,
    badgeHi: 'सर्वाधिक लोकप्रिय',
    badgeEn: 'Most Popular',
    featuresHi: [
      'असीमित (Unlimited) Gemini AI मूल्यांकन (Prelims + Mains)',
      '2 शिक्षक समीक्षा पास प्रति माह (Faculty Script Review)',
      'Full Hard-Level Questions & Ethics Case Studies',
      'AI Model Answers, Topper Insights & Roadmaps'
    ],
    featuresEn: [
      'Unlimited Gemini Vision AI Answer Evaluations',
      '2 Faculty Script Review Passes / Month',
      'Full Hard-Level PYQ Vault & Ethics Cases',
      'Model Answers & Continuous Progress Tracking'
    ],
    ctaHi: 'Pro Scholar अपग्रेड करें (₹499)',
    ctaEn: 'Upgrade to Pro (₹499)',
  },
  {
    id: 'ultimate',
    name: 'Ultimate Mentor',
    tag: 'ULTIMATE MENTOR®',
    title: 'All Access.',
    price: '₹999',
    priceNum: 999,
    period: '/ month',
    description: '10 शिक्षक समीक्षाएं + 1-on-1 मेंटरशिप कॉल + सभी टेस्ट।',
    ribbonQuoteHi: 'परिणाम आपके समर्पण की गवाही देगा',
    ribbonQuoteEn: 'The rank speaks before we do.',
    accentColor: '#a855f7',
    accentRgb: '168, 85, 247',
    themeName: 'purple',
    dotIndex: 2,
    badgeHi: 'टॉप रैंकर्स चॉइस',
    badgeEn: 'Top Choice',
    featuresHi: [
      'असीमित AI + 10 शिक्षक विस्तृत कॉपियां (Faculty Evaluation)',
      'Priority Faculty Queue & Real Test Series Access',
      '1-on-1 Mentor Guidance & Strategy Call',
      'Full Access to 3D Flashcards, Mains Notes & Premium Hub'
    ],
    featuresEn: [
      'Unlimited AI Checks + 10 Faculty Script Reviews',
      'Priority Faculty Review Queue & Real Test Series',
      '1-on-1 Mentor Strategy Guidance Session',
      'Complete Access to Flashcards, Notes & Study Hub'
    ],
    ctaHi: 'Ultimate में शामिल हों (₹999)',
    ctaEn: 'Join Ultimate (₹999)',
  }
];

export function CardBookmark({
  plan,
  isHi,
  isCurrent,
  isSelected,
  onSelect,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // SVG Normalized Path for Bookmark Tab & Notch (viewBox 0 0 100 100)
  const bookmarkPathD = `
    M 0 8
    Q 0 5.5, 2.5 5.5
    L 28 5.5
    C 32 5.5, 34 2, 38 0
    L 94 0
    Q 100 0, 100 5
    L 100 83
    C 98 85, 94.5 87, 92 89
    L 92 95.5
    Q 92 100, 87 100
    L 4 100
    Q 0 100, 0 95.5
    Z
  `;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      className={`group relative flex flex-col justify-between cursor-pointer transition-all duration-400 ease-out select-none pt-3 ${
        isSelected
          ? 'scale-[1.02] -translate-y-2'
          : isHovered
            ? 'scale-[1.01] -translate-y-1'
            : 'scale-100 translate-y-0'
      }`}
      style={{
        minHeight: '530px',
        filter: isSelected || isHovered
          ? `drop-shadow(0 20px 40px rgba(${plan.accentRgb}, 0.35))`
          : 'drop-shadow(0 12px 28px rgba(0,0,0,0.45))',
      }}
    >
      {/* ── Background SVG Silhouette — Solid Opaque Obsidian Body (Zero Bleed / 100% Contrast) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id={`bg-grad-${plan.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c1122" />
            <stop offset="60%" stopColor="#080c18" />
            <stop offset="100%" stopColor="#050811" />
          </linearGradient>

          <radialGradient id={`glow-${plan.id}`} cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor={`rgba(${plan.accentRgb}, ${isHovered || isSelected ? 0.35 : 0.14})`} />
            <stop offset="60%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        {/* Solid Opaque Background */}
        <path
          d={bookmarkPathD}
          fill={`url(#bg-grad-${plan.id})`}
        />

        {/* Ambient Top Glow Overlay */}
        <path
          d={bookmarkPathD}
          fill={`url(#glow-${plan.id})`}
        />

        {/* Outer Stroke Border (illuminates on hover / selected) */}
        <path
          d={bookmarkPathD}
          fill="none"
          stroke={
            isSelected
              ? plan.accentColor
              : isHovered
                ? plan.accentColor
                : 'rgba(255, 255, 255, 0.22)'
          }
          strokeWidth={isSelected || isHovered ? '0.85' : '0.5'}
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-300"
        />
      </svg>

      {/* ── Top Bookmark Tab Header (Solid Badges, 100% Readability) ── */}
      <div className="relative z-10 pt-2 px-5 flex items-center justify-between">
        {/* Left shoulder badge */}
        <div className="flex items-center gap-2">
          {plan.popular && (
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-lg text-black bg-amber-400 flex items-center gap-1 border border-amber-300"
            >
              ★ {isHi ? 'सर्वाधिक लोकप्रिय' : 'Most Popular'}
            </span>
          )}
          {isCurrent && (
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-lg text-black bg-emerald-400 flex items-center gap-1 border border-emerald-300"
            >
              ✓ {isHi ? 'सक्रिय प्लान' : 'Current Plan'}
            </span>
          )}
          {!plan.popular && !isCurrent && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/20"
            >
              {isHi ? plan.badgeHi : plan.badgeEn}
            </span>
          )}
        </div>

        {/* Right Tab Text — Crisp Bold Silver-White with high contrast */}
        <span
          className="font-mono text-[11px] font-extrabold tracking-wider transition-colors duration-200 drop-shadow-md text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/15"
        >
          {plan.tag}
        </span>
      </div>

      {/* ── Inner Live Neon Wavy Ribbon Canvas (Authentic Serpentine Neon Effect) ── */}
      <div className="relative z-10 px-4 pt-3">
        <div
          className="relative w-full rounded-2xl overflow-hidden border transition-all duration-400"
          style={{
            height: '144px',
            backgroundColor: '#030611',
            borderColor: isHovered || isSelected ? `rgba(${plan.accentRgb}, 0.7)` : 'rgba(255, 255, 255, 0.15)',
            boxShadow: isHovered || isSelected
              ? `0 0 25px rgba(${plan.accentRgb}, 0.4)`
              : 'inset 0 0 15px rgba(0,0,0,0.8)',
          }}
        >
          {/* Live 60 FPS Neon Wavy Ribbon Animation */}
          <RibbonCanvas3D
            color={plan.accentColor}
            isHovered={isHovered || isSelected}
            theme={plan.themeName}
          />

          {/* Quote Badge with Frosted Dark Pill for Crystal-Clear Readability */}
          <div className="absolute inset-x-3 bottom-2.5 z-10 pointer-events-none flex justify-center">
            <div className="px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 shadow-xl max-w-full">
              <p className="text-[11px] sm:text-xs font-black leading-tight text-white m-0 text-center tracking-wide">
                {isHi ? plan.ribbonQuoteHi : plan.ribbonQuoteEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle: Big Typography & Pricing (Crisp High-Contrast Text) ── */}
      <div className="relative z-10 px-5 pt-3 pb-1 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          {/* Headline */}
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            {plan.title}
          </div>

          {/* Price */}
          <div className="text-right">
            <span
              className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm text-white"
            >
              {plan.price}
            </span>
            <span className="text-[11px] font-bold text-slate-300 ml-1">
              {plan.period}
            </span>
          </div>
        </div>

        {/* Plan Description — High-Contrast Slate-200 */}
        <p className="text-xs font-semibold text-slate-200 m-0 leading-snug">
          {plan.description}
        </p>
      </div>

      {/* ── Feature Checklist (Crisp White/Silver with glowing Checkmark) ── */}
      <div className="relative z-10 px-5 py-2 space-y-2 flex-1">
        <div className="h-px w-full bg-white/20" />
        <ul className="space-y-1.5 list-none pl-0 m-0">
          {(isHi ? plan.featuresHi : plan.featuresEn).map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs leading-snug text-white font-medium">
              <Check
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: plan.accentColor }}
              />
              <span className="text-slate-100">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Bottom CTA Button & Interactive Status ── */}
      <div className="relative z-10 px-5 pb-5 pt-1 space-y-3">
        {/* Upgrade / Select Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 text-white ${
            isSelected || isHovered
              ? 'brightness-110 shadow-xl'
              : 'hover:brightness-110'
          }`}
          style={{
            background: `linear-gradient(135deg, ${plan.accentColor}, #0f172a)`,
            borderColor: plan.accentColor,
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: isSelected || isHovered ? `0 6px 20px rgba(${plan.accentRgb}, 0.5)` : undefined,
          }}
        >
          <span>{isHi ? plan.ctaHi : plan.ctaEn}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Bottom Bar: 3 Dots Indicating Current Plan Tier & Guarantee */}
        <div className="flex items-center justify-between pt-1">
          {/* 3 Accent Micro-dots: Current plan's dot is glowing and active */}
          <div className="flex items-center gap-2" title={`Tier ${plan.dotIndex + 1} of 3`}>
            {[0, 1, 2].map((idx) => {
              const isActive = plan.dotIndex === idx;
              return (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isActive
                      ? plan.accentColor
                      : isHovered
                        ? `rgba(${plan.accentRgb}, 0.6)`
                        : 'rgba(255,255,255,0.3)',
                    boxShadow: isActive ? `0 0 10px ${plan.accentColor}` : 'none',
                    transform: isActive ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              );
            })}
          </div>

          {/* Secure label */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Encrypted SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
