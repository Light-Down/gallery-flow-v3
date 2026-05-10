
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';

const AtelierHeroSection = ({ config, gallery, image }) => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const year = gallery.date ? format(new Date(gallery.date), 'yyyy') : '';
  
  const imageUrl = typeof image === 'object' ? image.url : image;
  return (
    <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden bg-[hsl(var(--atelier-black))] text-[hsl(var(--atelier-ivory))]">
      {/* Background Image with Ken Burns & Grayscale */}
      <motion.div style={{ scale, y }} className="absolute inset-0 w-full h-full">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552'}
          alt={`${gallery.coupleNames} Hero`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        <div className="absolute inset-0 grayscale-[50%]" />
      </motion.div>

      {/* Content Overlay */}
      <motion.div style={{ opacity }} className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 md:p-12">
        
        {/* Absolutely positioned corner labels */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 hidden md:block">
          <p className="atelier-label text-[hsl(var(--atelier-ivory))]/70">{gallery.location}</p>
        </div>
        
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
          <p className="atelier-label text-[hsl(var(--atelier-ivory))]/70">Selected Works</p>
        </div>

        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 hidden md:block">
          <p className="atelier-label text-[hsl(var(--atelier-ivory))]/70">VOL. {year}</p>
        </div>

        {config.accentLabel && (
          <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-[hsl(var(--atelier-accent))]" />
            <p className="atelier-label text-[hsl(var(--atelier-accent))]">{config.accentLabel}</p>
          </div>
        )}

        {/* Huge Masthead */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="atelier-masthead absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-full text-center"
        >
          {config.mastheadText || 'ATELIER'}
        </motion.h1>

        {/* Center Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mt-20"
        >
          <h2 className="font-editorial text-5xl md:text-7xl lg:text-8xl italic tracking-tight mb-4">
            {config.mainTitle || gallery.coupleNames}
          </h2>
          {config.subtitle && (
            <p className="atelier-label text-[hsl(var(--atelier-ivory))]/80">{config.subtitle}</p>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default AtelierHeroSection;
