
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { getVisibleSections, getImagesBySection, getGalleryHeroImageUrl } from '@/utils/galleryHelpers.js';
import { getGalleryTypeLabel } from '@/utils/galleryTypeConfig.js';
import { toast } from 'sonner';

import ImmersiveHeroSection from '@/components/premium/ImmersiveHeroSection.jsx';
import Lightbox from '@/components/Lightbox.jsx';
import ExpirationBadge from '@/components/premium/ExpirationBadge.jsx';
import ErrorBoundary from '@/components/ErrorBoundary';
import GalleryTypeRenderer from '@/components/premium/GalleryTypeRenderer.jsx';

const ImmersiveGalleryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      if (!pb.authStore.isValid) {
        navigate('/gallery-access');
        return false;
      }
      return true;
    };

    const fetchGallery = async () => {
      if (!checkAuth()) return;
      try {
        const galleries = await pb.collection('galleries').getFullList({
          filter: pb.filter('slug = {:slug}', { slug }),
          $autoCancel: false
        });

        if (galleries.length === 0) {
          navigate('/gallery-access');
          return;
        }

        const activeGallery = galleries[0];
        setGallery(activeGallery);

        const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
        setFavorites(storedFavorites[slug] || []);
      } catch (err) {
        toast.error('Failed to load gallery');
        navigate('/gallery-access');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [slug, navigate]);

  const toggleFavorite = useCallback((imageUrl) => {
    setFavorites(prev => {
      const newFavs = prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl];

      const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
      storedFavorites[slug] = newFavs;
      localStorage.setItem('favorites', JSON.stringify(storedFavorites));
      return newFavs;
    });
  }, [slug]);

  const visibleSections = useMemo(() => getVisibleSections(gallery), [gallery]);

  const allImagesObj = useMemo(() => {
    if (!gallery) return [];
    return visibleSections.flatMap(s => {
      const sectionImages = getImagesBySection(gallery, s.sectionTitle || s.name);
      return sectionImages;
    });
  }, [gallery, visibleSections]);
  
  // Extract clean URLs for Lightbox
  const allImageUrls = useMemo(() => allImagesObj.map(img => img.url || img), [allImagesObj]);

  const openLightbox = useCallback((imageUrl) => {
    const idx = allImageUrls.indexOf(imageUrl);
    if (idx !== -1) {
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }
  }, [allImageUrls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-minimal uppercase tracking-widest text-xs">Loading Experience</p>
      </div>
    );
  }

  if (!gallery) return null;

  const galleryLabel = getGalleryTypeLabel(gallery.galleryType);

  if (gallery.galleryType === 'atelier-editorial') {
    return (
      <ErrorBoundary>
        <>
          <Helmet>
            <title>{`${gallery.coupleNames} - ${galleryLabel}`}</title>
            <meta name="description" content={`${galleryLabel} wedding photography for ${gallery.coupleNames}`} />
          </Helmet>

          <GalleryTypeRenderer
            gallery={gallery}
            onImageClick={openLightbox}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />

          {lightboxOpen && allImageUrls.length > 0 && (
            <Lightbox
              images={allImageUrls}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
              onNavigate={setLightboxIndex}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              downloadUrl={gallery.driveDownloadUrl}
            />
          )}
        </>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <Helmet>
          <title>{`${gallery.coupleNames} - ${galleryLabel}`}</title>
          <meta name="description" content={`${galleryLabel} wedding photography experience for ${gallery.coupleNames}`} />
        </Helmet>

        <main className="bg-background min-h-screen relative w-full selection:bg-primary selection:text-primary-foreground">

          {gallery.expirationDate && (
            <div className="absolute top-6 right-6 z-50">
              <ExpirationBadge expirationDate={gallery.expirationDate} />
            </div>
          )}

          <ImmersiveHeroSection
            coupleNames={gallery.coupleNames}
            date={gallery.date}
            location={gallery.location}
            coverImage={getGalleryHeroImageUrl(gallery)}
          />

          <GalleryTypeRenderer
            gallery={gallery}
            onImageClick={openLightbox}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />

          <div className="py-32 flex flex-col items-center justify-center bg-card border-t border-border text-center px-4">
            <h2 className="text-4xl md:text-5xl font-editorial mb-8 text-foreground">The End</h2>
            <div className="flex flex-col md:flex-row gap-6">
               <button
                  onClick={() => navigate(`/gallery/${slug}/favorites`)}
                  className="px-8 py-4 border border-border hover:bg-muted text-foreground transition-all duration-300 rounded-md uppercase tracking-widest text-sm font-minimal"
                >
                  View Favorites
               </button>
               <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-4 border border-border hover:bg-muted text-foreground transition-all duration-300 rounded-md uppercase tracking-widest text-sm font-minimal"
                >
                  Back to Top
               </button>
            </div>
          </div>

        </main>

        {lightboxOpen && allImageUrls.length > 0 && (
          <Lightbox
            images={allImageUrls}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onNavigate={setLightboxIndex}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            downloadUrl={gallery.driveDownloadUrl}
          />
        )}
      </>
    </ErrorBoundary>
  );
};

export default ImmersiveGalleryPage;
