
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';
import { GalleryImageTile, ParallaxGalleryImageTile } from '@/components/gallery-types/GalleryImageTile.jsx';
import { chunkByPattern, getAspectClass, getImageOrientation } from '@/components/gallery-types/galleryLayoutUtils.js';

const CinematicGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);
  const chunks = chunkByPattern(images, [
    { type: 'scene', count: 1 },
    { type: 'parallax-duo', count: 2 },
    { type: 'stills', count: 3 },
    { type: 'scene', count: 1 }
  ]);

  if (!images || images.length === 0) return null;

  return (
    <section className="w-full bg-black text-white relative overflow-hidden">
      <div className="py-32 md:py-44 px-4 sm:px-8 max-w-[128rem] mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="mb-24 md:mb-32 text-center"
        >
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/45">Cinematic sequence</p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-editorial font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/55">
            {section}
          </h2>
        </motion.div>

        <div className="space-y-24 md:space-y-40">
          {chunks.map((chunk, chunkIndex) => {
            if (chunk.type === 'scene') {
              const image = chunk.items[0];
              const isPortrait = getImageOrientation(image) === 'portrait';

              return (
                <ParallaxGalleryImageTile
                  key={`${chunk.type}-${chunkIndex}`}
                  image={image}
                  index={chunkIndex}
                  onImageClick={onImageClick}
                  className={`${isPortrait ? 'md:w-[52%] mx-auto aspect-[3/4]' : 'aspect-[21/9]'} rounded-none bg-zinc-900`}
                  imageClassName="opacity-90 group-hover:opacity-100 group-hover:scale-105 duration-1000"
                  overlayClassName="bg-gradient-to-t from-black/30 via-transparent to-black/20"
                  parallax={[-32, 32]}
                />
              );
            }

            if (chunk.type === 'parallax-duo') {
              return (
                <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
                  {chunk.items.map((image, idx) => (
                    <div key={idx} className={idx === 0 ? 'md:col-span-7' : 'md:col-span-5 md:mt-36'}>
                      <ParallaxGalleryImageTile
                        image={image}
                        index={idx}
                        onImageClick={onImageClick}
                        className={`${getAspectClass(image, 'aspect-[3/4]')} rounded-none bg-zinc-900`}
                        imageClassName="opacity-90 group-hover:opacity-100 group-hover:scale-105 duration-1000"
                        overlayClassName="bg-black/10"
                        parallax={idx === 0 ? [-42, 24] : [34, -28]}
                      />
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={`${chunk.type}-${chunkIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                {chunk.items.map((image, idx) => (
                  <GalleryImageTile
                    key={idx}
                    image={image}
                    index={idx}
                    onImageClick={onImageClick}
                    className={`${getAspectClass(image, idx === 1 ? 'aspect-square' : 'aspect-[4/5]')} rounded-none bg-zinc-900`}
                    imageClassName="opacity-80 group-hover:opacity-100 group-hover:scale-105 duration-1000"
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CinematicGallerySection;
