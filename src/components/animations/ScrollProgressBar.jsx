import React, { useEffect, useState } from 'react';

/**
 * Sleek, Elegant Scroll Progress Bar
 * - Subtle, clean accent bar on top (2px)
 * - Tracks document scroll for phones and scroll containers for desktop
 */
export function ScrollProgressBar({ containerRef = null }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
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

    const el = containerRef?.current;
    if (el) el.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      if (el) el.removeEventListener('scroll', updateProgress);
      window.removeEventListener('scroll', updateProgress);
    };
  }, [containerRef]);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      style={{ background: 'transparent' }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, rgb(var(--accent)), #6366f1)',
          boxShadow: '0 1px 6px rgba(99, 102, 241, 0.35)',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
