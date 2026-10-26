import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function RibbonCanvas3D({ color = '#3b82f6', isHovered = false, theme = 'blue' }) {
  const containerRef = useRef(null);
  const hoverRef = useRef(isHovered);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let renderer;
    let scene;
    let camera;
    let mesh;
    let geometry;
    let material;
    let bumpTexture;

    try {
      const width = container.clientWidth || 320;
      const height = container.clientHeight || 150;

      // ── 1. Scene & Camera ──────────────────────────────────────────────
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 3.0);

      // ── 2. WebGL Renderer with High-DPI Support ────────────────────────
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // ── 3. Procedural Metallic Ribbed Texture (Like Scrolltide Artwork) ──
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = 256;
      bumpCanvas.height = 256;
      const bCtx = bumpCanvas.getContext('2d');
      bCtx.fillStyle = '#222222';
      bCtx.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 256; y += 4) {
        bCtx.fillStyle = y % 8 === 0 ? '#ffffff' : '#444444';
        bCtx.fillRect(0, y, 256, 3);
      }
      bumpTexture = new THREE.CanvasTexture(bumpCanvas);
      bumpTexture.wrapS = THREE.RepeatWrapping;
      bumpTexture.wrapT = THREE.RepeatWrapping;
      bumpTexture.repeat.set(16, 1);

      // ── 4. Ribbon Geometry & Physical Metallic Material ────────────────
      geometry = new THREE.PlaneGeometry(3.8, 1.25, 75, 18);

      const planColorObj = new THREE.Color(color);

      material = new THREE.MeshPhysicalMaterial({
        color: planColorObj,
        emissive: planColorObj,
        emissiveIntensity: 0.18,
        metalness: 0.92,
        roughness: 0.22,
        clearcoat: 1.0,
        clearcoatRoughness: 0.12,
        reflectivity: 0.95,
        bumpMap: bumpTexture,
        bumpScale: 0.06,
        side: THREE.DoubleSide,
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // ── 5. Cinematic Studio Lighting ──────────────────────────────────
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambientLight);

      // Bright key light from above
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(2, 3, 3);
      scene.add(keyLight);

      // Colored Neon Rim light from below-left
      const rimLight = new THREE.PointLight(color, 4.0, 10);
      rimLight.position.set(-2.5, -2, 2.5);
      scene.add(rimLight);

      // Dynamic cursor point light
      const cursorLight = new THREE.PointLight(0xffffff, 1.5, 6);
      cursorLight.position.set(0, 0, 2);
      scene.add(cursorLight);

      // ── 6. Mouse Tracking on Container ────────────────────────────────
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = x * 0.4;
        mouseRef.current.targetY = y * 0.3;
      };

      const handleMouseLeave = () => {
        mouseRef.current.targetX = 0;
        mouseRef.current.targetY = 0;
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      // ── 7. Animation Loop (60 FPS Smooth Sinusoidal Fluid Wave) ────────
      let time = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const hovered = hoverRef.current;
        const speed = hovered ? 1.7 : 0.95;
        time += delta * speed;

        // Smooth camera zoom on hover
        const targetCamZ = hovered ? 2.65 : 3.0;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;

        // Smooth mouse tracking
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

        cursorLight.position.x = mouseRef.current.x * 2.5;
        cursorLight.position.y = mouseRef.current.y * 1.5;

        // Bloom emissive on hover
        const targetEmissive = hovered ? 0.36 : 0.16;
        material.emissiveIntensity += (targetEmissive - material.emissiveIntensity) * 0.08;

        // Gentle mesh rotation
        mesh.rotation.y = Math.sin(time * 0.4) * 0.12 + mouseRef.current.x * 0.35;
        mesh.rotation.x = Math.cos(time * 0.5) * 0.08 + mouseRef.current.y * 0.25;
        mesh.rotation.z = Math.sin(time * 0.3) * 0.05;

        // Sinusoidal 3D Wave Displacements across the metallic plane
        const pos = geometry.attributes.position;
        const count = pos.count;

        for (let i = 0; i < count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);

          // Complex layered waves creating serpentine ribbon undulations
          const w1 = Math.sin(u * 1.75 + time * 1.8) * 0.44;
          const w2 = Math.cos(u * 2.9 - time * 1.1) * 0.22;
          const w3 = Math.sin(u * 1.2 + time * 0.8) * v * 0.42;
          const twist = Math.cos(u * 0.85 + time) * 0.18;

          pos.setZ(i, w1 + w2 + w3 + twist);
        }

        pos.needsUpdate = true;
        geometry.computeVertexNormals();

        renderer.render(scene, camera);
      };

      animate();

      // Handle Resize
      const handleResize = () => {
        if (!container) return;
        const newW = container.clientWidth || 320;
        const newH = container.clientHeight || 150;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (bumpTexture) bumpTexture.dispose();
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.warn('RibbonCanvas3D WebGL fallback:', err);
    }
  }, [color, theme]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none pointer-events-auto">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Subtle vignette around edges for seamless blending into card background */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(6, 10, 20, 0.88) 100%)`,
        }}
      />
    </div>
  );
}
