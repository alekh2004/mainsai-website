import React, { useEffect, useRef, useState } from 'react';

/**
 * Skiper UI & Animaster Lab Scroll-Triggered Reveal Wrapper.
 * More dramatic entrance: larger distance, scale pop, blur clearance.
 * Works perfectly on both mobile and desktop.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 48,
  duration = 700,
  threshold = 0.1,
  once = true,
  style = {},
  blur = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getHiddenTransform = () => {
    switch (direction) {
      case 'up':    return `translate3d(0, ${distance}px, 0) scale(0.96)`;
      case 'down':  return `translate3d(0, -${distance}px, 0) scale(0.96)`;
      case 'left':  return `translate3d(${distance}px, 0, 0) scale(0.96)`;
      case 'right': return `translate3d(-${distance}px, 0, 0) scale(0.96)`;
      case 'zoom':  return 'scale(0.85)';
      case 'flip':  return 'perspective(600px) rotateX(25deg) scale(0.92)';
      default:      return 'scale(0.92)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : getHiddenTransform(),
        filter: blur ? (isVisible ? 'blur(0px)' : 'blur(4px)') : undefined,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms ease ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
