import React, { useEffect, useRef, useState } from 'react';

/**
 * Skiper UI Word-by-Word Text Reveal — Instagram Viral Effect.
 * Splits text into words and animates each individually on scroll.
 */
export function TextReveal({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
  wordDelay = 80,
  duration = 600,
  as: Tag = 'span',
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef(null);
  const words = (text || '').split(' ').filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(el);
          words.forEach((_, i) => {
            setTimeout(() => setVisibleCount(i + 1), delay + i * wordDelay);
          });
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text, delay, wordDelay]);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`inline-block ${wordClassName}`}
          style={{
            opacity: visibleCount > i ? 1 : 0,
            transform: visibleCount > i ? 'translateY(0)' : 'translateY(16px)',
            transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1), transform ${duration}ms cubic-bezier(0.16,1,0.3,1)`,
            marginRight: '0.3em',
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
