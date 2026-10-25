import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, Trophy, TrendingUp, ChevronLeft, ChevronRight,
  Flame, Layers, BookOpen,
  Zap, Award, ArrowRight, Youtube, Bell, Star
} from 'lucide-react';
import { AnimatedNumber } from '../animations/AnimatedNumber';
import { AceternityCard } from '../animations/AceternityCard';
import { ScrollReveal } from '../animations/ScrollReveal';
import { AuroraLamp } from '../animations/AuroraLamp';

function tagBadge(tag) {
  const t = (tag || '').toLowerCase();
  if (t.includes('excellent')) return 'badge-excellent';
  if (t.includes('good')) return 'badge-good';
  if (t.includes('average') || t.includes('pending')) return 'badge-average';
  return 'badge-poor';
}

function formatDateSafe(val) {
  if (!val) return 'Recently';
  try {
    let d;
    if (typeof val?.toDate === 'function') d = val.toDate();
    else if (val?.seconds) d = new Date(val.seconds * 1000);
    else d = new Date(val);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch (e) {
    return 'Recently';
  }
}

function getTimeGreeting(isHi) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return isHi ? 'नमस्कार सुप्रभात' : 'Good Morning';
  if (hour >= 12 && hour < 17) return isHi ? 'नमस्कार दोपहर' : 'Good Afternoon';
  if (hour >= 17 && hour < 21) return isHi ? 'नमस्कार संध्या' : 'Good Evening';
  return isHi ? 'शुभरात्रि' : 'Good Night';
}

// ── Detect gender from user profile ──────────────────────────────────────
function detectGender(user) {
  if (!user) return 'male';
  if (user.gender) return user.gender;
  const name = (user.name || '').toLowerCase().trim();
  const femaleNames = [
    'priya', 'neha', 'sneha', 'pooja', 'divya', 'anita', 'kavita',
    'sunita', 'sumita', 'meera', 'radha', 'sita', 'geeta', 'rekha',
    'usha', 'asha', 'nisha', 'sona', 'maya', 'rani', 'lata', 'nita',
    'mala', 'sudha', 'rupa', 'laxmi', 'trisha', 'preeti', 'namita',
    'mamita', 'sangita', 'nandita', 'devi', 'kumari', 'bala', 'pinki',
    'seeta', 'neeta', 'anushka', 'isha', 'diksha', 'pratiksha', 'akanksha',
    'shreya', 'priyanka', 'deepika', 'riya', 'siya', 'tanya', 'monika',
    'sonika', 'komal', 'sapna', 'swati', 'bharti', 'jyoti', 'anjali',
    'nidhi', 'renu', 'manu', 'lata', 'shweta', 'sujata', 'sarita',
  ];
  const firstWord = name.split(' ')[0];
  if (femaleNames.includes(firstWord)) return 'female';
  if (femaleNames.some(n => firstWord.endsWith(n) && firstWord.length > 4)) return 'female';
  return 'male';
}

function HeroCarousel({ user, greeting, isHi, activeExam, totalCount, safeAvgPct, percentile }) {
  const gender = detectGender(user);

  // Dedicated Female Slides (Mobile portrait + Desktop 16:9 — ONLY Female Aspirants)
  // Parliament Hero is FIRST (#1 PRIMARY) on Desktop!
  const femaleSlides = [
    {
      id: 'female_parliament',
      title: 'Parliament Window Study Desk',
      tagHi: '🏛️ संसद भवन — सपनों की नींव',
      tagEn: '🏛️ Sansad Bhavan — Foundation of Dreams',
      quoteHi: 'कर्तव्य, समर्पण और सेवा का संकल्प ही एक श्रेष्ठ अधिकारी की पहचान है।',
      quoteEn: 'Duty, dedication, and service define the hallmark of a true officer.',
      desktopBg: '/hero_girl_parliament_desktop.jpg',
      mobileBg: '/hero_girl_desk_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
    {
      id: 'female_qutub',
      title: 'Qutub Minar IAS Aspirant',
      tagHi: '🌟 हर लड़की IAS बन सकती है — Civil Services',
      tagEn: '🌟 Civil Services Loading... Better India',
      quoteHi: 'सीखो। तैयार करो। आगे बढ़ो। आज की छोटी मेहनत कल की बड़ी कामयाबी बनती है।',
      quoteEn: 'Learn. Prepare. Progress. Small steps today build the success of tomorrow.',
      desktopBg: '/hero_girl_qutub_desktop.jpg',
      mobileBg: '/hero_girl_qutub_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
    {
      id: 'female_himalaya',
      title: 'Himalayan Monastery Aspirant',
      tagHi: '🏔️ ऊंचे लक्ष्य, अटूट संकल्प — IAS 2026',
      tagEn: '🏔️ Higher, Stronger, Kinder, Wiser You',
      quoteHi: 'पहाड़ों जैसी अडिग निष्ठा ही एक दिन सर्वोच्च शिखर पर ले जाती है।',
      quoteEn: 'Steadfast dedication like the mountains leads to the highest peaks of success.',
      desktopBg: '/hero_girl_himalaya_desktop.jpg',
      mobileBg: '/hero_girl_himalaya_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
    {
      id: 'female_rashtrapati',
      title: 'Rashtrapati Bhavan Sunset',
      tagHi: '🏛️ आज का अनुशासन, कल का गौरव',
      tagEn: '🏛️ Disciplined Today, Stronger Tomorrow',
      quoteHi: 'जब तक लक्ष्य प्राप्त न हो, तब तक निरंतर परिश्रम करते रहो।',
      quoteEn: 'Keep striving relentlessly until you reach your civil services milestone.',
      desktopBg: '/hero_girl_rashtrapati_desktop.jpg',
      mobileBg: '/hero_girl_rashtrapati_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
    {
      id: 'female_tajmahal',
      title: 'Taj Mahal Aspirant',
      tagHi: '🌸 बड़े सपने, पूरी लगन — सफलता निश्चित',
      tagEn: '🌸 Same Girl, Bigger Goals — Unstoppable',
      quoteHi: 'सपनों को सच करने के लिए अटूट विश्वास और एकाग्रता जरूरी है।',
      quoteEn: 'Turning dreams into reality requires unshakable belief and laser focus.',
      desktopBg: '/hero_girl_tajmahal_desktop.jpg',
      mobileBg: '/hero_girl_desk_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
  ];

  // Dedicated Male Slides (Mobile portrait + Desktop 16:9)
  // Parliament Cartoon Hero is FIRST (#1 PRIMARY) on Desktop!
  const maleSlides = [
    {
      id: 'male_parliament',
      title: 'Parliament Cartoon Hero',
      tagHi: '🏛️ संसद भवन — सपनों की नींव',
      tagEn: '🏛️ Sansad Bhavan — Foundation of Dreams',
      quoteHi: 'कर्तव्य, समर्पण और सेवा का संकल्प ही एक श्रेष्ठ अधिकारी की पहचान है।',
      quoteEn: 'Duty, dedication, and service define the hallmark of a true officer.',
      desktopBg: '/parliament_cartoon_hero_desktop.jpg',
      mobileBg: '/hero_boy_desk_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
    {
      id: 'male_indiagate_desk',
      title: 'India Gate Study Desk',
      tagHi: '🎓 सपने देखो, मेहनत करो, सफल बनो',
      tagEn: '🎓 Dream Big. Work Hard. Succeed.',
      quoteHi: 'सीखो। तैयार करो। आगे बढ़ो। आज की छोटी मेहनत कल की बड़ी कामयाबी बनती है।',
      quoteEn: 'Learn. Prepare. Progress. Small steps today build the success of tomorrow.',
      desktopBg: '/hero_boy_indiagate_desk_desktop.jpg',
      mobileBg: '/hero_boy_desk_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
    {
      id: 'male_indiagate_sunset',
      title: 'India Gate Sunset Aspirant',
      tagHi: '🇮🇳 आज का अनुशासन, कल का सुनहरा भविष्य',
      tagEn: '🇮🇳 Discipline Today, A Brighter Tomorrow',
      quoteHi: 'संघर्ष जितना कठिन होगा, जीत उतनी ही शानदार होगी।',
      quoteEn: 'The harder the struggle today, the more glorious the victory tomorrow.',
      desktopBg: '/hero_boy_indiagate_sunset_desktop.jpg',
      mobileBg: '/hero_boy_desk_mobile.jpg',
      mobileObjectPosition: 'center 15%',
      desktopObjectPosition: 'center center',
    },
  ];

  const HERO_SLIDES = gender === 'female' ? femaleSlides : maleSlides;

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    // 8 seconds per slide for a comfortable reading & visual experience
    const timer = setTimeout(() => {
      setSlideIdx(prev => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearTimeout(timer);
  }, [slideIdx, HERO_SLIDES.length]);

  const slide = HERO_SLIDES[slideIdx] || HERO_SLIDES[0];

  const nextSlide = (e) => {
    e?.stopPropagation();
    setSlideIdx(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    setSlideIdx(prev => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  return (
    <div className="hero-carousel-container relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 group">
      {/* Aceternity Aurora Lamp Glow */}
      <AuroraLamp intensity="medium" />

      {/* Dynamic Responsive Image Background with aspect-ratio-aware object-position */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden">
        {/* Mobile image: rendered on mobile (<768px) with native portrait aspect ratio */}
        <img
          key={`${slide.id}-mobile`}
          src={slide.mobileBg}
          alt={slide.title}
          className="hero-mobile-img w-full h-full object-cover transition-opacity duration-1000 animate-fadeIn"
          style={{
            objectPosition: slide.mobileObjectPosition || 'center 15%',
            animation: 'kenBurnsSlow 20s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
        {/* Desktop image: rendered on desktop (≥768px) with native 16:9 widescreen ratio */}
        <img
          key={`${slide.id}-desktop`}
          src={slide.desktopBg}
          alt={slide.title}
          className="hero-desktop-img w-full h-full object-cover transition-opacity duration-1000 animate-fadeIn"
          style={{
            objectPosition: slide.desktopObjectPosition || 'center center',
            animation: 'kenBurnsHero 24s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Dark Readability Overlay — Left gradient for desktop text readability, bottom/top gradients for mobile */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(4,7,18,0.85) 0%, rgba(4,7,18,0.52) 42%, rgba(4,7,18,0.08) 72%, transparent 100%)'
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(4,7,18,0.88) 0%, rgba(4,7,18,0.35) 35%, transparent 65%)'
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(4,7,18,0.65) 0%, transparent 40%)'
        }}
      />

      {/* Previous / Next Arrow Controls — Visible on hover */}
      {HERO_SLIDES.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 p-5 sm:p-6 md:p-8 flex flex-col justify-between h-full min-h-[380px] sm:min-h-[340px] md:min-h-[440px]">
        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-sm"
            style={{ background: 'rgba(251,191,36,0.22)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.45)' }}
          >
            {activeExam === 'bpsc' ? '🦁 BPSC 72nd CCE AI' : '🏛️ UPSC 2026 AI'}
          </span>
          <span
            className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md text-white/90 shadow-sm"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            {isHi ? slide.tagHi : slide.tagEn}
          </span>
        </div>

        {/* Greeting & Aspirant Name with Shimmer text */}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-0.5" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
            {greeting},
          </h2>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-2 shimmer-text"
          >
            {user?.name?.split(' ')[0] || 'Alekh'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-white/90 max-w-xs sm:max-w-sm md:max-w-md leading-relaxed" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.9)' }}>
            {isHi ? (slide.quoteHi || 'सीखो। तैयार करो। आगे बढ़ो। आज की छोटी मेहनत कल की बड़ी कामयाबी बनती है।') : (slide.quoteEn || 'Learn. Prepare. Progress. Small steps today build the success of tomorrow.')}
          </p>
        </div>

        {/* Stat Pills & Carousel Indicator Dots */}
        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm backdrop-blur-md"
              style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span><AnimatedNumber value={totalCount} /> {isHi ? 'टेस्ट' : 'Tests'}</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm backdrop-blur-md"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span><AnimatedNumber value={safeAvgPct} suffix="%" /> {isHi ? 'औसत' : 'Avg'}</span>
            </div>
            {totalCount > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm backdrop-blur-md"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa' }}
              >
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span>{percentile}</span>
              </div>
            )}
          </div>

          {/* Carousel Slide Indicators */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSlideIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === slideIdx
                    ? 'w-6 ' + (gender === 'female' ? 'bg-pink-400' : 'bg-amber-400')
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={s.title}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnouncementsWidget({ isHi }) {
  const YOUTUBE_URL = 'https://www.youtube.com/@UPSCBPSCMainsAI';
  return (
    <div className="rounded-3xl glass-card-clean border border-white/80 overflow-hidden">
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="p-5 cursor-pointer group transition-all hover:bg-red-500/5 block no-underline"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #ff0000, #cc0000)', color: '#fff' }}>
            <Youtube className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-red-600 mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              Official YouTube Channel
            </div>
            <div className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>
              ET Academy
            </div>
            <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'Free strategy, PYQ analysis & tips - Subscribe करें' : 'Free strategy, PYQ analysis & tips - Subscribe Now'}
            </div>
          </div>
          <div className="shrink-0 text-red-500 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </a>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {isHi ? 'आने वाले फीचर्स और बैच' : 'Coming Soon & Updates'}
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-500/10',   title: 'Live Batch - UPSC Mains 2025', sub: isHi ? 'जल्द शुरू होने वाला है - YouTube पर नजर रखें' : 'Starting soon - Watch YouTube for updates' },
            { icon: Sparkles, color: 'text-blue-500',    bg: 'bg-blue-500/10',    title: 'Voice Evaluation (Coming)', sub: isHi ? 'बोलकर उत्तर दें, Expert जांचेगा' : 'Speak your answer, expert will evaluate' },
            { icon: Trophy,   color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Student Leaderboard (Coming)', sub: isHi ? 'अन्य Aspirants से अपनी रैंक जानें' : 'Compare your rank with other aspirants' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsOverview({ onQuickAction, onViewEvaluation, onOpenFlashcards, onOpenMainsNotes }) {
  const { user } = useAuth();
  const { evaluations, getInsightsData, language, activeExam } = useApp();
  const isHi = language === 'hi';

  const greeting = getTimeGreeting(isHi);

  const insights = getInsightsData();
  const realEvals = Array.isArray(evaluations) ? evaluations : [];
  const recentList = realEvals.slice(0, 3);
  const totalCount = realEvals.length;
  const rawAvgPct = insights?.avgPct ?? 0;
  const safeAvgPct = Math.max(0, Math.min(100, Math.round(Number(rawAvgPct) || 0)));
  const percentile = totalCount === 0 ? '-'
    : (safeAvgPct >= 75 ? 'Top 5%' : safeAvgPct >= 65 ? 'Top 15%' : safeAvgPct >= 50 ? 'Top 35%' : 'Top 50%');

  return (
    <div className="w-full space-y-5 animate-fadeIn">

      {/* ── 1. ANIMATED 5-SECOND HERO CAROUSEL ── */}
      <HeroCarousel
        user={user}
        greeting={greeting}
        isHi={isHi}
        activeExam={activeExam}
        totalCount={totalCount}
        safeAvgPct={safeAvgPct}
        percentile={percentile}
      />


      {/* ── 2. STUDY TOOLS ── */}
      <ScrollReveal direction="up" delay={80}>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>{isHi ? 'अध्ययन उपकरण' : 'AI Study Tools'}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flashcards */}
            <AceternityCard
              onClick={() => onOpenFlashcards?.()}
              spotlightColor="rgba(59, 130, 246, 0.2)"
              className="cursor-pointer group"
            >
              <div
                className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 space-y-3 h-full"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.08))' }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff' }}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 3D Flip Cards
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black m-0 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {isHi ? 'फ्लैशकार्ड रिवीजन' : 'Flashcards Revision'}
                  </h4>
                  <p className="text-xs font-medium mt-1 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {isHi ? 'टॉपिक चुनें → 5-20 3D कार्ड' : 'Select topic → 5-20 interactive 3D flip cards'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>{isHi ? 'खोलें' : 'Open Flashcards'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </AceternityCard>

            {/* Mains Notes */}
            <AceternityCard
              onClick={() => onOpenMainsNotes?.()}
              spotlightColor="rgba(16, 185, 129, 0.2)"
              className="cursor-pointer group"
            >
              <div
                className="p-5 rounded-3xl glass-card-clean glass-card-hover border border-white/80 space-y-3 h-full"
                style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(16,185,129,0.08))' }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff' }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                    <Award className="w-3 h-3" /> PDF Export
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black m-0 group-hover:text-emerald-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {isHi ? 'मेन्स नोट्स + PYQ' : 'Mains Notes & PYQ'}
                  </h4>
                  <p className="text-xs font-medium mt-1 m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {isHi ? 'टॉपिक टाइप करें → नोट्स + PYQ + PDF' : 'Type topic → Notes + exact PYQs + PDF download'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>{isHi ? 'नोट्स बनाएं' : 'Generate Notes'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </AceternityCard>
          </div>
        </div>
      </ScrollReveal>

      {/* ── 3. QUICK SHORTCUTS ── */}
      <ScrollReveal direction="up" delay={160}>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHi ? 'शॉर्टकट्स' : 'Quick Shortcuts'}</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Smart Test */}
            <AceternityCard
              onClick={() => onQuickAction?.('ai_test')}
              spotlightColor="rgba(59, 130, 246, 0.18)"
              className="cursor-pointer group"
            >
              <div className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 text-left space-y-2 h-full">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {isHi ? 'स्मार्ट प्रश्न टेस्ट' : 'Smart Question Test'}
                  </div>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {isHi ? 'प्रश्न चुनें और उत्तर जमा करें' : 'Pick a question & submit answer'}
                  </div>
                </div>
              </div>
            </AceternityCard>

            {/* Teacher / Student action */}
            {user?.role === 'teacher' || user?.role === 'admin' ? (
              <AceternityCard
                onClick={() => onQuickAction?.('teacher')}
                spotlightColor="rgba(168, 85, 247, 0.22)"
                className="cursor-pointer group"
              >
                <div className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-purple-500/30 text-left space-y-2 bg-purple-500/5 h-full">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {isHi ? 'शिक्षक चेकिंग पोर्टल' : 'Faculty Checking Portal'}
                    </div>
                    <div className="text-[10px] font-medium text-purple-600">
                      {isHi ? 'छात्रों की कॉपियां जांचें' : 'Grade pending student copies'}
                    </div>
                  </div>
                </div>
              </AceternityCard>
            ) : (
              <AceternityCard
                onClick={() => onQuickAction?.('teacher')}
                spotlightColor="rgba(168, 85, 247, 0.18)"
                className="cursor-pointer group"
              >
                <div className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 text-left space-y-2 h-full">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {isHi ? 'शिक्षक मूल्यांकन अनुरोध' : 'Request Teacher Check'}
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {isHi ? 'कॉपी अपलोड कर शिक्षक को भेजें' : 'Upload copy for faculty review'}
                    </div>
                  </div>
                </div>
              </AceternityCard>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ── 4. RECENT EVALUATIONS ── */}
      <ScrollReveal direction="up" delay={220}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider m-0" style={{ color: 'var(--text-secondary)' }}>
              {isHi ? 'हाल के मूल्यांकन' : 'Recent Evaluations'}
            </h4>
            <button
              onClick={() => onQuickAction?.('history')}
              className="text-xs font-bold underline hover:opacity-80"
              style={{ color: 'rgb(var(--accent))' }}
            >
              {isHi ? 'सभी देखें' : 'View All'}
            </button>
          </div>
          {recentList.length === 0 ? (
            <div className="p-6 text-center rounded-3xl glass-card-clean border border-dashed border-white/40">
              <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'अभी तक कोई मूल्यांकन नहीं। पहला उत्तर अपलोड करें!' : 'No evaluations yet. Upload your first answer sheet!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentList.map((item, idx) => (
                <div
                  key={item.id || item.queueId || `eval-${idx}`}
                  onClick={() => onViewEvaluation?.(item)}
                  className="p-4 rounded-2xl glass-card-clean glass-card-hover border border-white/60 flex items-center justify-between gap-3 cursor-pointer group transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgb(var(--accent)/0.12)', color: 'rgb(var(--accent))' }}
                      >
                        {item.paper || 'GS'}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {formatDateSafe(item.createdAt)}
                      </span>
                    </div>
                    <h5 className="text-xs font-extrabold m-0 truncate group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {item.questionTitle || item.paper}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black" style={{ color: 'rgb(var(--accent))' }}>
                        {item.score != null ? item.score : '-'} <span className="text-[10px] opacity-60">/ {item.maxMarks}</span>
                      </span>
                      <span className={`block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${tagBadge(item.tag)}`}>
                        {item.tag || 'Checked'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* ── 5. YOUTUBE + UPCOMING ── */}
      <ScrollReveal direction="up" delay={280}>
        <AnnouncementsWidget isHi={isHi} />
      </ScrollReveal>

    </div>
  );
}
