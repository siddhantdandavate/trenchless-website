'use client';
import { motion } from 'framer-motion';

export default function AboutTrayana() {
  return (
    <section className="py-24 md:py-32 bg-white text-navy-deep relative z-10 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Image Side */}
          <div className="relative">
            <div className="h-[500px] w-full bg-cover bg-center rounded-lg shadow-2xl relative overflow-hidden group">
              <img src="/images/projects/p3.jpg" alt="About Trayana" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
            
            <div className="absolute -bottom-8 -right-8 hidden md:block bg-primary text-white p-8 max-w-[240px] shadow-2xl z-10">
              <div className="text-6xl font-bold leading-none mb-2 font-display">30+</div>
              <div className="text-sm uppercase tracking-widest font-bold">Years of Trenchless Engineering</div>
            </div>
          </div>

          {/* Text Side */}
          <div className="flex flex-col justify-center">
            <div className="mb-12">
              <p className="eyebrow text-primary mb-4 font-bold uppercase tracking-widest text-sm">About Trayana Infratech Public Limited</p>
              <h2 className="text-4xl md:text-5xl font-bold uppercase leading-tight text-navy-deep mb-8">
                Three Decades of Trenchless Engineering Excellence
              </h2>
              
              <div className="space-y-6 text-navy-deep/80 text-lg leading-relaxed">
                <p>
                  For over 30 years, Trayana InfraTech and its subsidiaries have been delivering advanced trenchless engineering solutions that enable critical underground infrastructure development across urban, industrial, and utility sectors. The company specializes in the design, engineering, and execution of complex trenchless projects, supporting the expansion of transportation, energy, telecommunications, water, and waste infrastructure.
                </p>
                <p>
                  With proven expertise in Horizontal Directional Drilling (HDD), Microtunneling, Pipe Jacking, Utility Crossings, and Railway Infrastructure Projects, Trayana InfraTech has successfully executed projects for government agencies, public utilities, EPC contractors, and multinational corporations.
                </p>
                <p>
                  Our integrated engineering and construction approach combines technical innovation, rigorous project management, and uncompromising safety standards to deliver reliable, cost-effective, and environmentally responsible infrastructure solutions.
                </p>
              </div>
            </div>
            
            <a className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-navy-deep hover:text-primary transition self-start" href="/about">
              Learn More About Us →
            </a>
          </div>
          
        </div>

        {/* Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          
          <div className="bg-white border border-gray-200 border-l-4 border-l-primary p-6 shadow-sm hover:shadow-xl transition">
            <h3 className="font-bold text-navy-deep text-lg uppercase tracking-tight mb-4">International Execution</h3>
            <p className="text-sm text-navy-deep/70 leading-relaxed">
              Established project experience across multiple international markets, including India, Malaysia, France, and the UAE, reflecting the Company's capability to deliver complex infrastructure solutions across diverse geographies while adhering to international engineering, quality, and safety standards.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 border-l-4 border-l-primary p-6 shadow-sm hover:shadow-xl transition">
            <h3 className="font-bold text-navy-deep text-lg uppercase tracking-tight mb-4">Engineering Excellence</h3>
            <p className="text-sm text-navy-deep/70 leading-relaxed">
              In-house engineering, geotechnical expertise, and risk assessment capabilities.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 border-l-4 border-l-primary p-6 shadow-sm hover:shadow-xl transition">
            <h3 className="font-bold text-navy-deep text-lg uppercase tracking-tight mb-4">Safety-First Culture</h3>
            <p className="text-sm text-navy-deep/70 leading-relaxed">
              ISO-aligned HSE practices with stringent safety compliance.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 border-l-4 border-l-primary p-6 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-navy-deep text-lg uppercase tracking-tight mb-4">Advanced Fleet</h3>
              <p className="text-sm text-navy-deep/70 leading-relaxed">
                Specialized fleet comprising 10+ owned HDD rigs, Microtunneling systems, RMC transit mixers, excavation equipment, and advanced infrastructure construction machinery, ensuring efficient execution and operational reliability across diverse project environments.
              </p>
            </div>
          </div>
          
        </div>

      </div>
    </section>
  );
}
