
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { formatDate } from '@/utils/galleryHelpers.js';
import { ChevronDown } from 'lucide-react';

const ImmersiveHeroSection = ({ coupleNames, date, location, coverImage }) => {
  const containerRef = useRef(null);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  
  return (
    <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden bg-black flex items-center justify-center">
      {/* Background Image with Parallax */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-full">
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552'}
          alt={`${coupleNames} Wedding`}
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay for luxury feel and text readability */}
        <div className="absolute inset-0 bg-[var(--overlay-dark)]" />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }} 
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="text-white/80 uppercase tracking-[0.2em] text-sm md:text-base font-medium mb-6"
        >
          {location}
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-editorial text-white mb-8 max-w-5xl leading-tight"
        >
          {coupleNames}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="text-white/80 text-lg md:text-xl font-editorial italic tracking-wide"
        >
          {formatDate(date)}
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest font-medium">Enter Story</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(ImmersiveHeroSection);
