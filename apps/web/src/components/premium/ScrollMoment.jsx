
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollMoment = ({ imageUrl, caption, onImageClick, isFavorite, onToggleFavorite }) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="h-[200vh] w-full relative bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale, opacity }} 
          className="absolute inset-0 w-full h-full"
          onClick={() => onImageClick(imageUrl)}
        >
          <img
            src={imageUrl}
            alt={caption || "Cinematic moment"}
            className="w-full h-full object-cover cursor-pointer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </motion.div>
        
        {/* Hover overlay for Favorite */}
        <div className="absolute top-8 right-8 z-20 opacity-0 hover:opacity-100 transition-opacity duration-500">
           <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(imageUrl);
              }}
              className={`bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 ${isFavorite ? 'opacity-100' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
        </div>

        {caption && (
          <motion.div 
            style={{ opacity }}
            className="absolute bottom-16 left-0 right-0 text-center px-4 pointer-events-none"
          >
            <p className="text-white/90 text-lg md:text-xl font-editorial italic tracking-wide">
              {caption}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ScrollMoment);
