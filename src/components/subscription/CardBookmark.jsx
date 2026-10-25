import React, { useState } from 'react';
import { Check, Sparkles, Crown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Starter Tier',
    tag: '— Starter Tier®',
    title: 'Start Here.',
    price: 'Free Trial',
    priceNum: 0,
    period: '2 AI Check Passes',
    description: 'Foundational answer writing for civil services aspirants.',
    ribbonQuoteHi: 'सीखो • अभ्यास करो • शुरुआत करें',
    ribbonQuoteEn: 'Start Free. Build Momentum.',
    ribbonImg: '/plan_pure_ribbon_blue.jpg',
    accentColor: '#3b82f6',
    accentRgb: '59, 130, 246',
    accentGlow: 'rgba(59, 130, 246, 0.40)',
    themeName: 'blue',
    stats: '2 AI Passes',
    badgeHi: 'निःशुल्क',
    badgeEn: 'Starter',
    featuresHi: [
      '2 AI Answer Evaluations (Instant Marks & Model Structure)',
      'BPSC & UPSC Easy & Medium PYQs Access',
      'Instant Weak-area Diagnostic Scorecard',
      'Hindi & English Answer Checking Support'
    ],
    featuresEn: [
      '2 AI Answer Evaluations with instant feedback',
      'Easy & Medium Mains PYQ Vault access',
      'Diagnostic Weakness Assessment & Strengths',
      'Bilingual Hindi & English evaluation'
    ],
    ctaHi: 'निःशुल्क शुरू करें',
    ctaEn: 'Start Free Trial',
  },
  {
    id: 'pro',
    name: 'Pro Scholar',
    tag: '— Pro Scholar® (Most Popular)',
    title: '+240%',
    price: '₹499',
    priceNum: 499,
    period: '/ month',
    description: 'Unlimited AI Checks & Advanced Mains Mastery.',
    ribbonQuoteHi: 'हर टेस्ट के साथ निरंतर प्रगति',
    ribbonQuoteEn: 'Growth that compounds every test.',
    ribbonImg: '/plan_pure_ribbon_orange.jpg',
    accentColor: '#f97316',
    accentRgb: '249, 115, 22',
    accentGlow: 'rgba(249, 115, 22, 0.45)',
    themeName: 'orange',
    stats: '+240% Speed',
    popular: true,
    badgeHi: 'सर्वाधिक लोकप्रिय',
    badgeEn: 'Most Popular',
    featuresHi: [
      'असीमित (Unlimited) Gemini Vision AI मूल्यांकन',
      '2 शिक्षक समीक्षा पास प्रति माह (Faculty Script Review)',
      'Full Hard-Level Questions & Ethics Case Studies',
      'AI Model Answers, Topper Insights & Progress Tracking'
    ],
    featuresEn: [
      'Unlimited Gemini Vision AI Answer Evaluations',
      '2 Faculty Script Review Passes / Month',
      'Full Hard-Level PYQ Vault & Ethics Cases',
      'Model Answers & Continuous Progress Tracking'
    ],
    ctaHi: 'Pro में अपग्रेड करें (₹499)',
    ctaEn: 'Upgrade to Pro (₹499)',
  },
  {
    id: 'ultimate',
    name: 'Ultimate Mentor',
    tag: '— Ultimate Mentor®',
    title: 'All Access.',
    price: '₹999',
    priceNum: 999,
    period: '/ month',
    description: 'Complete Mentor Feedback + Top Ranker Strategy.',
    ribbonQuoteHi: 'परिणाम आपके समर्पण की गवाही देता है',
    ribbonQuoteEn: 'The rank speaks before we do.',
    ribbonImg: '/plan_pure_ribbon_purple.jpg',
    accentColor: '#a855f7',
    accentRgb: '168, 85, 247',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    themeName: 'purple',
    stats: 'Top 50 Rankers',
    badgeHi: 'सर्वश्रेष्ठ रैंकर्स',
    badgeEn: 'All Access',
    featuresHi: [
      'असीमित (Unlimited) AI + 10 शिक्षक विस्तृत कॉपियां',
      'Priority Faculty Queue & Real Mains Test Series',
      '1-on-1 Mentor Guidance & Detailed Score Breakdown',
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

  // SVG Normalized Path (viewBox 0 0 100 100)
  // Replicating the exact Scrolltide bookmark tab (top right tab) and lower bite (bottom right notch)
  const bookmarkPathD = `
    M 0 6.5
    Q 0 4.8, 1.8 4.8
    L 27 4.8
    C 31 4.8, 33.5 1.5, 36.5 0
    L 94 0
    Q 100 0, 100 4.2
    L 100 82.5
    C 98.2 84.5, 94.5 86.8, 92.5 88.5
    L 92.5 96
    Q 92.5 100, 88 100
    L 4 100
    Q 0 100, 0 95.8
    Z
  `;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      className={`group relative flex flex-col justify-between cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] select-none ${
        isSelected
          ? 'scale-[1.02] -translate-y-2'
          : isHovered
            ? 'scale-[1.01] -translate-y-1.5'
            : 'scale-100 translate-y-0'
      }`}
      style={{
        minHeight: '520px',
        filter: isSelected || isHovered
          ? `drop-shadow(0 20px 40px rgba(${plan.accentRgb}, 0.35))`
          : 'drop-shadow(0 12px 28px rgba(0,0,0,0.45))',
      }}
    >
      {/* ── Background SVG Silhouette with Dynamic Border Glow ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Radial Bloom Gradient on Hover */}
          <radialGradient id={`glow-${plan.id}`} cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor={`rgba(${plan.accentRgb}, ${isHovered || isSelected ? 0.38 : 0.12})`} />
            <stop offset="50%" stopColor={`rgba(${plan.accentRgb}, ${isHovered || isSelected ? 0.14 : 0.03})`} />
            <stop offset="100%" stopColor="rgba(6, 9, 18, 0.96)" />
          </radialGradient>
        </defs>

        {/* Card Body Fill */}
        <path
          d={bookmarkPathD}
          fill={`url(#glow-${plan.id})`}
          className="transition-all duration-700"
        />

        {/* Outer Stroke Border (1px crisp, illuminates on hover) */}
        <path
          d={bookmarkPathD}
          fill="none"
          stroke={
            isSelected
              ? plan.accentColor
              : isHovered
                ? plan.accentColor
                : 'rgba(255, 255, 255, 0.12)'
          }
          strokeWidth={isSelected || isHovered ? '0.75' : '0.4'}
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-400"
        />
      </svg>

      {/* ── Top Header / Bookmark Tab Label ── */}
      <div className="relative z-10 pt-2.5 px-4 flex items-center justify-between text-right">
        {/* Left shoulder indicator */}
        <div className="flex items-center gap-1.5">
          {plan.popular && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${plan.accentColor}, #ef4444)`,
                color: '#fff',
              }}
            >
              ★ {isHi ? 'बेस्ट चॉइस' : 'Popular'}
            </span>
          )}
          {isCurrent && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{
                background: 'rgba(34, 197, 94, 0.20)',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                color: '#4ade80',
              }}
            >
              ✓ {isHi ? 'सक्रिय प्लान' : 'Current'}
            </span>
          )}
        </div>

        {/* Right tab text */}
        <span
          className="font-mono text-[11px] font-extrabold tracking-tight transition-colors duration-300"
          style={{
            color: isSelected || isHovered ? plan.accentColor : 'rgba(255, 255, 255, 0.75)',
          }}
        >
          {plan.tag}
        </span>
      </div>

      {/* ── Inner 3D Metallic Ribbon Artwork Box ── */}
      <div className="relative z-10 px-3.5 pt-3">
        <div
          className="relative w-full rounded-2xl overflow-hidden border transition-all duration-500"
          style={{
            height: '150px',
            backgroundColor: '#030712',
            borderColor: isHovered || isSelected ? `rgba(${plan.accentRgb}, 0.5)` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: isHovered || isSelected ? `inset 0 0 20px rgba(${plan.accentRgb}, 0.3)` : 'none',
          }}
        >
          {/* 3D Flowing Ribbon Image */}
          <img
            src={plan.ribbonImg}
            alt={plan.name}
            className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isHovered || isSelected
                ? 'scale-105 filter saturate-150 brightness-110'
                : 'scale-100 filter saturate-90 brightness-95 opacity-90'
            }`}
          />

          {/* Vignette & Soft Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: `linear-gradient(to top, rgba(3,7,18,0.92) 0%, rgba(3,7,18,0.35) 45%, transparent 100%)`,
            }}
          />

          {/* Text inside artwork */}
          <div className="absolute inset-x-3 bottom-2.5 z-10">
            <p className="text-xs sm:text-[13px] font-extrabold text-white leading-snug drop-shadow-md m-0">
              {isHi ? plan.ribbonQuoteHi : plan.ribbonQuoteEn}
            </p>
          </div>
        </div>
      </div>

      {/* ── Middle: Big Typography & Price ── */}
      <div className="relative z-10 px-5 pt-3 pb-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          {/* Big Punchy Headline */}
          <div
            className="text-2xl sm:text-3xl font-black tracking-tight text-white transition-colors duration-300"
            style={{
              textShadow: isHovered || isSelected ? `0 0 24px rgba(${plan.accentRgb}, 0.6)` : 'none',
            }}
          >
            {plan.title}
          </div>

          {/* Price */}
          <div className="text-right">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: plan.accentColor }}
            >
              {plan.price}
            </span>
            <span className="text-[11px] font-bold text-gray-400">
              {plan.period}
            </span>
          </div>
        </div>

        <p className="text-[11px] font-medium text-gray-300/80 m-0 leading-tight">
          {plan.description}
        </p>
      </div>

      {/* ── Feature Checklist ── */}
      <div className="relative z-10 px-5 py-2 space-y-2 flex-1">
        <div className="h-px w-full bg-white/10" />
        <ul className="space-y-1.5 list-none pl-0 m-0">
          {(isHi ? plan.featuresHi : plan.featuresEn).map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] leading-tight text-gray-200">
              <Check
                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                style={{ color: plan.accentColor }}
              />
              <span className="opacity-90">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Bottom CTA Button & Micro-dots ── */}
      <div className="relative z-10 px-5 pb-5 pt-1 space-y-3">
        {/* Upgrade / Select Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md ${
            isSelected
              ? 'text-white shadow-lg'
              : isHovered
                ? 'text-white shadow-md'
                : 'bg-white/10 text-white/90 hover:bg-white/15'
          }`}
          style={{
            background: isSelected || isHovered
              ? `linear-gradient(135deg, ${plan.accentColor}, #1e40af)`
              : undefined,
            boxShadow: isSelected || isHovered ? `0 8px 24px rgba(${plan.accentRgb}, 0.35)` : undefined,
          }}
        >
          <span>{isHi ? plan.ctaHi : plan.ctaEn}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Bottom Bar: 3 Glowing Dots & Guarantee */}
        <div className="flex items-center justify-between pt-1">
          {/* 3 Accent Micro-dots */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: plan.accentColor,
                boxShadow: isHovered || isSelected ? `0 0 8px ${plan.accentColor}` : 'none',
              }}
            />
            <span
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isHovered || isSelected ? plan.accentColor : 'rgba(255,255,255,0.25)',
                opacity: 0.7,
              }}
            />
            <span
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isHovered || isSelected ? plan.accentColor : 'rgba(255,255,255,0.15)',
                opacity: 0.4,
              }}
            />
          </div>

          {/* Secure label */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
