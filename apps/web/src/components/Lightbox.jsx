
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Maximize, Minimize, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Lightbox = ({ images, currentIndex, onClose, onNavigate, favorites = [], onToggleFavorite, downloadUrl }) => {
  const [preloadedImages, setPreloadedImages] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // Idle Timer logic
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 3000);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Preloading
  useEffect(() => {
    const preloadImage = (src) => {
      if (src && !preloadedImages[src]) {
        const img = new Image();
        img.src = src;
        img.onload = () => setPreloadedImages(prev => ({ ...prev, [src]: true }));
      }
    };
    if (images[currentIndex]) preloadImage(images[currentIndex]);
    if (images[currentIndex + 1]) preloadImage(images[currentIndex + 1]);
    if (images[currentIndex - 1]) preloadImage(images[currentIndex - 1]);
  }, [currentIndex, images, preloadedImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) document.exitFullscreen();
        else onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate, isFullscreen, toggleFullscreen]);

  const currentImage = images[currentIndex];
  const isFavorite = favorites.includes(currentImage);

  // Swipe logic
  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50 && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    } else if (swipe > 50 && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center cursor-default"
        onClick={onClose}
      >
        {/* Controls Overlay */}
        <motion.div 
          animate={{ opacity: isIdle ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-medium tracking-widest font-editorial italic">
              {currentIndex + 1} <span className="text-white/40 mx-1">/</span> {images.length}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {downloadUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); window.open(downloadUrl, '_blank'); }}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                >
                  <Download className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex rounded-full h-10 w-10"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(currentImage); }}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
              >
                <motion.div whileTap={{ scale: 0.8 }}>
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </motion.div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 bg-white/5"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white hover:bg-white/10 hidden sm:flex h-14 w-14 rounded-full backdrop-blur-sm pointer-events-auto"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {currentIndex < images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white hover:bg-white/10 hidden sm:flex h-14 w-14 rounded-full backdrop-blur-sm pointer-events-auto"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}
          
          {/* Thumbnails Preview */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:flex gap-3 pointer-events-auto">
            {[-2, -1, 0, 1, 2].map(offset => {
              const idx = currentIndex + offset;
              if (idx < 0 || idx >= images.length) return <div key={offset} className="w-14 h-14" />;
              return (
                <div 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
                  className={`w-14 h-14 rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${offset === 0 ? 'ring-2 ring-white/80 scale-110 shadow-xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={images[idx]} alt="" className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Image */}
        <motion.img
          key={currentImage}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          src={currentImage}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-[100vw] max-h-[100dvh] sm:max-w-[95vw] sm:max-h-[95dvh] object-contain cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Lightbox);
