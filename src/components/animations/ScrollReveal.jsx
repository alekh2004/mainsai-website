import React, { useEffect, useRef, useState } from 'react';

/**
 * Ultra-Smooth & Fast Scroll-Triggered Reveal Wrapper.
 * - Zero delay for in-viewport or near-viewport elements on initial load.
 * - Generous 120px rootMargin so content reveals before scrolling into view (no blank gaps).
 * - Snappy 380ms transition without heavy blur, preserving clean performance.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 18,
  duration = 380,
  threshold = 0,
  once = true,
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fast check: If already in or near viewport, reveal immediately without delay
    const rect = el.getBoundingClientRect();
    if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 80) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0,
        rootMargin: '120px 0px 120px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const getHiddenTransform = () => {
    switch (direction) {
      case 'up':    return `translate3d(0, ${distance}px, 0)`;
      case 'down':  return `translate3d(0, -${distance}px, 0)`;
      case 'left':  return `translate3d(${distance}px, 0, 0)`;
      case 'right': return `translate3d(-${distance}px, 0, 0)`;
      case 'zoom':  return 'scale(0.97)';
      default:      return `translate3d(0, ${distance}px, 0)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : getHiddenTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
