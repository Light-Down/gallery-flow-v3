
import React from 'react';
import { motion } from 'framer-motion';

const AtelierTypographyMoment = ({ config, image }) => {
  if (!config.typographyText) return null;

  return (
    <section className="relative h-[80vh] md:h-screen w-full flex items-center justify-center overflow-hidden bg-[hsl(var(--atelier-black))]">
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0 w-full h-full">
          <img src={image} alt="Typography Background" className="w-full h-full object-cover blur-sm brightness-50 grayscale" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
        className="relative z-10 flex flex-col items-center justify-center w-full px-4"
      >
        <h2 className="font-editorial text-[14vw] md:text-[10vw] leading-none text-center text-[hsl(var(--atelier-ivory))] tracking-tighter uppercase whitespace-nowrap">
          {config.typographyText}
        </h2>
        {config.typographySubtitle && (
          <p className="atelier-label text-[hsl(var(--atelier-ivory))]/70 mt-8 tracking-[0.3em]">
            {config.typographySubtitle}
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default AtelierTypographyMoment;
