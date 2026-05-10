
import { format, differenceInDays } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

export const detectImageOrientation = (width, height) => {
  if (!width || !height) return 'portrait'; // default fallback
  const ratio = width / height;
  if (ratio > 1.1) return 'landscape';
  if (ratio < 0.9) return 'portrait';
  return 'square';
};

export const naturalSort = (images, keyFn = (img) => img.filename || '') => {
  return [...images].sort((a, b) => {
    return keyFn(a).localeCompare(keyFn(b), undefined, { numeric: true, sensitivity: 'base' });
  });
};

const normalizeFilename = (filename = '') => filename.toLowerCase().replace(/\.jpe?g$/, '.jpg');

const getImageCount = (gallery) => {
  if (!gallery) return 0;
  if (Array.isArray(gallery.images) && gallery.images.length > 0) return gallery.images.length;
  if (Array.isArray(gallery.galleryImages) && gallery.galleryImages.length > 0) return gallery.galleryImages.length;
  return parseInt(gallery.imageCount || 0, 10) || 0;
};

const getMetadataForFile = (metadata, filename, index) => {
  if (!Array.isArray(metadata) || metadata.length === 0) return {};

  const normalized = normalizeFilename(filename);
  const byFilename = metadata.find((item) => normalizeFilename(item.filename) === normalized);
  if (byFilename) return byFilename;

  return metadata[index] || {};
};

const getPocketBaseFileUrls = (gallery, filename) => {
  let url = '';
  let thumbUrl = '';

  try {
    url = pb.files.getURL(gallery, filename);
    thumbUrl = pb.files.getURL(gallery, filename, { thumb: '300x300' });
  } catch (e) {
    url = '';
    thumbUrl = '';
  }

  return { url, thumbUrl };
};

export const normalizeGalleryImages = (gallery) => {
  if (!gallery) return [];

  const files = Array.isArray(gallery.galleryImages) ? gallery.galleryImages : [];
  const metadata = Array.isArray(gallery.images) ? gallery.images : [];

  if (metadata.length > 0) {
    const normalizedFromMetadata = metadata
      .filter((meta) => meta && (meta.url || meta.filename))
      .map((meta, index) => {
        const filename = meta.filename || files[index] || `${index + 1}.jpg`;
        const hasPocketBaseFile = files.some((file) => normalizeFilename(file) === normalizeFilename(filename));
        let url = meta.url || '';
        let thumbUrl = meta.thumbUrl || '';

        if (hasPocketBaseFile) {
          const fileUrls = getPocketBaseFileUrls(gallery, filename);
          url = fileUrls.url || meta.url || '';
          thumbUrl = fileUrls.thumbUrl || meta.thumbUrl || url;
        }

        return {
          id: meta.id || `${gallery.id}-${index}`,
          filename,
          width: meta.width || 0,
          height: meta.height || 0,
          orientation: meta.orientation || detectImageOrientation(meta.width, meta.height),
          uploadedAt: meta.uploadedAt || '',
          section: meta.section || 'default',
          caption: meta.caption || '',
          url,
          thumbUrl: thumbUrl || url
        };
      });

    const knownFilenames = new Set(
      normalizedFromMetadata.map((image) => normalizeFilename(image.filename))
    );

    const missingFileImages = files
      .filter((filename) => filename && !knownFilenames.has(normalizeFilename(filename)))
      .map((filename, index) => {
        const fileUrls = getPocketBaseFileUrls(gallery, filename);
        return {
          id: `${gallery.id}-file-${index}`,
          filename,
          width: 0,
          height: 0,
          orientation: 'portrait',
          uploadedAt: '',
          section: 'default',
          caption: '',
          url: fileUrls.url,
          thumbUrl: fileUrls.thumbUrl || fileUrls.url
        };
      });

    return [
      ...normalizedFromMetadata,
      ...naturalSort(missingFileImages)
    ];
  }

  if (files.length > 0) {
    return files.map((filename, index) => {
      const meta = getMetadataForFile(metadata, filename, index);
      const fileUrls = getPocketBaseFileUrls(gallery, filename);
      const url = fileUrls.url;
      const thumbUrl = fileUrls.thumbUrl || url;

      return {
        id: meta.id || `${gallery.id}-${index}`,
        filename,
        width: meta.width || 0,
        height: meta.height || 0,
        orientation: meta.orientation || detectImageOrientation(meta.width, meta.height),
        uploadedAt: meta.uploadedAt || '',
        section: meta.section || 'default',
        caption: meta.caption || '',
        url,
        thumbUrl
      };
    });
  }

  return [];
};

export const getGalleryImageByIndex = (gallery, index) => {
  const images = normalizeGalleryImages(gallery);
  const parsedIndex = parseInt(index, 10);
  if (Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < images.length) {
    return images[parsedIndex];
  }
  return null;
};

export const getGalleryHeroImageUrl = (gallery) => {
  return getGalleryImageByIndex(gallery, gallery?.heroImageIndex)?.url
    || gallery?.heroImage
    || gallery?.coverImage
    || normalizeGalleryImages(gallery)[0]?.url
    || '';
};

export const getGalleryCoverImageUrl = (gallery) => {
  return getGalleryImageByIndex(gallery, gallery?.coverImageIndex)?.url
    || gallery?.coverImage
    || gallery?.heroImage
    || normalizeGalleryImages(gallery)[0]?.url
    || '';
};

const getAutomaticSection = (gallery) => ({
  id: 'auto-gallery',
  sectionTitle: 'Moments',
  sectionDescription: '',
  startImageIndex: 0,
  endImageIndex: Math.max(0, getImageCount(gallery) - 1),
  isVisible: true,
  order: 0,
  isAutomatic: true
});

const normalizeSectionFilenameSet = (section) => {
  return new Set((section.imageFilenames || []).map(normalizeFilename).filter(Boolean));
};

export const getVisibleSections = (gallery) => {
  if (!gallery) return [];

  const allImages = normalizeGalleryImages(gallery);
  const sectionCandidates = (gallery.sections || [])
    .filter(section => !section.isAtelierConfig)
    .filter(section => Array.isArray(section.imageFilenames) && section.imageFilenames.length > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (sectionCandidates.length === 0) {
    return [getAutomaticSection(gallery)];
  }

  const assignedFilenames = new Set();
  sectionCandidates.forEach(section => {
    section.imageFilenames.forEach(filename => assignedFilenames.add(normalizeFilename(filename)));
  });

  const visibleSections = sectionCandidates.filter(section => section.isVisible !== false);
  const unassignedFilenames = allImages
    .filter(image => image.filename && !assignedFilenames.has(normalizeFilename(image.filename)))
    .map(image => image.filename);

  if (unassignedFilenames.length > 0) {
    visibleSections.push({
      id: 'unassigned',
      sectionTitle: 'Unassigned',
      sectionDescription: '',
      imageFilenames: unassignedFilenames,
      isVisible: true,
      order: visibleSections.length,
      isSystem: true
    });
  }

  return visibleSections;
};

export const validateSectionRanges = (sections, imageCount) => {
  const errors = [];
  const ranges = [];
  let maxCovered = -1;

  sections.forEach((sec, idx) => {
    const title = sec.sectionTitle || sec.name || `Section ${idx + 1}`;
    const start = parseInt(sec.startImageIndex ?? sec.startImage ?? 0);
    const end = parseInt(sec.endImageIndex ?? sec.endImage ?? 0);

    if (start < 0 || end < start) {
      errors.push(`"${title}" has an invalid image range.`);
    }
    if (imageCount && end >= imageCount) {
      errors.push(`"${title}" ends at ${end}, exceeding total images (${imageCount - 1} max index).`);
    }

    for (const r of ranges) {
      if (Math.max(start, r.start) <= Math.min(end, r.end)) {
        errors.push(`"${title}" overlaps with another section.`);
        break;
      }
    }
    ranges.push({ start, end });
    maxCovered = Math.max(maxCovered, end);
  });

  if (imageCount > 0 && maxCovered < imageCount - 1) {
    errors.push(`Warning: ${imageCount - 1 - maxCovered} images at the end of the gallery are not assigned to any section.`);
  }

  return errors;
};

export const calculateSectionImageCount = (section) => {
  if (!section) return 0;
  const start = parseInt(section.startImageIndex ?? section.startImage ?? 0);
  const end = parseInt(section.endImageIndex ?? section.endImage ?? 0);
  return Math.max(0, end - start + 1);
};

export const getImagesBySection = (gallery, sectionIndexOrName) => {
  if (!gallery) {
    return [];
  }

  const allImages = normalizeGalleryImages(gallery);
  if (sectionIndexOrName === undefined || sectionIndexOrName === null) {
    return allImages;
  }

  let section;
  if (typeof sectionIndexOrName === 'number') {
    section = getVisibleSections(gallery)[sectionIndexOrName];
  } else {
    section = getVisibleSections(gallery).find(s => s.sectionTitle === sectionIndexOrName || s.name === sectionIndexOrName);
  }

  if (!section) {
    return [];
  }

  if (section.isAutomatic) {
    return allImages;
  }

  if (Array.isArray(section.imageFilenames) && section.imageFilenames.length > 0) {
    const selectedFilenames = normalizeSectionFilenameSet(section);
    return allImages.filter(image => selectedFilenames.has(normalizeFilename(image.filename)));
  }

  const start = parseInt(section.startImageIndex ?? section.startImage ?? 0);
  const end = parseInt(section.endImageIndex ?? section.endImage ?? 0);
  const safeStart = Math.max(0, start);
  const safeEnd = Math.min(allImages.length - 1, end);

  if (safeStart > safeEnd) return [];
  return allImages.slice(safeStart, safeEnd + 1);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMMM d, yyyy');
};

export const calculateExpirationDays = (expirationDate) => {
  if (!expirationDate) return null;
  
  const days = differenceInDays(new Date(expirationDate), new Date());
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
};
