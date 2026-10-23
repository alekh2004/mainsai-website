import React, { useState, useRef, useEffect } from 'react';

/**
 * Aceternity UI 3D Tilt Card — Mobile + Desktop
 * - Desktop: 3D tilt + cursor spotlight + moving border glow
 * - Mobile: Entrance animation + static glow (no tilt — saves GPU)
 */
export function AceternityCard({
  children,
  className = '',
  spotlightColor = 'rgba(99, 102, 241, 0.22)',
  glowBorder = true,
  onClick,
  style = {},
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isTouchDevice] = useState(() =>
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Entrance animation on mount
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsHovered(false);
      setRotate({ x: 0, y: 0 });
    }
  };

  // Touch: light press scale
  const handleTouchStart = () => setIsHovered(true);
  const handleTouchEnd = () => setTimeout(() => setIsHovered(false), 300);

  const getTransform = () => {
    if (isTouchDevice) {
      return isHovered ? 'scale(0.97)' : mounted ? 'scale(1)' : 'scale(0.96) translateY(8px)';
    }
    return isHovered
      ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.025, 1.025, 1.025)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative rounded-3xl transition-all duration-300 ease-out preserve-3d overflow-hidden ${className}`}
      style={{
        ...style,
        transform: getTransform(),
        opacity: mounted ? 1 : 0,
        willChange: isTouchDevice ? 'auto' : 'transform',
      }}
    >
      {/* Moving Border Beam */}
      {glowBorder && (
        <div
          className="absolute -inset-[1px] rounded-3xl pointer-events-none transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6)',
            backgroundSize: '300% 300%',
            animation: 'movingBorder 4s linear infinite',
            zIndex: 0,
            opacity: isHovered ? 0.7 : 0,
          }}
        />
      )}

      {/* Cursor Spotlight (desktop only) */}
      {!isTouchDevice && (
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Static glow on mobile when hovered/pressed */}
      {isTouchDevice && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${spotlightColor}, transparent 70%)`,
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
