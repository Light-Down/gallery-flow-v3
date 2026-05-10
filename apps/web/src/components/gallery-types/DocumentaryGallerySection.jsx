
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion, useReducedMotion } from 'framer-motion';
import { getImageAlt, getImageKey, getImageOrientation, getImageUrl } from '@/components/gallery-types/galleryLayoutUtils.js';

const getDocumentaryCellClass = (image) => {
  const orientation = getImageOrientation(image);

  if (orientation === 'landscape') {
    return 'col-span-2 sm:col-span-2 md:col-span-3 xl:col-span-4 row-span-2';
  }

  if (orientation === 'square') {
    return 'col-span-1 sm:col-span-2 md:col-span-2 xl:col-span-2 row-span-2';
  }

  return 'col-span-1 sm:col-span-1 md:col-span-2 xl:col-span-2 row-span-3';
};

const DocumentaryTile = React.memo(({ image, index, onImageClick }) => {
  const url = getImageUrl(image);
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '0px 0px -60px 0px' },
        transition: { duration: 0.45, delay: (index % 8) * 0.025, ease: [0.16, 1, 0.3, 1] }
      };

  return (
    <motion.button
      type="button"
      {...motionProps}
      className={`group relative block h-full min-h-0 w-full cursor-pointer overflow-hidden border border-black/5 bg-stone-100 text-left shadow-sm transition-colors duration-200 hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800 ${getDocumentaryCellClass(image)}`}
      onClick={() => onImageClick(url)}
    >
      <img
        src={url}
        alt={getImageAlt(image, `Documentary image ${index + 1}`)}
        loading="lazy"
        className="h-full w-full object-contain p-1.5 transition-opacity duration-200 group-hover:opacity-95 md:p-2"
      />
    </motion.button>
  );
});

const DocumentaryGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);

  if (!images || images.length === 0) return null;

  return (
    <section className="w-full bg-[#FAFAFA] px-3 py-16 dark:bg-[#0a0a0a] sm:px-5 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[138rem]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-end justify-between gap-6 border-b border-foreground/10 pb-4 md:mb-10"
        >
          <h2 className="font-minimal text-2xl font-semibold uppercase tracking-tight text-foreground md:text-4xl">
            {section}
          </h2>
          <span className="hidden sm:block text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {String(images.length).padStart(2, '0')} frames
          </span>
        </motion.div>

        <div
          className="grid auto-rows-[clamp(5.25rem,8vw,8.5rem)] grid-cols-2 gap-2 [grid-auto-flow:dense] sm:grid-cols-4 md:grid-cols-6 md:gap-3 xl:grid-cols-8"
        >
          {images.map((image, index) => (
            <DocumentaryTile
              key={getImageKey(image, `${section}-${index}`)}
              image={image}
              index={index}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DocumentaryGallerySection;
