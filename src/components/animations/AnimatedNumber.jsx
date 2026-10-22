import React, { useState, useEffect, useRef } from 'react';

/**
 * Animaster Lab & Skiper UI inspired Live Animated Number Counter.
 * Counts up smoothly using an exponential ease-out curve when entering viewport.
 */
export function AnimatedNumber({ value = 0, duration = 1200, suffix = '', prefix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  const targetNumber = Number(value) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCount();
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [targetNumber]);

  const animateCount = () => {
    const startTime = performance.now();
    const startVal = 0;
    const endVal = targetNumber;

    if (endVal === 0) {
      setDisplayValue(0);
      return;
    }

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out expo curve for ultra-smooth buttery finish
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (endVal - startVal) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <span ref={elementRef} className="tabular-nums font-black inline-block">
      {prefix}{displayValue}{suffix}
    </span>
  );
}
