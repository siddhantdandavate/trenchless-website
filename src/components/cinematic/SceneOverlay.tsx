'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SceneOverlayProps {
  scrollProgress: number;
}

export default function SceneOverlay({ scrollProgress }: SceneOverlayProps) {
  // Determine active stage based on master timeline:
  // 0.00 → 0.15 GLOBAL EARTH
  // 0.15 → 0.25 GLOBAL TRANSITION
  // 0.25 → 0.40 SURFACE / ENGINEERING SITE
  // 0.40 → 0.58 UNDERGROUND DESCENT
  // 0.58 → 0.72 HDD DRILLING
  // 0.72 → 0.82 PIPE FOLLOWS BORE
  // 0.82 → 0.90 NEXT ENGINEERING OPERATION
  // 0.90 → 1.00 ENGINEERING / SCALE TRANSITION
  
  const isHeroPhase = scrollProgress < 0.25;
  const isHDDPhase = scrollProgress >= 0.58 && scrollProgress < 0.82;
  const isMicrotunnelPhase = scrollProgress >= 0.82 && scrollProgress < 0.90;
  const isGlobalScalePhase = scrollProgress >= 0.90;

  // Hero Text opacity smoothly fades as camera zooms in (0.15 -> 0.25)
  const heroOpacity = Math.max(0, Math.min(1, (0.25 - scrollProgress) / 0.10));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden">
      
      {/* --- STAGE 0: TRAYANA HERO OVERLAY (LEFT SIDE) --- */}
      <div 
        className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-36 flex-1 flex flex-col justify-center transition-opacity duration-300"
        style={{ opacity: heroOpacity, display: scrollProgress > 0.25 ? 'none' : 'flex' }}
      >
        <div className="max-w-xl md:max-w-2xl text-left pointer-events-auto">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff5500]/10 border border-[#ff5500]/30 rounded-full mb-4 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
            <span className="text-[#ff5500] text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
              Global Trenchless Engineering Specialists
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-display text-[2.75rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.25rem] font-bold text-white uppercase leading-[0.95] tracking-tight mb-6 drop-shadow-2xl">
            ENGINEERING <br />
            CONNECTIONS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#ff5500]">
              BENEATH THE SURFACE
            </span>
          </h1>

          {/* Description Paragraph */}
          <p className="max-w-lg text-sm md:text-base text-white/80 font-normal leading-relaxed mb-8 drop-shadow">
            Specialists in Trenchless Technology and Underground Infrastructure delivering HDD, Pipe Jacking, Microtunneling, Railway Crossing and Utility Infrastructure projects across India and international markets.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="/services" 
              className="bg-white text-black rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#ff5500] hover:text-white transition-all shadow-lg hover:shadow-[#ff5500]/25 transform hover:-translate-y-0.5"
            >
              Our Services
            </a>
            <a 
              href="/projects" 
              className="border border-white/30 text-white rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all backdrop-blur-sm transform hover:-translate-y-0.5"
            >
              View Projects
            </a>
          </div>
        </div>
      </div>

      {/* --- STAGE 1 & 2: UNDERGROUND TELEMETRY HUD CARDS --- */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex-1 flex items-center justify-end pointer-events-none">
        <AnimatePresence mode="wait">
          
          {/* HDD Telemetry Card */}
          {isHDDPhase && (
            <motion.div
              key="hdd-card"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md bg-[#040d1f]/85 backdrop-blur-xl border border-white/15 p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-l-4 border-l-[#ff5500] pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#ff5500] text-xs font-black tracking-widest uppercase">
                  01 / HORIZONTAL DIRECTIONAL DRILLING
                </span>
                <span className="text-white/40 text-[10px] font-mono">OPERATION</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-3">
                Steerable Bore Path & Pipe Pullback
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-6">
                Guided drilling navigates complex rock strata while the reamer expands the bore path. The product pipe is pulled continuously behind the assembly with zero gap, preserving surface integrity.
              </p>
            </motion.div>
          )}

          {/* Microtunneling Telemetry Card */}
          {isMicrotunnelPhase && (
            <motion.div
              key="microtunnel-card"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md bg-[#040d1f]/85 backdrop-blur-xl border border-white/15 p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-l-4 border-l-[#38bdf8] pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#38bdf8] text-xs font-black tracking-widest uppercase">
                  02 / MICROTUNNELING & PIPE JACKING
                </span>
                <span className="text-white/40 text-[10px] font-mono">INFRASTRUCTURE</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-3">
                Railway & Utility Crossings
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-6">
                Hydraulic jacking rams advance concrete segment rings underground beneath active railway corridors, highways, and water bodies without disturbing surface traffic.
              </p>
            </motion.div>
          )}

          {/* Global Scale Card */}
          {isGlobalScalePhase && (
            <motion.div
              key="scale-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md bg-[#040d1f]/85 backdrop-blur-xl border border-white/15 p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-l-4 border-l-[#ff5500] pointer-events-auto"
            >
              <span className="text-[#ff5500] text-xs font-black tracking-widest uppercase mb-2 block">
                03 / GLOBAL ENGINEERING FOOTPRINT
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-3">
                Proven Executional Excellence
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                From river crossings in India to complex urban utility corridors in Europe and Asia, Trayana delivers precision underground infrastructure solutions worldwide.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- METRICS BOTTOM BAR (MUST ALWAYS BE FULLY VISIBLE & SEPARATE) --- */}
      <div className="w-full bg-[#040d1f]/95 border-t border-white/10 backdrop-blur-xl pointer-events-auto z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            {/* Metric 1: 4+ COUNTRIES (FULL TEXT ALWAYS VISIBLE) */}
            <div className="flex flex-col py-5 md:py-6 md:px-6">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                4+
              </div>
              <div className="text-[10px] md:text-[11px] font-black text-[#ff5500] uppercase tracking-[0.18em] mb-0.5">
                COUNTRIES
              </div>
              <div className="text-[10px] md:text-[11px] text-white/60 font-medium">
                India · France · UAE · Malaysia
              </div>
            </div>

            {/* Metric 2: 250+ PROJECTS */}
            <div className="flex flex-col py-5 md:py-6 md:px-6">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                250+
              </div>
              <div className="text-[10px] md:text-[11px] font-black text-[#ff5500] uppercase tracking-[0.18em] mb-0.5">
                PROJECTS
              </div>
              <div className="text-[10px] md:text-[11px] text-white/60 font-medium">
                Completed Successfully
              </div>
            </div>

            {/* Metric 3: 25+ MACHINES */}
            <div className="flex flex-col py-5 md:py-6 md:px-6">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                25+
              </div>
              <div className="text-[10px] md:text-[11px] font-black text-[#ff5500] uppercase tracking-[0.18em] mb-0.5">
                MACHINES
              </div>
              <div className="text-[10px] md:text-[11px] text-white/60 font-medium">
                Advanced Fleet
              </div>
            </div>

            {/* Metric 4: 250+ EXPERTS */}
            <div className="flex flex-col py-5 md:py-6 md:px-6">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                250+
              </div>
              <div className="text-[10px] md:text-[11px] font-black text-[#ff5500] uppercase tracking-[0.18em] mb-0.5">
                EXPERTS
              </div>
              <div className="text-[10px] md:text-[11px] text-white/60 font-medium">
                Skilled Professionals
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
