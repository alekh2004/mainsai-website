import React, { useState, useRef } from 'react';

/**
 * Professional Glass Tilt Card — Subtle, Elegant & Responsive
 * - Desktop: Subtle 3D depth tilt (±3°) + soft ambient cursor highlight
 * - Mobile/Touch: Clean tactile press response without harsh neon flashes
 * - Retains clean executive look without distracting high-power neon borders
 */
export function AceternityCard({
  children,
  className = '',
  spotlightColor = 'rgba(99, 102, 241, 0.07)',
  glowBorder = false,
  onClick,
  style = {},
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isTouch] = useState(() =>
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  const handleMouseMove = (e) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Gentle 3.5 deg tilt max for executive feel
    const rotateX = ((y - centerY) / centerY) * -3.5;
    const rotateY = ((x - centerX) / centerX) * 3.5;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsHovered(false);
      setRotate({ x: 0, y: 0 });
    }
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
        transform: !isTouch && isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.01, 1.01, 1.01)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        willChange: isTouch ? 'auto' : 'transform',
      }}
    >
      {/* Soft, subtle border highlight on hover (not blinding neon) */}
      {glowBorder && (
        <div
          className="absolute -inset-px rounded-3xl pointer-events-none transition-opacity duration-300"
          style={{
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: isHovered ? '0 0 16px rgba(99, 102, 241, 0.12)' : 'none',
            opacity: isHovered ? 1 : 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Gentle Cursor Ambient Glow (Desktop only, low intensity) */}
      {!isTouch && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Inner Content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}
