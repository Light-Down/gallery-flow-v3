
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Lightbox from '@/components/Lightbox.jsx';
import GalleryTypeRenderer from '@/components/premium/GalleryTypeRenderer.jsx';
import MetadataCard from '@/components/premium/MetadataCard.jsx';
import ExpirationBadge from '@/components/premium/ExpirationBadge.jsx';
import ErrorBoundary from '@/components/ErrorBoundary';

const GallerySectionPage = () => {
  const { slug, section } = useParams();
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

        const galleryData = galleries[0];
        setGallery(galleryData);

        const currentSection = galleryData.sections?.find(s => s.name === section);
        if (!currentSection) {
          navigate(`/gallery/${slug}`);
          return;
        }

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
  }, [slug, section, navigate]);

  const toggleFavorite = (imageUrl) => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const galleryFavorites = storedFavorites[slug] || [];

    const newFavorites = galleryFavorites.includes(imageUrl)
      ? galleryFavorites.filter(url => url !== imageUrl)
      : [...galleryFavorites, imageUrl];

    storedFavorites[slug] = newFavorites;
    localStorage.setItem('favorites', JSON.stringify(storedFavorites));
    setFavorites(newFavorites);

    toast.success(
      galleryFavorites.includes(imageUrl) ? 'Removed from favorites' : 'Added to favorites'
    );
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getCurrentSectionIndex = () => {
    return gallery?.sections?.findIndex(s => s.name === section) || 0;
  };

  const navigateToSection = (direction) => {
    const currentIndex = getCurrentSectionIndex();
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < gallery.sections.length) {
      navigate(`/gallery/${slug}/${gallery.sections[newIndex].name}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) return null;

  const currentSectionData = gallery.sections?.find(s => s.name === section);
  const currentIndex = getCurrentSectionIndex();
  const hasPrevSection = currentIndex > 0;
  const hasNextSection = currentIndex < gallery.sections.length - 1;

  // Calculate images for lightbox from galleryImages file field or images array
  const images = [];
  const sectionStart = parseInt(currentSectionData?.startImage ?? currentSectionData?.startImageIndex ?? 0);
  const sectionEnd = parseInt(currentSectionData?.endImage ?? currentSectionData?.endImageIndex ?? 0);

  if (currentSectionData && gallery.galleryImages && gallery.galleryImages.length > 0) {
    const safeStart = Math.max(0, sectionStart);
    const safeEnd = Math.min(gallery.galleryImages.length - 1, sectionEnd);
    for (let i = safeStart; i <= safeEnd; i++) {
      const filename = gallery.galleryImages[i];
      if (filename) {
        images.push(pb.files.getUrl(gallery, filename));
      }
    }
  } else if (currentSectionData && gallery.images && gallery.images.length > 0) {
    // Fallback to JSON images array for legacy galleries
    const safeStart = Math.max(0, sectionStart);
    const safeEnd = Math.min(gallery.images.length - 1, sectionEnd);
    for (let i = safeStart; i <= safeEnd; i++) {
      const img = gallery.images[i];
      if (img) {
        images.push(typeof img === 'string' ? img : (img.url || ''));
      }
    }
  }

  return (
    <ErrorBoundary>
      <>
        <Helmet>
          <title>{`${currentSectionData?.name.replace(/-/g, ' ')} - ${gallery.coupleNames}`}</title>
          <meta name="description" content={`${currentSectionData?.name.replace(/-/g, ' ')} photos from ${gallery.coupleNames} wedding`} />
        </Helmet>

        <div className="min-h-screen bg-background">
          {/* Header Area */}
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/gallery/${slug}`)}
                className="self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to gallery
              </Button>

              <div className="flex items-center gap-4">
                <ExpirationBadge expirationDate={gallery.expirationDate} />
              </div>
            </div>
          </div>

          {/* Metadata Card (only show if not cinematic, cinematic handles its own hero) */}
          {gallery.galleryType !== 'cinematic' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <MetadataCard gallery={gallery} />
            </div>
          )}

          {/* Dynamic Gallery Renderer */}
          <GalleryTypeRenderer
            gallery={gallery}
            section={section}
            onImageClick={openLightbox}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />

          {/* Section Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigateToSection(-1)}
                disabled={!hasPrevSection}
                className="h-12 px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous section
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateToSection(1)}
                disabled={!hasNextSection}
                className="h-12 px-6"
              >
                Next section
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {lightboxOpen && (
          <Lightbox
            images={images}
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

export default GallerySectionPage;
