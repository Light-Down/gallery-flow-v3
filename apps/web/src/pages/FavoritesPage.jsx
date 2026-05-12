
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import Lightbox from '@/components/Lightbox.jsx';
import ImageGrid from '@/components/premium/ImageGrid.jsx';
import ErrorBoundary from '@/components/ErrorBoundary';
import { trackGalleryEvent } from '@/lib/galleryAnalytics.js';

const FavoritesPage = () => {
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

        setGallery(galleries[0]);
        trackGalleryEvent({
          eventType: 'favorites_view',
          gallerySlug: slug,
          result: 'success',
          metadata: {
            favoriteCount: JSON.parse(localStorage.getItem('favorites') || '{}')?.[slug]?.length || 0,
          },
        });

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

  const toggleFavorite = (imageUrl) => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const galleryFavorites = storedFavorites[slug] || [];

    const newFavorites = galleryFavorites.filter(url => url !== imageUrl);
    storedFavorites[slug] = newFavorites;
    localStorage.setItem('favorites', JSON.stringify(storedFavorites));
    setFavorites(newFavorites);

    toast.success('Removed from favorites');
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDownloadFavorites = () => {
    toast.success('Preparing your favorites for download. This feature is coming soon.');
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

  return (
    <ErrorBoundary>
      <>
        <Helmet>
          <title>{`Favorites - ${gallery.coupleNames}`}</title>
          <meta name="description" content={`Favorite photos from ${gallery.coupleNames} wedding gallery`} />
        </Helmet>

        <div className="min-h-screen bg-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/gallery/${slug}`)}
                  className="mb-6 -ml-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to gallery
                </Button>

                <h1 className="text-4xl md:text-5xl font-editorial font-bold mb-4">
                  Your Collection
                </h1>
                <p className="text-muted-foreground text-lg">
                  {favorites.length} {favorites.length === 1 ? 'image' : 'images'} favorited
                </p>
              </div>

              {favorites.length > 0 && (
                <Button onClick={handleDownloadFavorites} className="h-12 px-6">
                  <Download className="w-4 h-4 mr-2" />
                  Download Favorites
                </Button>
              )}
            </div>

            {favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32 bg-card rounded-2xl border border-border"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-editorial font-bold mb-4">No favorites yet</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                  As you browse the gallery, click the heart icon on any photo to add it to your personal collection.
                </p>
                <Button size="lg" onClick={() => navigate(`/gallery/${slug}`)}>
                  Browse gallery
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence>
                <ImageGrid
                  images={favorites}
                  type="editorial"
                  onImageClick={openLightbox}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </AnimatePresence>
            )}
          </div>
        </div>

        {lightboxOpen && favorites.length > 0 && (
          <Lightbox
            images={favorites}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onNavigate={setLightboxIndex}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </>
    </ErrorBoundary>
  );
};

export default FavoritesPage;
