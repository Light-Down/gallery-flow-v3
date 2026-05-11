
import React from 'react';
import { getImagesBySection } from '@/utils/galleryHelpers.js';
import { motion, useReducedMotion } from 'framer-motion';
import { getImageAlt, getImageKey, getImageOrientation, getImageUrl, getSectionDetails } from '@/components/gallery-types/galleryLayoutUtils.js';

const GROUP_SIZE = 6;
const DOMINANCE_THRESHOLD = 0.8;

const LANDSCAPE_PATTERNS = {
  single: [
    { className: 'sm:col-span-6 md:col-span-10 md:col-start-2 xl:col-span-9 xl:col-start-2', preferred: ['landscape', 'square'] }
  ],
  pair: [
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-7', preferred: ['landscape', 'square'] }
  ],
  trio: [
    { className: 'sm:col-span-6 md:col-span-10 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-7', preferred: ['landscape', 'square'] }
  ],
  series: [
    { className: 'sm:col-span-6 md:col-span-10 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-7', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-6 md:col-span-8 md:col-start-3', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-7', preferred: ['landscape', 'square'] }
  ]
};

const PORTRAIT_PATTERNS = {
  single: [
    { className: 'sm:col-span-4 sm:col-start-2 md:col-span-4 md:col-start-5', preferred: ['portrait', 'square'] }
  ],
  pair: [
    { className: 'sm:col-span-3 md:col-span-4 md:col-start-3', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-3 md:col-span-4 md:col-start-7 md:mt-10', preferred: ['portrait', 'square'] }
  ],
  series: [
    { className: 'sm:col-span-2 md:col-span-4', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-2 md:col-span-4 md:mt-10', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-2 md:col-span-4', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-3 md:col-span-4 md:col-start-3', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-3 md:col-span-4 md:col-start-7 md:mt-10', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-6 md:col-span-4 md:col-start-5', preferred: ['portrait', 'square'] }
  ]
};

const MIXED_PATTERNS = {
  story: [
    { className: 'sm:col-span-3 md:col-span-3 md:col-start-1', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-3 md:col-span-3 md:col-start-4 md:mt-16', preferred: ['portrait'] },
    { className: 'sm:col-span-6 md:col-span-6 md:col-start-7', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-6 md:col-span-5 md:col-start-2', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-3 md:col-start-7 md:mt-10', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-3 md:col-span-3 md:col-start-10 md:mt-10', preferred: ['portrait', 'landscape'] }
  ],
  balanced: [
    { className: 'sm:col-span-3 md:col-span-4 md:col-start-1', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-3 md:col-span-4 md:col-start-5', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-6 md:col-span-4 md:col-start-9', preferred: ['portrait', 'landscape'] },
    { className: 'sm:col-span-3 md:col-span-5 md:col-start-2 md:mt-8', preferred: ['landscape', 'square'] },
    { className: 'sm:col-span-3 md:col-span-3 md:col-start-7 md:mt-8', preferred: ['portrait', 'square'] },
    { className: 'sm:col-span-6 md:col-span-3 md:col-start-10 md:mt-8', preferred: ['portrait', 'landscape'] }
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

const buildDocumentaryGroups = (images, compositionMode) => {
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
      pattern,
      images: orderedImages
    });
  }

  return groups;
};

const getDocumentaryImageClass = (image) => {
  const orientation = getImageOrientation(image);

  if (orientation === 'landscape') return 'w-full max-h-[min(72vh,44rem)] object-contain';
  if (orientation === 'square') return 'w-full max-h-[min(66vh,38rem)] object-contain';

  return 'h-auto max-h-[min(78vh,48rem)] w-auto max-w-full object-contain';
};

const DocumentaryImage = React.memo(({ image, index, slot, onImageClick }) => {
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
      className={`group relative flex w-full cursor-pointer justify-center self-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background ${slot.className}`}
      onClick={() => onImageClick(url)}
    >
      <img
        src={url}
        alt={getImageAlt(image, `Documentary image ${index + 1}`)}
        loading="lazy"
        className={`block transition-opacity duration-200 group-hover:opacity-90 ${getDocumentaryImageClass(image)}`}
      />
    </motion.button>
  );
});

const DocumentaryGallerySection = ({ gallery, section, onImageClick, favorites, onToggleFavorite }) => {
  const images = getImagesBySection(gallery, section);
  const sectionDetails = getSectionDetails(gallery, section);
  const compositionMode = sectionDetails.compositionMode === 'chronological' ? 'chronological' : 'adaptive';
  const groups = buildDocumentaryGroups(images, compositionMode);

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

        <div className="space-y-14 md:space-y-20 xl:space-y-24">
          {groups.map((group, groupIndex) => (
            <div
              key={group.id}
              className="grid grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-6 md:grid-cols-12 md:gap-x-8 md:gap-y-10 xl:gap-x-10"
            >
              {group.images.map((image, imageIndex) => (
                <DocumentaryImage
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
      </div>
    </section>
  );
}

export default DocumentaryGallerySection;
