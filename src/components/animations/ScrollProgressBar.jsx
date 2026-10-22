import React, { useState, useEffect } from 'react';

/**
 * Skiper UI & Aceternity inspired dynamic glowing Scroll Progress Bar.
 * Tracks the scroll depth of the main content container and renders a neon gradient beam.
 */
export function ScrollProgressBar({ containerRef }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const target = containerRef?.current || window;

    const handleScroll = () => {
      let progress = 0;
      if (containerRef?.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const total = scrollHeight - clientHeight;
        progress = total > 0 ? (scrollTop / total) * 100 : 0;
      } else {
        const { scrollY, innerHeight } = window;
        const total = document.documentElement.scrollHeight - innerHeight;
        progress = total > 0 ? (scrollY / total) * 100 : 0;
      }
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return (
    <div className="sticky top-0 left-0 right-0 z-40 h-[3px] w-full overflow-hidden pointer-events-none">
      {/* Background track (subtle) */}
      <div className="absolute inset-0 bg-white/[0.04]" />
      
      {/* Active Glowing Beam */}
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #f59e0b 100%)',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.7), 0 0 24px rgba(59, 130, 246, 0.4)',
        }}
      />
    </div>
  );
}
