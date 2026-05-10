
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getVisibleSections, getImagesBySection, getGalleryHeroImageUrl } from '@/utils/galleryHelpers.js';

const AtelierEditorialGallery = ({ gallery, onLightbox, onFavorite, favorites }) => {
  // Move useMemo BEFORE any conditional returns to comply with Rules of Hooks
  const sections = useMemo(() => {
    if (!gallery) return [];
    return getVisibleSections(gallery);
  }, [gallery]);

  if (!gallery) return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--atelier-ivory))] text-[hsl(var(--atelier-black))] selection:bg-[hsl(var(--atelier-accent))] selection:text-white pb-32">
      {/* Atelier Hero Overlay Style */}
      <header className="relative w-full h-[90vh] md:h-screen flex items-end p-6 md:p-16 overflow-hidden bg-[hsl(var(--atelier-black))]">
        <img 
          src={getGalleryHeroImageUrl(gallery)} 
          alt={`${gallery.coupleNames} Wedding`} 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-editorial font-extrabold text-white leading-none tracking-tight mb-4"
            >
              {gallery.coupleNames}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
              className="flex items-center gap-4 text-[hsl(var(--atelier-ivory))] font-minimal text-sm uppercase tracking-[0.2em]"
            >
              <span>{gallery.date}</span>
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--atelier-accent))]"></span>
              <span>{gallery.location}</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Atelier Flowing Sections */}
      <main className="w-full">
        {sections.map((section, idx) => {
          const title = section.sectionTitle || section.name;
          const images = getImagesBySection(gallery, title);
          
          if (!images || images.length === 0) return null;

          return (
            <section key={idx} className="py-24 md:py-32 px-4 sm:px-8 max-w-[140rem] mx-auto border-b border-[hsl(var(--atelier-black))]/10 last:border-0">
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-20 items-start">
                <h2 className="text-5xl md:text-7xl font-editorial italic tracking-tight shrink-0 md:w-1/3">
                  {title}
                </h2>
                {section.sectionDescription && (
                  <p className="text-xl font-minimal font-light text-[hsl(var(--atelier-black))]/70 max-w-2xl leading-relaxed">
                    {section.sectionDescription}
                  </p>
                )}
              </div>

              <div className="gallery-grid !gap-4 md:!gap-8">
                {images.map((imgObj, i) => {
                  const url = imgObj.url || imgObj;
                  const orientation = imgObj.orientation || 'portrait';
                  const filename = imgObj.filename || `${title} highlight ${i + 1}`;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.8, delay: (i % 4) * 0.1 }}
                      key={imgObj.id || i} 
                      className={`gallery-item gallery-item-${orientation} group !rounded-none bg-[hsl(var(--atelier-champagne))]`}
                      onClick={() => onLightbox(url)}
                    >
                      <img 
                        src={url} 
                        alt={filename} 
                        loading="lazy" 
                        className="gallery-image" 
                      />
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default AtelierEditorialGallery;
