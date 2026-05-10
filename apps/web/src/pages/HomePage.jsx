import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Camera, Mail, ArrowRight } from 'lucide-react';
import { formatDate, getGalleryCoverImageUrl } from '@/utils/galleryHelpers.js';
const HomePage = () => {
  const navigate = useNavigate();
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const records = await pb.collection('galleries').getFullList({
          filter: 'isFeatured = true && isActive = true',
          sort: 'sortOrder,-created',
          $autoCancel: false
        });
        setFeaturedGalleries(records);
      } catch (err) {
        console.error('Failed to fetch featured galleries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);
  return <>
      <Helmet>
        <title>Luxury wedding photography</title>
        <meta name="description" content="Timeless wedding photography capturing your most precious moments with elegance and artistry" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1614725077723-139ccd57f7f8" alt="Elegant wedding couple in romantic setting" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-editorial font-bold text-white mb-6 leading-tight tracking-tight">
                Luxury wedding photography
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto font-minimal">
                Timeless imagery capturing the emotion, elegance, and intimate moments of your celebration
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/gallery-access')} className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl transition-all duration-200 active:scale-[0.98]">
                  Client Access
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/admin/login')} className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl transition-all duration-200 active:scale-[0.98]">
                  Fotograf Login
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <motion.div animate={{
              y: [0, 12, 0]
            }} transition={{
              duration: 1.5,
              repeat: Infinity
            }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* Featured Galleries Section */}
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold mb-4">Featured Stories</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A curated selection of our most beautiful celebrations from around the world.
            </p>
          </div>

          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => <div key={i} className="aspect-[4/3] bg-muted rounded-2xl animate-pulse"></div>)}
            </div> : featuredGalleries.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {featuredGalleries.map((gallery, index) => <motion.div key={gallery.id} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }} className="group cursor-pointer" onClick={() => navigate(`/gallery/${gallery.slug}`)}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                    <img src={getGalleryCoverImageUrl(gallery) || 'https://images.unsplash.com/photo-1519741497674-611481863552'} alt={gallery.coupleNames} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 text-primary px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        View Gallery <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-editorial font-bold mb-2">{gallery.coupleNames}</h3>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">
                      {gallery.location} • {formatDate(gallery.date)}
                    </p>
                  </div>
                </motion.div>)}
            </div> : <div className="text-center py-12 text-muted-foreground">
              <p>More stories coming soon.</p>
            </div>}
        </section>

        {/* Footer */}
        <footer className="bg-primary text-primary-foreground py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <Camera className="w-8 h-8" />
                <span className="text-2xl font-editorial font-bold">Atelier Photography</span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <a href="mailto:hello@atelierphotography.com" className="flex items-center gap-2 hover:text-white/80 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                  <span>hello@atelierphotography.com</span>
                </a>
              </div>

              <div className="flex gap-6 text-sm text-primary-foreground/70">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
              <p>&copy; {new Date().getFullYear()} Atelier Photography. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>;
};
export default HomePage;
