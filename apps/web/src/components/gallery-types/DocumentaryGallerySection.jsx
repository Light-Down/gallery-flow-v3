
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';
import { GalleryImageTile, ParallaxGalleryImageTile } from '@/components/gallery-types/GalleryImageTile.jsx';
import { chunkByPattern, getAspectClass, getImageOrientation } from '@/components/gallery-types/galleryLayoutUtils.js';

const DocumentaryGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);
  const chunks = chunkByPattern(images, [
    { type: 'sequence', count: 3 },
    { type: 'wide', count: 1 },
    { type: 'pair', count: 2 },
    { type: 'sequence', count: 3 }
  ]);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-3 sm:px-5 lg:px-8 w-full bg-[#FAFAFA] dark:bg-[#0a0a0a]">
      <div className="max-w-[142rem] mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex items-end justify-between gap-6 border-b border-foreground/10 pb-5"
        >
          <h2 className="text-3xl md:text-5xl font-minimal font-semibold text-foreground tracking-tight uppercase">
            {section}
          </h2>
          <span className="hidden sm:block text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {String(images.length).padStart(2, '0')} frames
          </span>
        </motion.div>

        <div className="space-y-10 md:space-y-16">
          {chunks.map((chunk, chunkIndex) => {
            if (chunk.type === 'wide') {
              return (
                <ParallaxGalleryImageTile
                  key={`${chunk.type}-${chunkIndex}`}
                  image={chunk.items[0]}
                  index={chunkIndex}
                  onImageClick={onImageClick}
                  className={`${getImageOrientation(chunk.items[0]) === 'portrait' ? 'md:w-[58%] mx-auto aspect-[3/4]' : 'aspect-[16/8]'} rounded-none`}
                  imageClassName="grayscale-[8%] group-hover:grayscale-0"
                  overlayClassName="bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
                  parallax={[-12, 12]}
                />
              );
            }

            if (chunk.type === 'pair') {
              return (
                <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5 items-start">
                  {chunk.items.map((image, idx) => (
                    <div key={idx} className={idx === 0 ? 'md:col-span-7' : 'md:col-span-5 md:mt-12'}>
                      <GalleryImageTile
                        image={image}
                        index={idx}
                        onImageClick={onImageClick}
                        className={`${getAspectClass(image, 'aspect-[4/5]')} rounded-none`}
                        imageClassName="grayscale-[10%] group-hover:grayscale-0"
                      />
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-5">
                {chunk.items.map((image, idx) => (
                  <div
                    key={idx}
                    className={idx === 0 ? 'lg:col-span-5' : idx === 1 ? 'lg:col-span-3' : 'lg:col-span-4'}
                  >
                    <GalleryImageTile
                      image={image}
                      index={idx}
                      onImageClick={onImageClick}
                      className={`${getAspectClass(image, idx === 1 ? 'aspect-square' : 'aspect-[3/4]')} rounded-none`}
                      imageClassName="grayscale-[12%] group-hover:grayscale-0"
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DocumentaryGallerySection;
