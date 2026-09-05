import React, { useMemo } from 'react';

/**
 * AnimatedParliamentBackground
 * Crystal Clear 8K Hyper-Realistic Indian Parliament & Study Desk Live Wallpaper.
 * - Hardware-accelerated 60 FPS Ken Burns subtle cinematic breathing motion (scale 1.0 to 1.045)
 * - Zero foggy blur filters over the image — 100% sharp architectural & desk detail
 * - Delicate animated rising steam above the coffee mug
 * - Floating golden morning dust motes drifting across the sunlit window
 * - Subtle edge shadow for effortless left-side readability
 */
export function AnimatedParliamentBackground() {
  // Generate stable particle positions for sunlit dust motes
  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: `${15 + (i * 4.8) % 72}%`,
      top: `${16 + (i * 6.1) % 68}%`,
      size: `${2 + (i % 3) * 1.5}px`,
      duration: `${6 + (i % 5) * 1.8}s`,
      delay: `${(i % 7) * 0.8}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-slate-950">
      {/* 1. Crystal Clear 8K Photographic Scenery with Smooth Ken Burns Breathing Pan */}
      <div
        className="absolute -inset-4 bg-cover bg-center transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: 'url(/parliament_study_bg.jpg)',
          animation: 'kenBurnsSlow 26s ease-in-out infinite alternate',
          willChange: 'transform',
          imageRendering: 'crisp-edges',
        }}
      />

      {/* 2. Soft Ambient Morning Glow in Top Right Sky (No heavy blur, preserves dome clarity) */}
      <div
        className="absolute -top-12 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
          animation: 'sunBeamPulse 12s ease-in-out infinite',
        }}
      />

      {/* 3. Delicate Animated Rising Steam from Coffee Mug on Study Desk */}
      <div className="hidden lg:block absolute bottom-28 right-[13%] w-12 h-16 pointer-events-none">
        <div
          className="absolute bottom-0 left-2 w-1.5 h-10 rounded-full blur-[2px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.45), transparent)',
            animation: 'steamFloat 4s ease-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 left-5 w-2 h-12 rounded-full blur-[2px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.5), transparent)',
            animation: 'steamFloat 4.6s ease-out infinite 1.2s',
          }}
        />
        <div
          className="absolute bottom-0 left-1 w-2 h-8 rounded-full blur-[2px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.35), transparent)',
            animation: 'steamFloat 3.8s ease-out infinite 2.2s',
          }}
        />
      </div>

      {/* 4. Floating Sunlight Dust Motes (Warm golden specks in the morning sun) */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-100 shadow-[0_0_6px_rgba(251,191,36,0.9)] pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animation: `particleDrift ${p.duration} ease-in-out infinite ${p.delay}`,
            }}
          />
        ))}
      </div>

      {/* 5. Minimalist Transparent Edge Shadow (Protects text contrast while leaving 8K Parliament 100% visible) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(15, 23, 42, 0.48) 0%, rgba(15, 23, 42, 0.20) 45%, rgba(15, 23, 42, 0.15) 100%)',
        }}
      />
    </div>
  );
}
