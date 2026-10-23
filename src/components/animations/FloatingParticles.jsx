import React, { useEffect, useRef } from 'react';

/**
 * CSS-only Floating Particles Background — no library.
 * Instagram viral ambient effect for hero sections.
 */
export function FloatingParticles({ count = 20, className = '' }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-10px',
            background: `radial-gradient(circle, rgba(139,92,246,${p.opacity}), rgba(59,130,246,${p.opacity * 0.5}))`,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 2}px rgba(139,92,246,${p.opacity})`,
          }}
        />
      ))}
    </div>
  );
}
