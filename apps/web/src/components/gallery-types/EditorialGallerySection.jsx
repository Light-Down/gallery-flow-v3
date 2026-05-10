
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';

const EditorialGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[120rem] mx-auto w-full border-b border-border/30 last:border-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 md:mb-20 text-center max-w-3xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-editorial font-bold mb-6 text-foreground tracking-tight">
          {section}
        </h2>
        {gallery.sections?.find(s => (s.sectionTitle || s.name) === section)?.sectionDescription && (
           <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
             {gallery.sections.find(s => (s.sectionTitle || s.name) === section).sectionDescription}
           </p>
        )}
      </motion.div>

      <div className="gallery-grid">
        {images.map((imgObj, idx) => {
          const url = imgObj.url || imgObj;
          const orientation = imgObj.orientation || 'portrait';
          const filename = imgObj.filename || `${section} - Moment ${idx + 1}`;

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.6, delay: (idx % 6) * 0.1 }}
              key={imgObj.id || idx} 
              className={`gallery-item gallery-item-${orientation} group shadow-sm hover:shadow-xl`} 
              onClick={() => onImageClick(url)}
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
}

export default EditorialGallerySection;
