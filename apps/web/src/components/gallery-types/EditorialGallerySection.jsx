
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';
import { GalleryImageTile, ParallaxGalleryImageTile } from '@/components/gallery-types/GalleryImageTile.jsx';
import { chunkByPattern, getAspectClass, getImageOrientation, getSectionDetails } from '@/components/gallery-types/galleryLayoutUtils.js';

const EditorialGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);
  const sectionDetails = getSectionDetails(gallery, section);
  const chunks = chunkByPattern(images, [
    { type: 'feature', count: 1 },
    { type: 'diptych', count: 2 },
    { type: 'solo', count: 1 },
    { type: 'triptych', count: 3 },
    { type: 'wide', count: 1 }
  ]);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[124rem] mx-auto w-full border-b border-border/30 last:border-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20 md:mb-28 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end"
      >
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-muted-foreground">Editorial Chapter</p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-editorial font-bold text-foreground tracking-tight leading-none">
            {section}
          </h2>
        </div>
        {sectionDetails.sectionDescription && (
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed md:pb-3">
            {sectionDetails.sectionDescription}
          </p>
        )}
      </motion.div>

      <div className="space-y-20 md:space-y-32">
        {chunks.map((chunk, chunkIndex) => {
          if (chunk.type === 'feature' || chunk.type === 'wide') {
            const image = chunk.items[0];
            const isLandscape = getImageOrientation(image) === 'landscape';

            return (
              <div key={`${chunk.type}-${chunkIndex}`} className={isLandscape ? 'w-full' : 'flex justify-center'}>
                <ParallaxGalleryImageTile
                  image={image}
                  index={chunkIndex}
                  onImageClick={onImageClick}
                  className={`${isLandscape ? 'aspect-[16/9] md:aspect-[21/9]' : 'w-full md:w-[58%] aspect-[3/4]'} rounded-sm shadow-xl`}
                  imageClassName="object-center"
                  parallax={chunk.type === 'wide' ? [-18, 18] : [-26, 26]}
                />
              </div>
            );
          }

          if (chunk.type === 'diptych') {
            return (
              <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
                {chunk.items.map((image, idx) => (
                  <div key={idx} className={`${idx === 0 ? 'md:col-span-7' : 'md:col-span-5 md:mt-28'}`}>
                    <ParallaxGalleryImageTile
                      image={image}
                      index={idx}
                      onImageClick={onImageClick}
                      className={`${getAspectClass(image)} rounded-sm`}
                      parallax={idx === 0 ? [-18, 24] : [30, -18]}
                    />
                  </div>
                ))}
              </div>
            );
          }

          if (chunk.type === 'triptych') {
            return (
              <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-end">
                {chunk.items.map((image, idx) => (
                  <div key={idx} className={idx === 1 ? 'md:col-span-5 md:mb-20' : idx === 2 ? 'md:col-span-3' : 'md:col-span-4'}>
                    <GalleryImageTile
                      image={image}
                      index={idx}
                      onImageClick={onImageClick}
                      className={`${getAspectClass(image, 'aspect-[4/5]')} rounded-sm`}
                    />
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={`${chunk.type}-${chunkIndex}`} className="flex justify-center py-8 md:py-16">
              <GalleryImageTile
                image={chunk.items[0]}
                index={chunkIndex}
                onImageClick={onImageClick}
                className="w-full md:w-[46%] aspect-[3/4] rounded-sm"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default EditorialGallerySection;
