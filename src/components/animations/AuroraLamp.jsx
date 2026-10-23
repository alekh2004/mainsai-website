import React from 'react';

/**
 * Elegant Atmospheric Ambient Lighting — Soft, Executive & Minimal
 * Creates subtle depth without distracting, high-powered neon colors.
 */
export function AuroraLamp({ className = '', intensity = 'low' }) {
  const opacity = intensity === 'high' ? 0.22 : intensity === 'medium' ? 0.15 : 0.09;

  return (
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-4xl h-56 pointer-events-none overflow-hidden ${className}`}>
      {/* Soft Center Radial Glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[550px] h-[220px] rounded-full blur-[90px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.35) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 80%)',
          opacity,
        }}
      />
    </div>
  );
}
