
import React from 'react';
import EditorialGallerySection from '@/components/gallery-types/EditorialGallerySection.jsx';
import DocumentaryGallerySection from '@/components/gallery-types/DocumentaryGallerySection.jsx';
import MinimalGallerySection from '@/components/gallery-types/MinimalGallerySection.jsx';
import CinematicGallerySection from '@/components/gallery-types/CinematicGallerySection.jsx';
import AtelierEditorialGallery from '@/components/gallery-types/AtelierEditorialGallery.jsx';
import { getVisibleSections } from '@/utils/galleryHelpers.js';
import { isValidGalleryType } from '@/utils/galleryTypeConfig.js';

const GalleryTypeRenderer = ({ gallery, onImageClick, favorites, onToggleFavorite }) => {
  if (!gallery) return null;

  let typeToRender = gallery.galleryType;

  if (!isValidGalleryType(typeToRender)) {
    console.warn(`Unknown gallery type: "${typeToRender}", falling back to editorial`);
    typeToRender = 'editorial';
  }

  const visibleSections = getVisibleSections(gallery);

  if (typeToRender === 'atelier-editorial') {
    return (
      <AtelierEditorialGallery 
        gallery={gallery} 
        onLightbox={onImageClick} 
        onFavorite={onToggleFavorite} 
        favorites={favorites} 
      />
    );
  }

  return (
    <div className="flex flex-col w-full">
      {visibleSections.map((section, idx) => {
        const sectionTitle = section.sectionTitle || section.name;
        
        const props = { 
          gallery, 
          section: sectionTitle, 
          onImageClick, 
          favorites, 
          onToggleFavorite 
        };

        switch (typeToRender) {
          case 'documentary':
            return <DocumentaryGallerySection key={section.id || idx} {...props} />;
          case 'minimal':
            return <MinimalGallerySection key={section.id || idx} {...props} />;
          case 'cinematic':
            return <CinematicGallerySection key={section.id || idx} {...props} />;
          case 'editorial':
          default:
            return <EditorialGallerySection key={section.id || idx} {...props} />;
        }
      })}
    </div>
  );
};

export default GalleryTypeRenderer;
