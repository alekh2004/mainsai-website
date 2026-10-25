import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function ProfileAvatar3D({ user }) {
  const containerRef = useRef(null);
  const [is3DReady, setIs3DReady] = useState(false);

  const isFemale =
    user?.gender === 'female' ||
    (user?.name &&
      /priya|pooja|neha|sneha|anjali|swati|deepika|divya|nisha|radha|anushka|shreya|riya|tanu|simran/i.test(
        user.name
      ));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Scene, Camera, Renderer ───────────────────────────────────────
    const width = container.clientWidth || 128;
    const height = container.clientHeight || 128;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 3.4);

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
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
      setIs3DReady(true);
    } catch (e) {
      console.warn('WebGL not supported, falling back to static 3D visual:', e);
      return;
    }

    // ── 2. Blender-Grade 3-Point Studio Lighting ─────────────────────────
    // Key Light (Warm daylight, strong specular)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.8);
    keyLight.position.set(3.5, 4.0, 4.0);
    scene.add(keyLight);

    // Fill Light (Soft cool ambient fill to soften harsh shadows)
    const fillLight = new THREE.DirectionalLight(0x8bc34a, 1.2);
    fillLight.position.set(-4.0, 1.0, 3.0);
    scene.add(fillLight);

    // Rim / Backlight (Golden edge-light, hallmark of professional 3D renders)
    const rimLight = new THREE.DirectionalLight(0xffb74d, 3.8);
    rimLight.position.set(0, 3.0, -3.5);
    scene.add(rimLight);

    // Under-chin bounce light (Simulates desk reflection like the Parliament desk)
    const bounceLight = new THREE.DirectionalLight(0xffffff, 0.7);
    bounceLight.position.set(0, -3.0, 2.0);
    scene.add(bounceLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // ── 3. Character 3D Geometry Hierarchy ──────────────────────────────
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.1, 0);
    avatarGroup.add(headGroup);

    // PBR Materials (Blender style Subsurface & Specular finish)
    const skinColor = isFemale ? 0xf5cfb8 : 0xf2c4a7;
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: skinColor,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    });

    const hairColor = isFemale ? 0x2b1c16 : 0x241812;
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.65,
      metalness: 0.15,
    });

    const clothingColor = isFemale ? 0x4f46e5 : 0x2563eb; // Royal Indigo / Blue Hoodie
    const clothingMaterial = new THREE.MeshStandardMaterial({
      color: clothingColor,
      roughness: 0.85,
      metalness: 0.05,
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.15,
      metalness: 0.05,
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    // 3.1 Head (Stylized Pixar/Blender Proportions)
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    headGeo.scale(1.0, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headGroup.add(headMesh);

    // 3.2 Nose
    const noseGeo = new THREE.ConeGeometry(0.08, 0.16, 16);
    noseGeo.rotateX(Math.PI * 0.5);
    const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
    noseMesh.position.set(0, 0.02, 0.53);
    headGroup.add(noseMesh);

    // 3.3 Eyes (White + Pupils)
    const eyeGroupL = new THREE.Group();
    const eyeGroupR = new THREE.Group();

    const eyeWhiteGeo = new THREE.SphereGeometry(0.12, 20, 20);
    eyeWhiteGeo.scale(1, 1.15, 0.6);

    const pupilGeo = new THREE.SphereGeometry(0.065, 16, 16);
    pupilGeo.scale(1, 1, 0.5);

    const eyeWhiteL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    const pupilL = new THREE.Mesh(pupilGeo, eyeMaterial);
    pupilL.position.set(0.015, 0, 0.06);
    eyeGroupL.add(eyeWhiteL, pupilL);
    eyeGroupL.position.set(-0.19, 0.1, 0.44);

    const eyeWhiteR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    const pupilR = new THREE.Mesh(pupilGeo, eyeMaterial);
    pupilR.position.set(-0.015, 0, 0.06);
    eyeGroupR.add(eyeWhiteR, pupilR);
    eyeGroupR.position.set(0.19, 0.1, 0.44);

    headGroup.add(eyeGroupL, eyeGroupR);

    // 3.4 Eyebrows
    const browGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.22, 12);
    browGeo.rotateZ(Math.PI * 0.45);
    const browL = new THREE.Mesh(browGeo, hairMaterial);
    browL.position.set(-0.19, 0.26, 0.46);
    browL.rotation.z = 0.12;

    const browR = new THREE.Mesh(browGeo, hairMaterial);
    browR.position.set(0.19, 0.26, 0.46);
    browR.rotation.z = -0.12;

    headGroup.add(browL, browR);

    // 3.5 Ears
    const earGeo = new THREE.SphereGeometry(0.14, 16, 16);
    earGeo.scale(0.5, 0.9, 0.6);
    const earL = new THREE.Mesh(earGeo, skinMaterial);
    earL.position.set(-0.55, 0.02, 0);
    const earR = new THREE.Mesh(earGeo, skinMaterial);
    earR.position.set(0.55, 0.02, 0);
    headGroup.add(earL, earR);

    // 3.6 Hair Sculpt
    if (isFemale) {
      // Female Hair (Top Bun + Curled bangs)
      const hairBaseGeo = new THREE.SphereGeometry(0.58, 24, 24);
      hairBaseGeo.scale(1.05, 1.1, 1.05);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMaterial);
      hairBase.position.set(0, 0.18, -0.06);
      headGroup.add(hairBase);

      const topBunGeo = new THREE.SphereGeometry(0.28, 20, 20);
      const topBun = new THREE.Mesh(topBunGeo, hairMaterial);
      topBun.position.set(0, 0.78, -0.15);
      headGroup.add(topBun);
    } else {
      // Male Hair (Textured Swept Quiff like Parliament Hero Boy)
      const hairBaseGeo = new THREE.SphereGeometry(0.58, 24, 24);
      hairBaseGeo.scale(1.04, 1.05, 1.02);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMaterial);
      hairBase.position.set(0, 0.18, -0.05);
      headGroup.add(hairBase);

      // Quiff top volume
      const quiffGeo = new THREE.SphereGeometry(0.35, 18, 18);
      quiffGeo.scale(1.2, 0.7, 1.1);
      const quiff = new THREE.Mesh(quiffGeo, hairMaterial);
      quiff.position.set(0.05, 0.62, 0.12);
      quiff.rotation.z = -0.15;
      headGroup.add(quiff);
    }

    // 3.7 Neck
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.23, 0.35, 20);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.set(0, -0.55, 0);
    avatarGroup.add(neckMesh);

    // 3.8 Torso / Hoodie & Collar
    const collarGeo = new THREE.TorusGeometry(0.38, 0.12, 16, 28);
    collarGeo.rotateX(Math.PI * 0.5);
    const collarMesh = new THREE.Mesh(collarGeo, clothingMaterial);
    collarMesh.position.set(0, -0.68, 0);
    avatarGroup.add(collarMesh);

    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.65, 0.6, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, clothingMaterial);
    torsoMesh.position.set(0, -0.98, 0);
    avatarGroup.add(torsoMesh);

    // ── 4. Interactive Cursor / Touch 3D Tracking ────────────────────────
    let targetRotY = 0;
    let targetRotX = 0;
    let mouseActive = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center
      const dx = (e.clientX - centerX) / (window.innerWidth * 0.5);
      const dy = (e.clientY - centerY) / (window.innerHeight * 0.5);

      targetRotY = THREE.MathUtils.clamp(dx * 0.7, -0.65, 0.65);
      targetRotX = THREE.MathUtils.clamp(dy * 0.45, -0.4, 0.4);
      mouseActive = true;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      handleMouseMove(e.touches[0]);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // ── 5. Render Loop (Smooth Lerp + Idle Breathing + Natural Blinks) ───
    let animId;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Subtle breathing float (smooth sine wave)
      const breath = Math.sin(elapsedTime * 2.2) * 0.025;
      avatarGroup.position.y = breath;

      // Natural eye blinking every ~3.5 seconds
      blinkTimer += delta;
      if (blinkTimer > 3.5 && !isBlinking) {
        isBlinking = true;
      }
      if (isBlinking) {
        eyeGroupL.scale.y = 0.1;
        eyeGroupR.scale.y = 0.1;
        if (blinkTimer > 3.65) {
          eyeGroupL.scale.y = 1;
          eyeGroupR.scale.y = 1;
          isBlinking = false;
          blinkTimer = Math.random() * 0.8; // Randomize next blink cadence
        }
      }

      // Smooth Head Tracking Lerp
      const idleSwayY = Math.sin(elapsedTime * 0.8) * 0.06;
      const targetY = mouseActive ? targetRotY : idleSwayY;
      const targetX = mouseActive ? targetRotX : 0;

      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetY, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetX, 0.08);
      avatarGroup.rotation.y = THREE.MathUtils.lerp(avatarGroup.rotation.y, targetY * 0.35, 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // ── 6. Cleanup on Unmount ────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);

      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [isFemale]);

  return (
    <div className="relative group shrink-0 select-none">
      {/* Luxurious Obsidian / Titanium Glass Bezel (No tacky neon, no spinning dashes) */}
      <div
        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-2 border-white/20 shadow-2xl overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Three.js Interactive 3D WebGL Canvas */}
        <div ref={containerRef} className="w-full h-full rounded-full cursor-grab active:cursor-grabbing" />

        {/* Ambient Studio Floor Reflection */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75), transparent)',
          }}
        />
      </div>

      {/* Clean, Discreet Status Indicator: 3D Interactive Badge (No waving hand, no tacky emoji) */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border border-white/15 text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 backdrop-blur-md"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          color: isFemale ? '#f472b6' : '#38bdf8',
        }}
        title="Interactive 3D Aspirant Avatar: Move your cursor to see 3D head tracking"
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: isFemale ? '#f472b6' : '#38bdf8' }}
        />
        <span>3D AVATAR</span>
      </div>
    </div>
  );
}
