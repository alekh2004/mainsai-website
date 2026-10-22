import React from 'react';

/**
 * Aceternity UI Lamp & Aurora Background Effect.
 * Creates the signature glowing atmospheric lighting effect trending on modern dashboards.
 */
export function AuroraLamp({ className = '', intensity = 'medium' }) {
  const opacity = intensity === 'high' ? 0.45 : intensity === 'low' ? 0.2 : 0.32;

  return (
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-5xl h-72 pointer-events-none overflow-hidden ${className}`}>
      {/* Conic Lamp Rays */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[80px] opacity-70 animate-pulse"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, #3b82f6 0deg, #8b5cf6 120deg, #ec4899 240deg, #3b82f6 360deg)',
          opacity,
          animationDuration: '8s',
        }}
      />

      {/* Center Spotlight Beam */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full blur-[60px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 80%)',
        }}
      />
    </div>
  );
}
