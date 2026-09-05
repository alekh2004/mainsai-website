import React, { useMemo } from 'react';

/**
 * AnimatedParliamentBackground
 * High-performance cinematic live background using the user's Parliament study desk image.
 * Features:
 * - 28s smooth Ken Burns pan & breathing zoom
 * - Volumetric golden sunrise light flare
 * - Delicate animated rising steam above the desk coffee mug
 * - Floating ambient golden light motes / dust particles
 * - Responsive frosted lighting overlay ensuring UI legibility
 */
export function AnimatedParliamentBackground() {
  // Generate stable random particle positions for dust motes
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${12 + (i * 4.7) % 76}%`,
      top: `${18 + (i * 6.3) % 68}%`,
      size: `${2 + (i % 3) * 1.5}px`,
      duration: `${6.5 + (i % 5) * 1.8}s`,
      delay: `${(i % 7) * 0.9}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. High-Res Photographic Scenery with Hardware-Accelerated Ken Burns Motion */}
      <div
        className="absolute -inset-10 bg-cover bg-center transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: 'url(/parliament_study_bg.jpg)',
          animation: 'kenBurnsSlow 28s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* 2. Soft Golden Sunrise Volumetric Light Flare over Dome */}
      <div
        className="absolute -top-20 right-1/4 w-[650px] h-[650px] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.40) 0%, rgba(245, 158, 11, 0.20) 45%, transparent 75%)',
          animation: 'sunBeamPulse 10s ease-in-out infinite',
        }}
      />

      {/* 3. Secondary Warm Ambient Glow on Left Horizon */}
      <div
        className="absolute top-1/4 left-10 w-[450px] h-[450px] rounded-full blur-[90px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.12) 50%, transparent 80%)',
        }}
      />

      {/* 4. Delicate Animated Coffee Mug Steam (matches foreground mug position) */}
      <div className="hidden lg:block absolute bottom-28 right-[13.5%] w-10 h-16 pointer-events-none">
        <div
          className="absolute bottom-0 left-2 w-2 h-10 rounded-full blur-[3px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.45), transparent)',
            animation: 'steamFloat 4s ease-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 left-4 w-2 h-12 rounded-full blur-[3px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.55), transparent)',
            animation: 'steamFloat 4.8s ease-out infinite 1.2s',
          }}
        />
        <div
          className="absolute bottom-0 left-1 w-2.5 h-8 rounded-full blur-[3px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.35), transparent)',
            animation: 'steamFloat 3.6s ease-out infinite 2.2s',
          }}
        />
      </div>

      {/* 5. Floating Sunlight Dust Motes */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-100 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
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

      {/* 6. Subtle Daylight Gradient Overlay (Preserves photorealism while guaranteeing high text contrast) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.05) 0%, rgba(15, 23, 42, 0.22) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(240, 246, 255, 0.10) 45%, rgba(15, 23, 42, 0.40) 100%)',
        }}
      />
    </div>
  );
}
