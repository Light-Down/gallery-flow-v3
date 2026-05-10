
export const GALLERY_TYPES = [
  { 
    value: 'editorial', 
    label: 'Editorial', 
    description: 'Masonry layouts, serif typography, elegant whitespace, and soft fades.' 
  },
  { 
    value: 'documentary', 
    label: 'Documentary', 
    description: 'Chronological timeline flow, emotional pacing, and narrative story beats.' 
  },
  { 
    value: 'minimal', 
    label: 'Minimal', 
    description: 'Clean uniform grid, functional delivery, sans-serif, and tight spacing.' 
  },
  { 
    value: 'cinematic', 
    label: 'Cinematic', 
    description: 'Fullscreen immersive scrolling, dark mood, and dramatic parallax motion.' 
  },
  { 
    value: 'atelier-editorial', 
    label: 'Atelier Editorial', 
    description: 'High-fashion magazine aesthetic, asymmetric layouts, and big typography.' 
  }
];

export const getAllGalleryTypes = () => GALLERY_TYPES;

export const getGalleryTypeByValue = (value) => {
  return GALLERY_TYPES.find(type => type.value === value) || GALLERY_TYPES[0];
};

export const getGalleryTypeLabel = (value) => {
  return getGalleryTypeByValue(value).label;
};

export const getGalleryTypeDescription = (value) => {
  return getGalleryTypeByValue(value).description;
};

export const isValidGalleryType = (value) => {
  return GALLERY_TYPES.some(type => type.value === value);
};
