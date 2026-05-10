
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { GalleryImageTile } from '@/components/gallery-types/GalleryImageTile.jsx';
import { chunkByPattern, getAspectClass, getImageOrientation } from '@/components/gallery-types/galleryLayoutUtils.js';

const MinimalGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);
  const chunks = chunkByPattern(images, [
    { type: 'single', count: 1 },
    { type: 'pair', count: 2 },
    { type: 'quiet-wide', count: 1 },
    { type: 'pair', count: 2 }
  ]);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-32 md:py-40 px-6 sm:px-12 lg:px-24 max-w-[104rem] mx-auto w-full">
      <div className="mb-24 md:mb-32 flex items-center justify-between border-b border-border/40 pb-8">
        <h2 className="text-2xl md:text-3xl font-minimal font-light text-foreground tracking-widest uppercase">
          {section}
        </h2>
        <span className="text-sm text-muted-foreground font-mono">
          {String(images.length).padStart(2, '0')} FILES
        </span>
      </div>

      <div className="space-y-24 md:space-y-40">
        {chunks.map((chunk, chunkIndex) => {
          if (chunk.type === 'pair') {
            return (
              <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
                {chunk.items.map((image, idx) => (
                  <div key={idx} className={idx === 1 ? 'md:mt-28' : ''}>
                    <GalleryImageTile
                      image={image}
                      index={idx}
                      onImageClick={onImageClick}
                      className={`${getAspectClass(image, 'aspect-[4/5]')} rounded-none shadow-none`}
                      imageClassName="hover:opacity-95"
                    />
                  </div>
                ))}
              </div>
            );
          }

          const image = chunk.items[0];
          const isLandscape = getImageOrientation(image) === 'landscape';

          return (
            <div key={`${chunk.type}-${chunkIndex}`} className={isLandscape ? 'w-full' : 'flex justify-center'}>
              <GalleryImageTile
                image={image}
                index={chunkIndex}
                onImageClick={onImageClick}
                className={`${isLandscape ? 'aspect-[16/9]' : 'w-full md:w-[48%] aspect-[3/4]'} rounded-none shadow-none`}
                imageClassName="hover:opacity-95"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MinimalGallerySection;
