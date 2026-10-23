import React from 'react';

/**
 * Aceternity UI Animated Aurora Lamp — rotating, pulsing, dramatic.
 * Now with CSS rotation animation for the conic gradient.
 */
export function AuroraLamp({ className = '', intensity = 'medium', colors = null }) {
  const opacity = intensity === 'high' ? 0.55 : intensity === 'low' ? 0.22 : 0.38;
  const defaultColors = colors || ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-5xl h-80 pointer-events-none overflow-hidden ${className}`}>
      {/* Rotating Conic Lamp Rays */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[90px]"
        style={{
          background: `conic-gradient(from 180deg at 50% 50%, ${defaultColors[0]} 0deg, ${defaultColors[1]} 120deg, ${defaultColors[2]} 240deg, ${defaultColors[3] || defaultColors[0]} 320deg, ${defaultColors[0]} 360deg)`,
          opacity,
          animation: 'auroraRotate 12s linear infinite, auroraPulse 6s ease-in-out infinite',
        }}
      />

      {/* Center Glow Beam */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[70px]"
        style={{
          background: `radial-gradient(ellipse at center, ${defaultColors[1]}55 0%, ${defaultColors[0]}22 50%, transparent 80%)`,
          animation: 'auroraPulse 4s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Side wisps */}
      <div
        className="absolute top-4 left-0 w-[200px] h-[150px] rounded-full blur-[60px]"
        style={{
          background: `radial-gradient(ellipse, ${defaultColors[2]}33, transparent 70%)`,
          animation: 'auroraPulse 7s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute top-4 right-0 w-[200px] h-[150px] rounded-full blur-[60px]"
        style={{
          background: `radial-gradient(ellipse, ${defaultColors[0]}33, transparent 70%)`,
          animation: 'auroraPulse 7s ease-in-out infinite',
          animationDelay: '3.5s',
        }}
      />
    </div>
  );
}
