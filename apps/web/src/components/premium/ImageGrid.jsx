
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImageGrid = ({ images, type = 'editorial', onImageClick, favorites = [], onToggleFavorite }) => {
  const getMasonryClass = () => {
    switch (type) {
      case 'minimal': return 'masonry-minimal';
      case 'cinematic': return 'masonry-cinematic';
      case 'editorial':
      case 'documentary':
      default: return 'masonry-editorial';
    }
  };

  const getSpacingClass = () => {
    switch (type) {
      case 'minimal': return 'space-y-4';
      case 'cinematic': return 'space-y-0';
      case 'editorial':
      case 'documentary':
      default: return 'space-y-8';
    }
  };

  return (
    <div className={`${getMasonryClass()} ${getSpacingClass()}`}>
      {images.map((imageUrl, index) => (
        <motion.div
          key={imageUrl}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: (index % 5) * 0.1 }}
          className={`break-inside-avoid relative group cursor-pointer ${type === 'cinematic' ? 'mb-0' : 'mb-8'}`}
          onClick={() => onImageClick(index)}
        >
          <img
            src={imageUrl}
            alt={`Gallery image ${index + 1}`}
            className={`w-full transition-all duration-500 ${type === 'cinematic' ? 'rounded-none' : 'rounded-xl'} ${type !== 'minimal' ? 'group-hover:shadow-xl group-hover:scale-[1.01]' : 'group-hover:opacity-90'}`}
            loading="lazy"
          />
          
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ${type === 'cinematic' ? 'rounded-none' : 'rounded-xl'} flex items-center justify-center`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(imageUrl);
              }}
              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-primary ${favorites.includes(imageUrl) ? 'opacity-100' : ''}`}
            >
              <Heart className={`w-5 h-5 ${favorites.includes(imageUrl) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ImageGrid;
