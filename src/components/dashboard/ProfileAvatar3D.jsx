import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function ProfileAvatar3D({ user }) {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const isFemale =
    user?.gender === 'female' ||
    (user?.name &&
      /priya|pooja|neha|sneha|anjali|swati|deepika|divya|nisha|radha|anushka|shreya|riya|tanu|simran/i.test(
        user.name
      ));

  const colorImgUrl = isFemale ? '/avatar_girl_cropped.jpg' : '/avatar_boy_cropped.jpg';
  const depthImgUrl = isFemale ? '/avatar_girl_depth.jpg' : '/avatar_boy_depth.jpg';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 128;
    const height = container.clientHeight || 128;

    // ── 1. Scene & Camera ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 2.85);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return;
    }

    // ── 2. Texture Loading (Color + Depth Map) ──────────────────────────
    const textureLoader = new THREE.TextureLoader();

    let colorTexture;
    let depthTexture;

    // Custom 3D Volumetric Depth & Parallax Shader
    const customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColorMap: { value: null },
        uDepthMap: { value: null },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uDisplacementScale: { value: 0.28 },
        uParallaxScale: { value: 0.055 },
        uRimColor: { value: new THREE.Color(isFemale ? 0xf472b6 : 0x38bdf8) },
      },
      vertexShader: `
        uniform sampler2D uDepthMap;
        uniform float uDisplacementScale;
        uniform vec2 uMouse;
        uniform float uTime;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vDepth;

        void main() {
          vUv = uv;

          // Sample depth from high-res depth map
          float depthVal = texture2D(uDepthMap, uv).r;
          vDepth = depthVal;

          // Displace 3D geometry along normal (face & nose push forward, background recedes)
          vec3 displacedPos = position;
          displacedPos.z += (depthVal - 0.25) * uDisplacementScale;

          // Interactive 3D curvature and tilt
          displacedPos.x += (uv.x - 0.5) * (depthVal * 0.08);

          vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
        }
      `,
      fragmentShader: `
        uniform sampler2D uColorMap;
        uniform sampler2D uDepthMap;
        uniform vec2 uMouse;
        uniform float uTime;
        uniform float uParallaxScale;
        uniform vec3 uRimColor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vDepth;

        void main() {
          // 1. Interactive 3D Parallax Occlusion Offset
          // When mouse moves, pixels with higher depth (face, nose) move relative to background
          float depth = texture2D(uDepthMap, vUv).r;
          vec2 parallaxOffset = uMouse * (depth - 0.35) * uParallaxScale;
          vec2 sampleUv = clamp(vUv + parallaxOffset, 0.002, 0.998);

          vec4 color = texture2D(uColorMap, sampleUv);

          // 2. 3D Lighting & Specular glint calculation
          vec3 viewDir = normalize(vViewPosition);
          vec3 lightDir = normalize(vec3(0.5, 0.8, 1.2)); // Key light
          vec3 rimLightDir = normalize(vec3(-0.4, 0.6, -0.8)); // Rim backlight

          // Diffuse shading from depth relief
          float diff = max(dot(vNormal, lightDir), 0.35);

          // Specular glint on face/nose
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0) * (depth * 0.4);

          // Golden/Cyan Rim Edge Light
          float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
          rim = pow(rim, 3.5) * (depth * 0.45);

          vec3 finalRgb = color.rgb * (diff * 0.85 + 0.25) + vec3(spec) + (uRimColor * rim);

          gl_FragColor = vec4(finalRgb, color.a);
        }
      `,
      transparent: true,
    });

    // ── 3. High-Subdivision 3D Plane Mesh ───────────────────────────────
    // 96x96 vertices allow micro 3D geometric displacement of face features
    const planeGeo = new THREE.PlaneGeometry(2.1, 2.1, 96, 96);
    const avatarMesh = new THREE.Mesh(planeGeo, customMaterial);
    scene.add(avatarMesh);

    // Load textures
    textureLoader.load(colorImgUrl, (tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      customMaterial.uniforms.uColorMap.value = tex;
      customMaterial.needsUpdate = true;
      setIsLoaded(true);
    });

    textureLoader.load(depthImgUrl, (dTex) => {
      dTex.generateMipmaps = true;
      dTex.minFilter = THREE.LinearMipmapLinearFilter;
      customMaterial.uniforms.uDepthMap.value = dTex;
      customMaterial.needsUpdate = true;
    });

    // ── 4. Interactive 3D Cursor & Touch Tracking ───────────────────────
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Normalized coordinates from center (-1 to 1)
      const nx = (e.clientX - cx) / (window.innerWidth * 0.45);
      const ny = (e.clientY - cy) / (window.innerHeight * 0.45);

      mouseTargetX = THREE.MathUtils.clamp(nx, -1.0, 1.0);
      mouseTargetY = THREE.MathUtils.clamp(-ny, -1.0, 1.0);
    };

    const handleTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      handleMouseMove(e.touches[0]);
    };

    const handleMouseLeave = () => {
      mouseTargetX = 0;
      mouseTargetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // ── 5. Render Loop with Smooth Damping & 3D Idle Breathing ─────────
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for mouse position (cinematic damping)
      currentMouseX = THREE.MathUtils.lerp(currentMouseX, mouseTargetX, 0.075);
      currentMouseY = THREE.MathUtils.lerp(currentMouseY, mouseTargetY, 0.075);

      // Update shader uniforms
      customMaterial.uniforms.uMouse.value.set(currentMouseX, currentMouseY);
      customMaterial.uniforms.uTime.value = elapsedTime;

      // Idle breathing movement (smooth 3D floating)
      const breathing = Math.sin(elapsedTime * 2.2) * 0.025;
      avatarMesh.position.y = breathing;

      // Real 3D Mesh Rotation & Spatial Pivot
      // Mesh turns left/right/up/down towards the user's cursor
      avatarMesh.rotation.y = currentMouseX * 0.42;
      avatarMesh.rotation.x = -currentMouseY * 0.32;

      renderer.render(scene, camera);
    };

    animate();

    // ── 6. Cleanup on Unmount ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);

      planeGeo.dispose();
      customMaterial.dispose();
      colorTexture?.dispose();
      depthTexture?.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [colorImgUrl, depthImgUrl, isFemale]);

  return (
    <div className="relative group shrink-0 select-none">
      {/* Clean, Luxurious Obsidian/Titanium Bezel (NO gaudy neon, NO waving hand) */}
      <div
        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-2 border-white/20 shadow-2xl overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 1))',
          boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Three.js Interactive 3D Spatial Canvas */}
        <div
          ref={containerRef}
          className="w-full h-full rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
        />

        {/* Static Image Fallback until WebGL loads */}
        {!isLoaded && (
          <img
            src={colorImgUrl}
            alt="3D Aspirant Avatar"
            className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none"
          />
        )}

        {/* Ambient Darkened Bottom Vignette for Studio Depth */}
        <div
          className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)',
          }}
        />
      </div>

      {/* Clean, Luxury Pill Badge: 3D SPATIAL */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border border-white/15 text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 backdrop-blur-md"
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          color: isFemale ? '#f472b6' : '#38bdf8',
        }}
        title="Interactive 3D Depth Spatial Avatar: Move cursor to rotate in 3D"
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: isFemale ? '#f472b6' : '#38bdf8' }}
        />
        <span>3D SPATIAL</span>
      </div>
    </div>
  );
}
