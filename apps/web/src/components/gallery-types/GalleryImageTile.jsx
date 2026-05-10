import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { getImageAlt, getImageUrl } from '@/components/gallery-types/galleryLayoutUtils.js';

const getImageClasses = (imageClassName) => (
  `w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03] ${imageClassName}`
);

export const GalleryImageTile = React.memo(({
  image,
  index,
  onImageClick,
  className = '',
  imageClassName = '',
  motionClassName = '',
  overlayClassName = ''
}) => {
  const shouldReduceMotion = useReducedMotion();
  const url = getImageUrl(image);

  return (
    <motion.button
      type="button"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`relative block w-full overflow-hidden bg-muted text-left group ${className} ${motionClassName}`}
      onClick={() => onImageClick(url)}
    >
      <img
        src={url}
        alt={getImageAlt(image, `Gallery moment ${index + 1}`)}
        loading="lazy"
        className={getImageClasses(imageClassName)}
      />
      {overlayClassName && <span className={`absolute inset-0 pointer-events-none ${overlayClassName}`} />}
    </motion.button>
  );
});

export const ParallaxGalleryImageTile = React.memo(({
  image,
  index,
  onImageClick,
  className = '',
  imageClassName = '',
  parallax = [-34, 34],
  overlayClassName = ''
}) => {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], parallax);
  const url = getImageUrl(image);

  return (
    <motion.button
      ref={ref}
      type="button"
      style={shouldReduceMotion ? undefined : { y }}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`relative block w-full overflow-hidden bg-muted text-left group ${className}`}
      onClick={() => onImageClick(url)}
    >
      <img
        src={url}
        alt={getImageAlt(image, `Gallery moment ${index + 1}`)}
        loading="lazy"
        className={getImageClasses(imageClassName)}
      />
      {overlayClassName && <span className={`absolute inset-0 pointer-events-none ${overlayClassName}`} />}
    </motion.button>
  );
});
