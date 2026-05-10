
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';

const DocumentaryGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-20 px-2 sm:px-4 lg:px-6 w-full bg-[#FAFAFA] dark:bg-[#0a0a0a]">
      <div className="max-w-[140rem] mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 pl-2 border-l-4 border-primary"
        >
          <h2 className="text-3xl md:text-4xl font-minimal font-semibold text-foreground tracking-tight uppercase">
            {section}
          </h2>
        </motion.div>

        <div className="gallery-grid !gap-2 md:!gap-4">
          {images.map((imgObj, idx) => {
            const url = imgObj.url || imgObj;
            const orientation = imgObj.orientation || 'square';
            const filename = imgObj.filename || `${section} documentation ${idx + 1}`;

            return (
              <div 
                key={imgObj.id || idx} 
                className={`gallery-item gallery-item-${orientation} group rounded-none`} 
                onClick={() => onImageClick(url)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10"></div>
                <img 
                  src={url} 
                  alt={filename} 
                  loading="lazy" 
                  className="gallery-image grayscale-[10%] group-hover:grayscale-0" 
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DocumentaryGallerySection;
