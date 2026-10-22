import React, { useState, useRef } from 'react';

/**
 * Aceternity UI 3D Tilt Card with dynamic Cursor Spotlight & Moving Border.
 * Generates the iconic Instagram-viral 3D perspective depth effect.
 */
export function AceternityCard({
  children,
  className = '',
  spotlightColor = 'rgba(99, 102, 241, 0.18)',
  glowBorder = true,
  onClick,
  style = {},
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCoords({ x, y });

    // Calculate rotation (-6 to 6 deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl transition-transform duration-200 ease-out preserve-3d overflow-hidden ${className}`}
      style={{
        ...style,
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.015, 1.015, 1.015)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        willChange: 'transform',
      }}
    >
      {/* Aceternity Moving Border Beam (Subtle Glow Perimeter) */}
      {glowBorder && (
        <div
          className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
            backgroundSize: '300% 300%',
            animation: 'movingBorder 4s linear infinite',
            zIndex: 0,
            opacity: isHovered ? 0.6 : 0,
          }}
        />
      )}

      {/* Dynamic Cursor Spotlight Beam */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Inner Card Content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}
