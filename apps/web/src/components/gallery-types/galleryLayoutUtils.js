export const getImageUrl = (image) => (typeof image === 'string' ? image : image?.url || '');

export const getImageKey = (image, fallback) => {
  if (typeof image === 'string') return image;
  return image?.id || image?.filename || fallback;
};

export const getImageAlt = (image, fallback) => {
  if (typeof image === 'string') return fallback;
  return image?.caption || image?.filename || fallback;
};

export const getImageOrientation = (image) => {
  if (typeof image === 'string') return 'portrait';
  return image?.orientation || 'portrait';
};

export const getSectionDetails = (gallery, sectionTitle) => {
  return gallery.sections?.find(s => (s.sectionTitle || s.name) === sectionTitle) || {};
};

export const chunkByPattern = (images, pattern) => {
  const chunks = [];
  let imageIndex = 0;
  let patternIndex = 0;

  while (imageIndex < images.length) {
    const nextPattern = pattern[patternIndex % pattern.length];
    const requestedCount = Math.min(nextPattern.count, images.length - imageIndex);

    chunks.push({
      ...nextPattern,
      items: images.slice(imageIndex, imageIndex + requestedCount)
    });

    imageIndex += requestedCount;
    patternIndex += 1;
  }

  return chunks.filter(chunk => chunk.items.length > 0);
};

export const getAspectClass = (image, fallback = 'aspect-[3/4]') => {
  const orientation = getImageOrientation(image);

  if (orientation === 'landscape') return 'aspect-[16/10]';
  if (orientation === 'square') return 'aspect-square';
  return fallback;
};
