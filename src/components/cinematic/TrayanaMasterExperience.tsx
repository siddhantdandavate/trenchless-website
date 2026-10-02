'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MasterCinematicCanvas from './MasterCinematicCanvas';
import SceneOverlay from './SceneOverlay';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TrayanaMasterExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, element);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[450vh] bg-[#040d1f]">
      {/* Sticky Fullscreen 3D Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#040d1f]">
        
        {/* Three.js WebGL Rendering Canvas */}
        <MasterCinematicCanvas scrollProgress={scrollProgress} />

        {/* HTML/CSS UI Overlays (Text + Metrics Bar) */}
        <SceneOverlay scrollProgress={scrollProgress} />

      </div>
    </section>
  );
}
