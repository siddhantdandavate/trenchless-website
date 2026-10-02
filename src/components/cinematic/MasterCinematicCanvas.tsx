'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Globe3D } from './Globe3D';
import { Underground3D } from './Underground3D';

interface MasterCinematicCanvasProps {
  scrollProgress: number;
}

export default function MasterCinematicCanvas({ scrollProgress }: MasterCinematicCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<Globe3D | null>(null);
  const undergroundRef = useRef<Underground3D | null>(null);
  const animFrameId = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(performance.now());
  const progressRef = useRef<number>(0);

  // Keep latest scrollProgress in ref for animation frame
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    // No solid background — we'll render stars as Points for the United Carriers look
    sceneRef.current = scene;

    // 1.5 Starfield — created after renderer, added to scene now
    const starGeo = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 180 + Math.random() * 40;
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.85, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      40,   // Narrower FOV = sphere looks rounder, less perspective distortion
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 11);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // Clean container before appending
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderer.setClearColor(0x010205, 1); // Deep space black

    // 4. Lighting Setup (Crucial for the United Carriers Look)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Very low ambient to keep dark side dark
    scene.add(ambientLight);

    // Front/Top soft light to slightly illuminate the particles on the bright side
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(-10, 10, 20);
    scene.add(frontLight);

    // Intense Blue Atmosphere Rim Light from Bottom
    const blueRim = new THREE.DirectionalLight(0x0066ff, 5.0);
    blueRim.position.set(5, -15, -10);
    scene.add(blueRim);

    // Intense Orange Rim Light from Top Right
    const orangeRim = new THREE.DirectionalLight(0xff5500, 4.0);
    orangeRim.position.set(15, 15, -15);
    scene.add(orangeRim);

    // 5. Instantiate 3D Globe & Underground Scenes
    // radius 3.6: perfectly proportioned sphere matching United Carriers scale
    const globe = new Globe3D(3.6);
    if (mountRef.current) {
      globe.initInteraction(mountRef.current);
    }
    scene.add(globe.group);
    globeRef.current = globe;

    // Globe: far right, partially cropped — matches United Carriers composition
    const isMobile = window.innerWidth < 768;
    globe.group.position.set(isMobile ? 2.5 : 5.8, isMobile ? -1.0 : -0.8, 0);

    const underground = new Underground3D();
    scene.add(underground.group);
    undergroundRef.current = underground;

    // 6. Handle Window Resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 768;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (globeRef.current && progressRef.current < 0.28) {
        globeRef.current.group.position.x = mobile ? 2.5 : 5.8;
        globeRef.current.group.position.y = mobile ? -1.0 : -0.8;
      }
    };
    window.addEventListener('resize', handleResize);

    // 7. Render Loop
    let animTime = 0;
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - prevTimeRef.current) / 1000;
      prevTimeRef.current = now;
      animTime += delta;

      const p = progressRef.current;
      const mobile = window.innerWidth < 768;

      // Update Globe
      if (globeRef.current) {
        globeRef.current.update(delta, p);

        // Transition Globe scale & position during descent
        if (p < 0.15) {
          globeRef.current.group.visible = true;
          globeRef.current.group.scale.setScalar(1.0);
          globeRef.current.group.position.set(mobile ? 2.5 : 6.0, mobile ? -1.0 : -0.2, 0);
          // Reset globe material opacity if we made it transparent
          if (globeRef.current.baseSphere.material instanceof THREE.Material) {
            globeRef.current.baseSphere.material.transparent = false;
            globeRef.current.baseSphere.material.opacity = 1;
          }
        } else if (p >= 0.15 && p < 0.35) {
          // Zoom into globe surface - Globe gets massive and camera goes into it
          const t = (p - 0.15) / 0.20; // 0 to 1
          globeRef.current.group.visible = true;
          const scale = 1.0 + t * 15.0; // Scale up massively to swallow camera
          globeRef.current.group.scale.setScalar(scale);
          globeRef.current.group.position.x = (mobile ? 1.8 : 4.2) * (1 - t);
          globeRef.current.group.position.y = -0.2 - t * 8.0;
          globeRef.current.group.position.z = t * 6.0; // Move towards camera
          
          // Fade out the base sphere so we don't clip through solid black abruptly
          if (globeRef.current.baseSphere.material instanceof THREE.Material) {
            globeRef.current.baseSphere.material.transparent = true;
            globeRef.current.baseSphere.material.opacity = 1.0 - t;
          }
        } else {
          // Camera is now fully "underground" or "inside" the engineering site
          globeRef.current.group.visible = false;
        }
      }

      // Update Underground & Camera Trajectory
      if (undergroundRef.current) {
        undergroundRef.current.update(p);

        if (p >= 0.25) {
          // Camera position descends into underground strata tracking the drill
          const cameraProgress = Math.min(1.0, (p - 0.25) / 0.65);
          
          // Smooth camera trajectory
          // Start high at Surface, go down into strata, then follow horizontal drill
          const camX = -12 + cameraProgress * 38;
          
          // Drop Y smoothly from 6.0 (surface) to -3.0 (underground)
          let camY = 6.0 - (cameraProgress * 9.0);
          if (cameraProgress > 0.4) {
             // Level out
             camY = -3.0;
          }
          
          // Z pushes in
          const camZ = 16.0 - (cameraProgress * 6.0);

          if (cameraRef.current) {
            cameraRef.current.position.set(camX, camY, camZ);
            const targetX = camX + 4.0;
            const targetY = camY - 1.5;
            cameraRef.current.lookAt(targetX, targetY, 0);
          }
        } else {
          if (cameraRef.current) {
            // Normal Globe view camera
            cameraRef.current.position.set(0, 0, 8.5);
            cameraRef.current.lookAt(0, 0, 0);
          }
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      globeRef.current?.disposeInteraction();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
