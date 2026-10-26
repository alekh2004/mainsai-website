import React, { useEffect, useRef } from 'react';

export function RibbonCanvas3D({ color = '#3b82f6', isHovered = false, theme = 'blue' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const hoverRef = useRef(isHovered);

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let time = Math.random() * 10;

    // Theme color palettes for neon glowing ribs
    const themeGlowMap = {
      blue: {
        ribbonSkin: 'rgba(59, 130, 246, 0.22)',
        glow: 'rgba(59, 130, 246, 0.85)',
        secondary: '#60a5fa',
        deep: 'rgba(15, 23, 42, 0.15)',
      },
      orange: {
        ribbonSkin: 'rgba(249, 115, 22, 0.22)',
        glow: 'rgba(249, 115, 22, 0.85)',
        secondary: '#fb923c',
        deep: 'rgba(30, 10, 5, 0.15)',
      },
      purple: {
        ribbonSkin: 'rgba(168, 85, 247, 0.22)',
        glow: 'rgba(168, 85, 247, 0.85)',
        secondary: '#c084fc',
        deep: 'rgba(25, 10, 35, 0.15)',
      },
    };

    const currentTheme = themeGlowMap[theme] || themeGlowMap.orange;

    // Resize canvas for crisp High-DPI screens
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Mouse movement tracking for interactive 3D wave response
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0.5;
      mouseRef.current.targetY = 0.5;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // ── 60 FPS Render Loop: Serpentine Neon Ribbed 3D Wave ──
    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (W === 0 || H === 0) return;

      const isHov = hoverRef.current;
      const speed = isHov ? 0.038 : 0.022;
      time += speed;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, W, H);

      // Subtle ambient background illumination
      const bgRadial = ctx.createRadialGradient(
        W * mouseRef.current.x,
        H * mouseRef.current.y,
        10,
        W / 2,
        H / 2,
        W * 0.7
      );
      bgRadial.addColorStop(0, currentTheme.ribbonSkin);
      bgRadial.addColorStop(1, 'rgba(3, 6, 17, 0)');
      ctx.fillStyle = bgRadial;
      ctx.fillRect(0, 0, W, H);

      const ribCount = W < 300 ? 55 : 72;
      const topPts = [];
      const botPts = [];

      ctx.save();
      ctx.shadowColor = currentTheme.glow;
      ctx.shadowBlur = isHov ? 20 : 12;

      const mouseOffsetY = (mouseRef.current.y - 0.5) * 28;
      const mouseInfluenceX = (mouseRef.current.x - 0.5) * 0.8;

      // ── Step 1: Calculate coordinates for all 3D serpentine ribs ──
      for (let i = 0; i <= ribCount; i++) {
        const progress = i / ribCount;
        const x = 20 + progress * (W - 40);

        // Multi-frequency wave calculations mimicking 3D ribbon twists
        const wave1 = Math.sin(progress * 4.4 - time + mouseInfluenceX) * (isHov ? 32 : 26);
        const wave2 = Math.cos(progress * 6.8 + time * 0.85) * (isHov ? 14 : 10);
        const wave3 = Math.sin(progress * 2.2 + time * 1.2) * 8;

        const centerY = H / 2 + wave1 + wave2 + wave3 + mouseOffsetY;

        // Dynamic rib height gives taper at edges and fullness in center
        const ribHeight = (isHov ? 56 : 48) + Math.sin(progress * Math.PI) * 20;

        // Angle tilt generates 3D perspective orientation
        const tiltAngle = Math.cos(progress * 3.6 - time) * 0.48;

        const dx = Math.sin(tiltAngle) * (ribHeight / 2);
        const dy = Math.cos(tiltAngle) * (ribHeight / 2);

        const x1 = x - dx;
        const y1 = centerY - dy;
        const x2 = x + dx;
        const y2 = centerY + dy;

        topPts.push({ x: x1, y: y1 });
        botPts.push({ x: x2, y: y2 });

        // Draw individual glowing vertical rib fin
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        // Specular white tip crest
        grad.addColorStop(0, '#ffffff');
        // Intense saturated neon core
        grad.addColorStop(0.25, color);
        // Rich midtone
        grad.addColorStop(0.65, currentTheme.secondary);
        // Fade to translucent dark depth
        grad.addColorStop(1, currentTheme.deep);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isHov ? 2.4 : 1.9;
        ctx.stroke();
      }

      // ── Step 2: Draw continuous undulating translucent ribbon skin ──
      if (topPts.length > 0 && botPts.length > 0) {
        ctx.beginPath();
        ctx.moveTo(topPts[0].x, topPts[0].y);

        for (let i = 1; i < topPts.length; i++) {
          ctx.lineTo(topPts[i].x, topPts[i].y);
        }
        for (let i = botPts.length - 1; i >= 0; i--) {
          ctx.lineTo(botPts[i].x, botPts[i].y);
        }
        ctx.closePath();

        const skinGrad = ctx.createLinearGradient(0, 0, W, H);
        skinGrad.addColorStop(0, currentTheme.ribbonSkin);
        skinGrad.addColorStop(0.5, isHov ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)');
        skinGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

        ctx.fillStyle = skinGrad;
        ctx.fill();

        // Subtle glowing highlight stroke along the crest edge
        ctx.beginPath();
        ctx.moveTo(topPts[0].x, topPts[0].y);
        for (let i = 1; i < topPts.length; i++) {
          ctx.lineTo(topPts[i].x, topPts[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [color, theme]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none pointer-events-auto"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(12, 18, 36, 0.9) 0%, #030611 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
