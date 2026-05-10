
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';

const MinimalGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-32 px-6 sm:px-12 lg:px-24 max-w-[100rem] mx-auto w-full">
      <div className="mb-24 flex items-center justify-between border-b border-border/40 pb-8">
        <h2 className="text-2xl md:text-3xl font-minimal font-light text-foreground tracking-widest uppercase">
          {section}
        </h2>
        <span className="text-sm text-muted-foreground font-mono">
          {String(images.length).padStart(2, '0')} FILES
        </span>
      </div>

      <div className="gallery-grid !gap-12 md:!gap-16 lg:!gap-24">
        {images.map((imgObj, idx) => {
          const url = imgObj.url || imgObj;
          const orientation = imgObj.orientation || 'portrait';
          const filename = imgObj.filename || `${section} minimalist capture ${idx + 1}`;

          return (
            <div 
              key={imgObj.id || idx} 
              className={`gallery-item gallery-item-${orientation} !rounded-none shadow-none hover:shadow-2xl`} 
              onClick={() => onImageClick(url)}
            >
              <img 
                src={url} 
                alt={filename} 
                loading="lazy" 
                className="w-full h-full object-cover transition-opacity duration-500 hover:opacity-95" 
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MinimalGallerySection;
