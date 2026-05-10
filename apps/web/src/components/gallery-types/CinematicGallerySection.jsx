
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';

const CinematicGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);

  if (!images || images.length === 0) return null;

  return (
    <section className="w-full bg-black text-white relative">
      <div className="py-32 px-4 sm:px-8 max-w-[120rem] mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl md:text-7xl font-editorial font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {section}
          </h2>
        </motion.div>

        <div className="gallery-grid !gap-1">
          {images.map((imgObj, idx) => {
            const url = imgObj.url || imgObj;
            // Cinematic leans heavy into landscape presentation where possible
            const orientation = imgObj.orientation === 'square' ? 'landscape' : (imgObj.orientation || 'landscape');
            const filename = imgObj.filename || `${section} scene ${idx + 1}`;

            return (
              <div 
                key={imgObj.id || idx} 
                className={`gallery-item gallery-item-${orientation} !rounded-none group overflow-hidden bg-zinc-900`} 
                onClick={() => onImageClick(url)}
              >
                <img 
                  src={url} 
                  alt={filename} 
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CinematicGallerySection;
