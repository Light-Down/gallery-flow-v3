
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Download, Share2, Heart, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

const GalleryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        toast.error('Failed to load gallery');
        navigate('/gallery-access');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [slug, navigate]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Gallery link copied to clipboard');
  };

  const handleDownload = () => {
    if (gallery?.driveDownloadUrl) {
      window.open(gallery.driveDownloadUrl, '_blank');
    } else {
      toast.error('Download link not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!gallery) return null;

  const firstSection = gallery.sections?.[0]?.name || 'getting-ready';
  const expirationDate = gallery.expirationDate ? new Date(gallery.expirationDate) : null;
  const isExpired = expirationDate && expirationDate < new Date();

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{`${gallery.coupleNames} - Wedding gallery`}</title>
        <meta name="description" content={`Wedding photography gallery for ${gallery.coupleNames} at ${gallery.location}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src={gallery.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552'}
            alt={`${gallery.coupleNames} wedding`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-2xl shadow-lg p-8 md:p-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 leading-tight">
              {gallery.coupleNames}
            </h1>

            <div className="flex flex-wrap justify-center gap-6 mb-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{format(new Date(gallery.date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{gallery.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <span>{gallery.imageCount} photos</span>
              </div>
            </div>

            {isExpired && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8 text-center">
                <p className="text-destructive text-sm">
                  This gallery expired on {format(expirationDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {expirationDate && !isExpired && (
              <div className="bg-accent/50 rounded-xl p-4 mb-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Gallery available until {format(expirationDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate(`/gallery/${slug}/${firstSection}`)}
                className="w-full"
              >
                View gallery
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="w-5 h-5 mr-2" />
                Download all
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="ghost"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share link
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(`/gallery/${slug}/favorites`)}
              >
                <Heart className="w-5 h-5 mr-2" />
                View favorites
              </Button>
            </div>

            {gallery.sections && gallery.sections.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-semibold mb-6">Gallery sections</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.sections.map((section, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => navigate(`/gallery/${slug}/${section.name}`)}
                      className="justify-start h-auto py-4 px-6"
                    >
                      <div className="text-left">
                        <p className="font-medium capitalize">{section.name.replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {section.endImage - section.startImage + 1} photos
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="py-12"></div>
      </div>
    </ErrorBoundary>
  );
};

export default GalleryPage;
