
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, Lock } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { trackGalleryEvent } from '@/lib/galleryAnalytics.js';

const GalleryAccessPage = () => {
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const goToWebsite = () => {
    window.location.href = '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use PocketBase Auth Collection: gallery slug = username, password = password
      const authData = await pb.collection('users').authWithPassword(slug, password, { $autoCancel: false });

      if (!authData?.token) {
        trackGalleryEvent({
          eventType: 'login_failure',
          gallerySlug: slug,
          result: 'failure',
          reason: 'missing_token',
        });
        toast.error('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      // Verify gallery exists and is active
      const galleries = await pb.collection('galleries').getFullList({
        filter: pb.filter('slug = {:slug}', { slug }),
        $autoCancel: false
      });

      if (galleries.length === 0) {
        trackGalleryEvent({
          eventType: 'login_failure',
          gallerySlug: slug,
          result: 'failure',
          reason: 'gallery_not_found',
        });
        toast.error('Gallery not found');
        pb.authStore.clear();
        setLoading(false);
        return;
      }

      const gallery = galleries[0];

      if (!gallery.isActive) {
        trackGalleryEvent({
          eventType: 'login_failure',
          gallerySlug: slug,
          result: 'failure',
          reason: 'inactive_gallery',
        });
        toast.error('This gallery is no longer active');
        pb.authStore.clear();
        setLoading(false);
        return;
      }

      // Token is automatically stored in pb.authStore
      trackGalleryEvent({
        eventType: 'login_success',
        gallerySlug: slug,
        result: 'success',
      });
      navigate(`/gallery/${slug}`);
    } catch (err) {
      trackGalleryEvent({
        eventType: 'login_failure',
        gallerySlug: slug,
        result: 'failure',
        reason: 'invalid_credentials',
      });
      toast.error('Invalid password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <>
        <Helmet>
          <title>Access gallery</title>
          <meta name="description" content="Enter your gallery credentials to view your wedding photos" />
        </Helmet>

        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-card rounded-2xl shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-accent-foreground" />
                </div>
              </div>

              <h1 className="text-3xl font-semibold text-center mb-2">Access your gallery</h1>
              <p className="text-muted-foreground text-center mb-8">Enter your gallery credentials to view your photos</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="slug">Gallery code</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    required
                    className="text-gray-900"
                    placeholder="e.g., mueller-schmidt"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-gray-900"
                    placeholder="Enter gallery password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Accessing gallery...' : 'Access gallery'}
                </Button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-2 text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin/login')}
                  className="text-sm"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Fotograf Login
                </Button>
                <Button
                  variant="ghost"
                  onClick={goToWebsite}
                  className="text-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zur Website
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    </ErrorBoundary>
  );
};

export default GalleryAccessPage;
