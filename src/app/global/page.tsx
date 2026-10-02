'use client';
import { motion, useScroll } from 'framer-motion';
import SmoothScroll from '@/components/SmoothScroll';
import ParallaxFooter from '@/components/ParallaxFooter';
import { useRef } from 'react';

const locations = [
  { country: "India", type: "Headquarters & Operations", desc: "Executing massive infrastructure projects across all states." },
  { country: "Middle East", type: "Regional Operations", desc: "Specialized trenchless infrastructure for arid environments." },
  { country: "Southeast Asia", type: "Engineering Hub", desc: "Supporting urban utility expansion in high-density regions." }
];

export default function GlobalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  return (
    <SmoothScroll>
      <main ref={containerRef} className="relative min-h-screen z-10 text-white bg-navy-deep pt-32 pb-40 overflow-hidden">
        
        {/* 3D Background Element */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen" />
          <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-[#00f3ff]/10 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <section className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 100, rotateX: -45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
            className="text-display text-5xl md:text-7xl font-bold uppercase tracking-tight mb-12 text-center"
            style={{ perspective: 1000 }}
          >
            International <br/> <span className="text-primary">Reach</span>
          </motion.h1>

          <div className="mt-24 grid md:grid-cols-2 gap-12 items-center">
            
            <div className="relative h-[400px] bg-[#1a1a1a]/50 border-2 border-white/5 rounded-3xl overflow-hidden flex items-center justify-center p-8 backdrop-blur-sm">
               {/* Stand-in for Map */}
               <div className="absolute inset-0 bg-[url('/images/hero-banner.jpg')] bg-cover bg-center opacity-20 grayscale" />
               <div className="relative z-10 text-center text-white/50 font-bold uppercase tracking-widest">
                  [ Interactive World Map ]
               </div>
            </div>

            <div className="space-y-6">
              {locations.map((loc, i) => (
                <motion.div
                  key={loc.country}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-navy/60 backdrop-blur-md p-8 border-l-4 border-primary rounded-r-xl hover:bg-navy/80 transition-all group"
                >
                  <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">{loc.country}</h3>
                  <div className="text-primary text-sm font-bold uppercase tracking-widest mb-4">{loc.type}</div>
                  <p className="text-white/70">{loc.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

      </main>
      <ParallaxFooter />
    </SmoothScroll>
  );
}
