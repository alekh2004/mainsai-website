import React, { useState } from 'react';
import { Check, Sparkles, Crown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { RibbonCanvas3D } from './RibbonCanvas3D';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Starter Tier',
    tag: '— Starter Tier®',
    title: 'Start Here.',
    price: 'Free Trial',
    priceNum: 0,
    period: '2 AI Check Passes',
    description: 'BPSC & UPSC प्रारंभिक उत्तर लेखन अभ्यास।',
    ribbonQuoteHi: 'सीखो • अभ्यास करो • शुरुआत करें',
    ribbonQuoteEn: 'Start Free. Build Momentum.',
    accentColor: '#3b82f6',
    accentRgb: '59, 130, 246',
    themeName: 'blue',
    dotIndex: 0,
    badgeHi: 'निःशुल्क',
    badgeEn: 'Starter',
    featuresHi: [
      '2 AI Answer Evaluations (Marks & Model Structure)',
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
    description: 'असीमित AI चेक + 2 शिक्षक समीक्षा पास।',
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
      'असीमित (Unlimited) Gemini Vision AI मूल्यांकन',
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
    ctaHi: 'Pro Scholar में अपग्रेड करें (₹499)',
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
    description: '10 शिक्षक समीक्षाएं + 1-on-1 मेंटरशिप कॉल।',
    ribbonQuoteHi: 'परिणाम आपके समर्पण की गवाही देगा',
    ribbonQuoteEn: 'The rank speaks before we do.',
    accentColor: '#a855f7',
    accentRgb: '168, 85, 247',
    themeName: 'purple',
    dotIndex: 2,
    badgeHi: 'सर्वश्रेष्ठ रैंकर्स',
    badgeEn: 'All Access',
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

  // SVG Normalized Path for the Bookmark Tab & Lower Bite Silhouette (viewBox 0 0 100 100)
  // Left shoulder starts at y=7, smooth upward curve to top tab at y=0, lower-right bite notch at y=84
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
      className={`group relative flex flex-col justify-between cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] select-none pt-3 ${
        isSelected
          ? 'scale-[1.02] -translate-y-2'
          : isHovered
            ? 'scale-[1.01] -translate-y-1.5'
            : 'scale-100 translate-y-0'
      }`}
      style={{
        minHeight: '540px',
        filter: isSelected || isHovered
          ? `drop-shadow(0 20px 45px rgba(${plan.accentRgb}, 0.38))`
          : 'drop-shadow(0 12px 28px rgba(0,0,0,0.55))',
      }}
    >
      {/* ── Background SVG Silhouette with Dynamic Bloom Glow ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Radial Bloom Gradient on Hover */}
          <radialGradient id={`glow-${plan.id}`} cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor={`rgba(${plan.accentRgb}, ${isHovered || isSelected ? 0.42 : 0.16})`} />
            <stop offset="45%" stopColor={`rgba(${plan.accentRgb}, ${isHovered || isSelected ? 0.18 : 0.05})`} />
            <stop offset="100%" stopColor="#080c18" />
          </radialGradient>
        </defs>

        {/* Card Body Fill */}
        <path
          d={bookmarkPathD}
          fill={`url(#glow-${plan.id})`}
          className="transition-all duration-700"
        />

        {/* Outer Stroke Border (illuminates on hover) */}
        <path
          d={bookmarkPathD}
          fill="none"
          stroke={
            isSelected
              ? plan.accentColor
              : isHovered
                ? plan.accentColor
                : 'rgba(255, 255, 255, 0.16)'
          }
          strokeWidth={isSelected || isHovered ? '0.75' : '0.45'}
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-400"
        />
      </svg>

      {/* ── Top Bookmark Tab Header (Unclipped, Crisp & 100% Legible) ── */}
      <div className="relative z-10 pt-2 px-5 flex items-center justify-between">
        {/* Left shoulder badge */}
        <div className="flex items-center gap-1.5">
          {plan.popular && (
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md text-white"
              style={{
                background: `linear-gradient(135deg, ${plan.accentColor}, #ef4444)`,
              }}
            >
              ★ {isHi ? 'बेस्ट चॉइस' : 'Popular'}
            </span>
          )}
          {isCurrent && (
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm"
              style={{
                background: 'rgba(34, 197, 94, 0.25)',
                borderColor: 'rgba(34, 197, 94, 0.6)',
                color: '#4ade80',
              }}
            >
              ✓ {isHi ? 'सक्रिय प्लान' : 'Current'}
            </span>
          )}
        </div>

        {/* Right Tab Text */}
        <span
          className="font-mono text-[11px] font-extrabold tracking-tight transition-colors duration-300 drop-shadow-sm"
          style={{
            color: isSelected || isHovered ? plan.accentColor : 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {plan.tag}
        </span>
      </div>

      {/* ── Inner Live 3D Metallic Ribbon Artwork (WebGL 60 FPS, Zero Pixelation) ── */}
      <div className="relative z-10 px-4 pt-3">
        <div
          className="relative w-full rounded-2xl overflow-hidden border transition-all duration-500"
          style={{
            height: '148px',
            backgroundColor: '#040712',
            borderColor: isHovered || isSelected ? `rgba(${plan.accentRgb}, 0.55)` : 'rgba(255, 255, 255, 0.10)',
            boxShadow: isHovered || isSelected ? `0 0 25px rgba(${plan.accentRgb}, 0.35)` : 'inset 0 0 20px rgba(0,0,0,0.8)',
          }}
        >
          {/* Live 3D Undulating Metallic Ribbon */}
          <RibbonCanvas3D
            color={plan.accentColor}
            isHovered={isHovered || isSelected}
            theme={plan.themeName}
          />

          {/* Text inside artwork */}
          <div className="absolute inset-x-3.5 bottom-2.5 z-10 pointer-events-none">
            <p
              className="text-xs sm:text-[13px] font-black leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] m-0 text-white"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
            >
              {isHi ? plan.ribbonQuoteHi : plan.ribbonQuoteEn}
            </p>
          </div>
        </div>
      </div>

      {/* ── Middle: Big Typography & Pricing (High-Contrast Crisp) ── */}
      <div className="relative z-10 px-5 pt-3 pb-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          {/* Big Punchy Headline */}
          <div
            className="text-2xl sm:text-3xl font-black tracking-tight text-white transition-all duration-300 drop-shadow-md"
            style={{
              textShadow: isHovered || isSelected ? `0 0 22px rgba(${plan.accentRgb}, 0.7)` : 'none',
            }}
          >
            {plan.title}
          </div>

          {/* Price */}
          <div className="text-right">
            <span
              className="text-2xl font-black tracking-tight drop-shadow-sm"
              style={{ color: plan.accentColor }}
            >
              {plan.price}
            </span>
            <span className="text-[11px] font-bold text-slate-300">
              {plan.period}
            </span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-slate-300 m-0 leading-tight">
          {plan.description}
        </p>
      </div>

      {/* ── Feature Checklist (White/Silver on Dark Background — 100% Legible) ── */}
      <div className="relative z-10 px-5 py-2 space-y-2 flex-1">
        <div className="h-px w-full bg-white/15" />
        <ul className="space-y-1.5 list-none pl-0 m-0">
          {(isHi ? plan.featuresHi : plan.featuresEn).map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] leading-tight text-slate-100 font-medium">
              <Check
                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                style={{ color: plan.accentColor }}
              />
              <span className="opacity-95">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Bottom CTA Button & Interactive Dots ── */}
      <div className="relative z-10 px-5 pb-5 pt-1 space-y-3">
        {/* Upgrade / Select Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md active:scale-95 text-white ${
            isSelected || isHovered ? 'shadow-lg' : 'bg-white/10 hover:bg-white/20'
          }`}
          style={{
            background: isSelected || isHovered
              ? `linear-gradient(135deg, ${plan.accentColor}, #1e3a8a)`
              : undefined,
            boxShadow: isSelected || isHovered ? `0 8px 24px rgba(${plan.accentRgb}, 0.45)` : undefined,
          }}
        >
          <span>{isHi ? plan.ctaHi : plan.ctaEn}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Bottom Bar: 3 Dots Indicating Current Plan Tier & Guarantee */}
        <div className="flex items-center justify-between pt-1">
          {/* 3 Accent Micro-dots: Current plan's dot is glowing and active */}
          <div className="flex items-center gap-1.5" title={`Tier ${plan.dotIndex + 1} of 3`}>
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
                        ? `rgba(${plan.accentRgb}, 0.5)`
                        : 'rgba(255,255,255,0.25)',
                    boxShadow: isActive ? `0 0 10px ${plan.accentColor}` : 'none',
                    transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              );
            })}
          </div>

          {/* Secure label */}
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-mono font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Encrypted SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
