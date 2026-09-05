import React from 'react';
import { useApp } from '../../context/AppContext';

/**
 * 1. Neon Glassmorphic World Map Matrix
 * Full screen high-tech neon cyber world map with global nodes, arcs, radar scanner, and telemetry
 */
export function NeonWorldMap() {
  return (
    <div className="neon-worldmap-bg">
      {/* Deep atmospheric glowing orbs */}
      <div className="neon-orb neon-orb-1" />
      <div className="neon-orb neon-orb-2" />
      <div className="neon-orb neon-orb-3" />
      <div className="neon-orb neon-orb-4" />

      {/* Cyber Grid Mesh */}
      <div className="neon-grid" />

      {/* Full-Screen Cyber World Map SVG */}
      <div className="worldmap-svg-wrap">
        <svg
          viewBox="0 0 1200 640"
          className="worldmap-svg"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mapNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent3))" stopOpacity="0.75" />
              <stop offset="50%" stopColor="rgb(var(--accent))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(var(--accent2))" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(var(--accent3))" stopOpacity="0.1" />
              <stop offset="50%" stopColor="rgb(var(--accent))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(var(--accent2))" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent3))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
            </linearGradient>

            <pattern id="dotPattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgb(var(--accent))" fillOpacity="0.3" />
            </pattern>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Latitude & Longitude Coordinate Lines */}
          <g className="map-latlong" stroke="rgb(var(--accent))" strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="3 3">
            <line x1="100" y1="120" x2="1100" y2="120" />
            <line x1="100" y1="240" x2="1100" y2="240" />
            <line x1="100" y1="360" x2="1100" y2="360" />
            <line x1="100" y1="480" x2="1100" y2="480" />

            <line x1="220" y1="60" x2="220" y2="580" />
            <line x1="420" y1="60" x2="420" y2="580" />
            <line x1="620" y1="60" x2="620" y2="580" />
            <line x1="820" y1="60" x2="820" y2="580" />
            <line x1="1020" y1="60" x2="1020" y2="580" />
          </g>

          {/* Stylized Continents Shape (Vector Matrix) */}
          <g className="continents-group" stroke="url(#mapNeonGrad)" strokeWidth="1.2" fill="url(#dotPattern)" filter="url(#neonGlow)">
            {/* North America */}
            <path d="M160,110 Q200,80 280,90 Q340,110 320,170 Q280,220 250,260 Q210,290 190,270 Q160,220 150,180 Z" />
            {/* Alaska / Northwest */}
            <path d="M110,95 Q140,85 160,105 Q140,135 110,120 Z" />
            {/* Greenland */}
            <path d="M380,60 Q430,55 450,90 Q430,130 390,110 Z" />

            {/* South America */}
            <path d="M260,310 Q320,320 350,380 Q340,460 300,520 Q270,530 260,460 Q240,380 260,310 Z" />

            {/* Europe */}
            <path d="M520,110 Q580,95 620,130 Q610,180 570,210 Q520,200 510,160 Z" />
            {/* Scandinavia */}
            <path d="M540,65 Q580,60 590,100 Q560,120 540,95 Z" />
            {/* UK / Ireland */}
            <path d="M490,120 Q515,115 510,150 Q485,150 490,120 Z" />

            {/* Africa */}
            <path d="M510,230 Q600,230 630,300 Q630,390 590,460 Q550,470 520,390 Q490,320 510,230 Z" />
            {/* Madagascar */}
            <path d="M645,410 Q660,400 655,445 Q640,450 645,410 Z" />

            {/* Asia & Russia */}
            <path d="M630,100 Q780,80 920,110 Q980,160 960,230 Q900,270 850,260 Q760,250 720,220 Q660,220 630,170 Z" />
            
            {/* Indian Subcontinent (Prominently Highlighted) */}
            <path 
              d="M710,225 Q770,230 780,280 Q760,360 740,385 Q725,360 705,300 Q695,250 710,225 Z" 
              stroke="rgb(var(--accent))" 
              strokeWidth="2.2" 
              fill="rgb(var(--accent)/0.18)"
              className="india-continent-glow"
            />

            {/* East Asia / Japan / Southeast Asia */}
            <path d="M860,220 Q920,220 940,290 Q890,330 840,300 Z" />
            <path d="M960,180 Q980,185 970,240 Q950,230 960,180 Z" />
            <path d="M800,340 Q850,345 860,390 Q810,400 800,340 Z" />

            {/* Australia & Oceania */}
            <path d="M880,410 Q980,400 1010,460 Q980,530 910,530 Q860,490 880,410 Z" />
            <path d="M1025,490 Q1050,495 1040,540 Q1020,535 1025,490 Z" />
          </g>

          {/* Cyber Connecting Arcs & Data Flow */}
          <g className="cyber-arcs" strokeWidth="1.5" fill="none">
            {/* India (New Delhi / Patna) to Global Nodes */}
            <path d="M740,300 Q600,160 550,150" stroke="url(#arcGrad1)" className="cyber-arc arc-1" />
            <path d="M740,300 Q500,200 240,160" stroke="url(#arcGrad1)" className="cyber-arc arc-2" />
            <path d="M740,300 Q840,220 960,210" stroke="url(#arcGrad1)" className="cyber-arc arc-3" />
            <path d="M740,300 Q830,380 940,460" stroke="url(#arcGrad1)" className="cyber-arc arc-4" />
            <path d="M740,300 Q640,360 570,360" stroke="url(#arcGrad1)" className="cyber-arc arc-5" />
            <path d="M740,300 Q520,380 300,430" stroke="url(#arcGrad1)" className="cyber-arc arc-6" />

            {/* Transatlantic & Pacific Arcs */}
            <path d="M240,160 Q380,80 550,150" stroke="url(#arcGrad1)" strokeDasharray="4 4" opacity="0.4" />
            <path d="M550,150 Q720,80 960,210" stroke="url(#arcGrad1)" strokeDasharray="4 4" opacity="0.4" />
          </g>

          {/* Global Node Hotspots */}
          <g className="cyber-nodes">
            {/* Major Node: NEW DELHI / PATNA (UPSC / BPSC Command Hub) */}
            <g transform="translate(740, 300)" className="hub-node">
              <circle r="18" fill="rgb(var(--accent)/0.15)" className="pulse-ring" />
              <circle r="10" fill="rgb(var(--accent)/0.35)" className="pulse-ring-inner" />
              <circle r="5" fill="rgb(var(--accent))" />
              <circle r="2.5" fill="#ffffff" />
              <text x="14" y="4" fill="rgb(var(--accent3))" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                UPSC/BPSC HQ [28.6°N, 77.2°E]
              </text>
            </g>

            {/* Other Global Hubs */}
            {[
              { x: 240, y: 160, label: 'US EAST' },
              { x: 550, y: 150, label: 'LONDON/EU' },
              { x: 570, y: 360, label: 'AFRICA HUB' },
              { x: 960, y: 210, label: 'TOKYO' },
              { x: 940, y: 460, label: 'SYDNEY' },
              { x: 300, y: 430, label: 'BRASILIA' }
            ].map((node, i) => (
              <g key={i} transform={`translate(${node.x}, ${node.y})`}>
                <circle r="8" fill="rgb(var(--accent)/0.15)" className="pulse-ring-slow" />
                <circle r="3.5" fill="rgb(var(--accent3))" />
                <circle r="1.5" fill="#ffffff" />
                <text x="8" y="3" fill="rgb(var(--accent))" fillOpacity="0.6" fontSize="8" fontWeight="600" fontFamily="monospace">
                  {node.label}
                </text>
              </g>
            ))}
          </g>

          {/* Rotating Radar Scanner Circle over India / Indian Ocean */}
          <g transform="translate(740, 300)" className="radar-scanner">
            <circle r="120" stroke="rgb(var(--accent))" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="6 6" fill="none" />
            <circle r="70" stroke="rgb(var(--accent))" strokeOpacity="0.25" strokeWidth="1" fill="none" />
            <line x1="0" y1="0" x2="120" y2="0" stroke="url(#mapNeonGrad)" strokeWidth="2" className="radar-needle" />
          </g>
        </svg>
      </div>

      {/* Cyber Telemetry & HUD Markers (Corners) */}
      <div className="map-hud-overlay">
        <div className="hud-top-left">
          <div className="hud-label">GLOBAL AI EVALUATION MATRIX</div>
          <div className="hud-value">STATUS: ACTIVE // QUANTUM MODEL ONLINE</div>
        </div>
        <div className="hud-bottom-right">
          <div className="hud-label">SYS_COORD: 28.6139° N, 77.2090° E</div>
          <div className="hud-value">UPSC DHOLPUR HOUSE // BPSC PATNA GRID</div>
        </div>
      </div>

      {/* Neon Scanning line */}
      <div className="neon-scanline" />
    </div>
  );
}

/**
 * 2. Neon Universe Background
 */
export function NeonUniverse() {
  return (
    <div className="neon-universe">
      <div className="neon-orb neon-orb-1" />
      <div className="neon-orb neon-orb-2" />
      <div className="neon-orb neon-orb-3" />
      <div className="neon-orb neon-orb-4" />
      <div className="neon-grid" />
      <div className="neon-scanline" />
    </div>
  );
}

/**
 * 3. Aurora Cyber Waves
 */
export function AuroraWaves() {
  return (
    <div className="neon-universe aurora-theme">
      <div className="aurora-wave aurora-wave-1" />
      <div className="aurora-wave aurora-wave-2" />
      <div className="aurora-wave aurora-wave-3" />
      <div className="neon-grid" />
      <div className="neon-scanline" />
    </div>
  );
}

/**
 * 4. Minimal Grid / Clean Space
 */
export function MinimalGrid() {
  return (
    <div className="neon-universe minimal-theme">
      <div className="neon-grid" style={{ opacity: 0.35 }} />
      <div className="neon-orb neon-orb-1" style={{ opacity: 0.15 }} />
      <div className="neon-orb neon-orb-2" style={{ opacity: 0.15 }} />
    </div>
  );
}

/**
 * Master Background Switcher
 */
export function BackgroundRenderer() {
  const { bgStyle } = useApp();

  switch (bgStyle) {
    case 'world-map':
      return <NeonWorldMap />;
    case 'universe':
      return <NeonUniverse />;
    case 'aurora':
      return <AuroraWaves />;
    case 'minimal':
      return <MinimalGrid />;
    default:
      return <NeonWorldMap />;
  }
}
