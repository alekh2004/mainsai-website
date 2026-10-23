import React, { useEffect, useRef, useState } from 'react';

/**
 * Animated Counter — count-up with easing + optional suffix/prefix.
 * Uses IntersectionObserver so it only starts when visible (on scroll).
 */
export function AnimatedNumber({
  value,
  duration = 1800,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
  style = {},
  once = true,
}) {
  const [display, setDisplay] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const ref = useRef(null);
  const rafRef = useRef(null);

  const runAnimation = () => {
    const target = Number(value) || 0;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Expo ease out
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * target;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasRun)) {
          setHasRun(true);
          runAnimation();
          if (once) observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, once]);

  const formatted = display.toFixed(decimals);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
