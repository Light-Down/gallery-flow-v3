
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion } from 'framer-motion';
import { GalleryImageTile, ParallaxGalleryImageTile } from '@/components/gallery-types/GalleryImageTile.jsx';
import { getAspectClass, getImageKey, getImageOrientation, getSectionDetails } from '@/components/gallery-types/galleryLayoutUtils.js';

const GROUP_SIZE = 6;
const DOMINANCE_THRESHOLD = 0.8;

const LANDSCAPE_PATTERNS = {
  single: [
    { className: 'md:col-span-10 md:col-start-2', frameClass: 'aspect-[16/9] md:aspect-[21/9]', parallax: [-26, 26], featured: true, preferred: ['landscape', 'square'] }
  ],
  pair: [
    { className: 'md:col-span-6', frameClass: 'aspect-[16/10]', parallax: [-18, 18], preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6 md:mt-20', frameClass: 'aspect-[16/10]', parallax: [20, -18], preferred: ['landscape', 'square'] }
  ],
  trio: [
    { className: 'md:col-span-12', frameClass: 'aspect-[21/9]', parallax: [-22, 22], featured: true, preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6', frameClass: 'aspect-[16/10]', parallax: [-14, 18], preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6 md:mt-16', frameClass: 'aspect-[16/10]', parallax: [18, -14], preferred: ['landscape', 'square'] }
  ],
  series: [
    { className: 'md:col-span-12', frameClass: 'aspect-[21/9]', parallax: [-22, 22], featured: true, preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6', frameClass: 'aspect-[16/10]', parallax: [-14, 18], preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6 md:mt-16', frameClass: 'aspect-[16/10]', parallax: [18, -14], preferred: ['landscape', 'square'] },
    { className: 'md:col-span-8 md:col-start-3', frameClass: 'aspect-[16/9]', parallax: [-18, 18], featured: true, preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6', frameClass: 'aspect-[16/10]', preferred: ['landscape', 'square'] },
    { className: 'md:col-span-6 md:mt-14', frameClass: 'aspect-[16/10]', preferred: ['landscape', 'square'] }
  ]
};

const PORTRAIT_PATTERNS = {
  single: [
    { className: 'md:col-span-4 md:col-start-5', frameClass: 'aspect-[3/4]', parallax: [-22, 22], featured: true, preferred: ['portrait', 'square'] }
  ],
  pair: [
    { className: 'md:col-span-5 md:col-start-2', frameClass: 'aspect-[3/4]', parallax: [-18, 24], preferred: ['portrait', 'square'] },
    { className: 'md:col-span-5 md:col-start-7 md:mt-24', frameClass: 'aspect-[3/4]', parallax: [26, -18], preferred: ['portrait', 'square'] }
  ],
  series: [
    { className: 'md:col-span-4', frameClass: 'aspect-[3/4]', preferred: ['portrait', 'square'] },
    { className: 'md:col-span-4 md:mt-16', frameClass: 'aspect-[3/4]', preferred: ['portrait', 'square'] },
    { className: 'md:col-span-4', frameClass: 'aspect-[3/4]', preferred: ['portrait', 'square'] },
    { className: 'md:col-span-5 md:col-start-2', frameClass: 'aspect-[4/5]', parallax: [-16, 20], preferred: ['portrait', 'square'] },
    { className: 'md:col-span-5 md:col-start-7 md:mt-20', frameClass: 'aspect-[4/5]', parallax: [22, -16], preferred: ['portrait', 'square'] },
    { className: 'md:col-span-4 md:col-start-5', frameClass: 'aspect-[3/4]', preferred: ['portrait', 'square'] }
  ]
};

const MIXED_PATTERNS = {
  story: [
    { className: 'md:col-span-7', frameFallback: 'aspect-[4/5]', parallax: [-18, 24], preferred: ['portrait', 'square'] },
    { className: 'md:col-span-5 md:mt-28', frameFallback: 'aspect-[3/4]', parallax: [30, -18], preferred: ['landscape', 'portrait'] },
    { className: 'md:col-span-12', frameType: 'feature', parallax: [-26, 26], featured: true, preferred: ['landscape', 'square'] },
    { className: 'md:col-span-4', frameFallback: 'aspect-[4/5]', preferred: ['portrait', 'square'] },
    { className: 'md:col-span-5 md:mb-20', frameFallback: 'aspect-[4/5]', preferred: ['landscape', 'portrait'] },
    { className: 'md:col-span-3', frameFallback: 'aspect-[4/5]', preferred: ['portrait', 'square'] }
  ],
  balanced: [
    { className: 'md:col-span-6', frameFallback: 'aspect-[4/5]', parallax: [-18, 20], preferred: ['portrait', 'square'] },
    { className: 'md:col-span-6 md:mt-20', frameFallback: 'aspect-[16/10]', parallax: [20, -18], preferred: ['landscape', 'square'] },
    { className: 'md:col-span-8 md:col-start-3', frameType: 'feature', parallax: [-20, 20], featured: true, preferred: ['landscape', 'portrait'] },
    { className: 'md:col-span-4', frameFallback: 'aspect-[4/5]', preferred: ['portrait', 'square'] },
    { className: 'md:col-span-4 md:mt-16', frameFallback: 'aspect-[4/5]', preferred: ['square', 'portrait'] },
    { className: 'md:col-span-4', frameFallback: 'aspect-[16/10]', preferred: ['landscape', 'portrait'] }
  ]
};

const getOrientationCounts = (images) => images.reduce((acc, image) => {
  const orientation = getImageOrientation(image);
  acc[orientation] = (acc[orientation] || 0) + 1;
  return acc;
}, { landscape: 0, portrait: 0, square: 0 });

const getLayoutVariant = (images) => {
  const counts = getOrientationCounts(images);
  const nonSquareCount = counts.landscape + counts.portrait;

  if (nonSquareCount > 0) {
    if (counts.landscape / nonSquareCount >= DOMINANCE_THRESHOLD) return 'landscapeDominant';
    if (counts.portrait / nonSquareCount >= DOMINANCE_THRESHOLD) return 'portraitDominant';
  }

  return 'mixed';
};

const getPatternForGroup = (images, variant) => {
  if (variant === 'landscapeDominant') {
    if (images.length === 1) return LANDSCAPE_PATTERNS.single;
    if (images.length === 2) return LANDSCAPE_PATTERNS.pair;
    if (images.length === 3) return LANDSCAPE_PATTERNS.trio;
    return LANDSCAPE_PATTERNS.series;
  }

  if (variant === 'portraitDominant') {
    if (images.length === 1) return PORTRAIT_PATTERNS.single;
    if (images.length === 2) return PORTRAIT_PATTERNS.pair;
    return PORTRAIT_PATTERNS.series;
  }

  const counts = getOrientationCounts(images);
  if (counts.landscape >= 2 && counts.portrait >= 2) return MIXED_PATTERNS.story;
  return MIXED_PATTERNS.balanced;
};

const orderAdaptiveImages = (images, pattern) => {
  const remaining = [...images];

  return pattern.slice(0, images.length).map((slot) => {
    const matchIndex = remaining.findIndex((image) => slot.preferred.includes(getImageOrientation(image)));
    const selectedIndex = matchIndex >= 0 ? matchIndex : 0;
    const [selected] = remaining.splice(selectedIndex, 1);
    return selected;
  });
};

const buildEditorialGroups = (images, compositionMode) => {
  const groups = [];

  for (let index = 0; index < images.length; index += GROUP_SIZE) {
    const chunk = images.slice(index, index + GROUP_SIZE);
    const variant = getLayoutVariant(chunk);
    const pattern = getPatternForGroup(chunk, variant);
    const orderedImages = compositionMode === 'chronological'
      ? chunk
      : orderAdaptiveImages(chunk, pattern);

    groups.push({
      id: `${variant}-${index}`,
      images: orderedImages,
      pattern,
      variant
    });
  }

  return groups;
};

const getEditorialFrameClass = (image, slot) => {
  if (slot.frameClass) return slot.frameClass;

  if (slot.frameType === 'feature') {
    return getImageOrientation(image) === 'landscape'
      ? 'aspect-[16/9] md:aspect-[21/9]'
      : 'aspect-[3/4] md:w-[58%] md:mx-auto';
  }

  return getAspectClass(image, slot.frameFallback || 'aspect-[4/5]');
};

const EditorialImageSlot = React.memo(({ image, index, slot, onImageClick }) => {
  const Tile = slot.parallax ? ParallaxGalleryImageTile : GalleryImageTile;
  const frameClass = getEditorialFrameClass(image, slot);

  return (
    <div className={slot.className}>
      <Tile
        image={image}
        index={index}
        onImageClick={onImageClick}
        className={`${frameClass} rounded-sm ${slot.featured ? 'shadow-xl' : ''}`}
        imageClassName="object-center"
        parallax={slot.parallax}
      />
    </div>
  );
});

const EditorialGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);
  const sectionDetails = getSectionDetails(gallery, section);
  const compositionMode = sectionDetails.compositionMode === 'chronological' ? 'chronological' : 'adaptive';
  const groups = buildEditorialGroups(images, compositionMode);

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
        {groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 md:items-start"
          >
            {group.images.map((image, imageIndex) => (
              <EditorialImageSlot
                key={getImageKey(image, `${section}-${groupIndex}-${imageIndex}`)}
                image={image}
                index={(groupIndex * GROUP_SIZE) + imageIndex}
                slot={group.pattern[imageIndex] || MIXED_PATTERNS.balanced[imageIndex % MIXED_PATTERNS.balanced.length]}
                onImageClick={onImageClick}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default EditorialGallerySection;
