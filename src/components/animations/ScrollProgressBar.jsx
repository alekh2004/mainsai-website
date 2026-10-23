import React, { useEffect, useState } from 'react';

/**
 * Neon Glowing Scroll Progress Bar — works on BOTH mobile and desktop.
 * Tracks window scroll (document.documentElement) for mobile compatibility.
 */
export function ScrollProgressBar({ containerRef = null }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // Try container ref first (desktop), fallback to window (mobile)
      let current, total;
      const el = containerRef?.current;
      if (el && el.scrollHeight > el.clientHeight) {
        current = el.scrollTop;
        total = el.scrollHeight - el.clientHeight;
      } else {
        const doc = document.documentElement;
        current = doc.scrollTop || document.body.scrollTop;
        total = doc.scrollHeight - doc.clientHeight;
      }
      const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
      setProgress(pct);
    };

    // Listen on both container and window
    const el = containerRef?.current;
    if (el) el.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      if (el) el.removeEventListener('scroll', updateProgress);
      window.removeEventListener('scroll', updateProgress);
    };
  }, [containerRef]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.08)' }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.8), 0 0 24px rgba(99, 102, 241, 0.4)',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
