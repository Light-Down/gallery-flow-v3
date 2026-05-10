
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// An Image wrapper handling the hover state and favorite interactions natively
const DynamicImage = React.memo(({ url, onImageClick, isFavorite, onToggleFavorite, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className={`relative group cursor-pointer overflow-hidden bg-muted ${className}`}
      onClick={() => onImageClick(url)}
    >
      <img
        src={url}
        alt="Gallery moment"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(url);
          }}
          className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 hover:bg-white text-primary ${isFavorite ? 'opacity-100' : ''}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>
    </motion.div>
  );
});

const DynamicImageLayout = ({ images, onImageClick, favorites = [], onToggleFavorite }) => {
  
  // Creates intentional asymmetrical rhythms out of an image array
  const layoutChunks = useMemo(() => {
    const chunks = [];
    let i = 0;
    // The pattern cycle we want to map over
    const pattern = ['diptych', 'full', 'offset-left', 'single', 'diptych', 'offset-right', 'row-3'];
    let pIdx = 0;

    while (i < images.length) {
      const p = pattern[pIdx % pattern.length];
      pIdx++;

      if (p === 'full') {
        chunks.push({ type: 'full', items: [images[i]] });
        i += 1;
      } else if (p === 'diptych' && i + 1 < images.length) {
        chunks.push({ type: 'diptych', items: [images[i], images[i + 1]] });
        i += 2;
      } else if (p === 'offset-left' && i + 1 < images.length) {
        chunks.push({ type: 'offset-left', items: [images[i], images[i + 1]] });
        i += 2;
      } else if (p === 'offset-right' && i + 1 < images.length) {
        chunks.push({ type: 'offset-right', items: [images[i], images[i + 1]] });
        i += 2;
      } else if (p === 'row-3' && i + 2 < images.length) {
        chunks.push({ type: 'row-3', items: [images[i], images[i + 1], images[i + 2]] });
        i += 3;
      } else {
        chunks.push({ type: 'single', items: [images[i]] });
        i += 1;
      }
    }
    return chunks;
  }, [images]);

  return (
    <div className="flex flex-col gap-8 md:gap-16 lg:gap-24 px-4 md:px-8 max-w-[100rem] mx-auto py-8">
      {layoutChunks.map((chunk, idx) => {
        
        if (chunk.type === 'full') {
          return (
            <DynamicImage 
              key={`chunk-${idx}-0`} 
              url={chunk.items[0]} 
              onImageClick={onImageClick} 
              isFavorite={favorites.includes(chunk.items[0])} 
              onToggleFavorite={onToggleFavorite}
              className="w-full aspect-[16/9] md:aspect-[21/9] rounded-sm md:rounded-lg" 
            />
          );
        }

        if (chunk.type === 'single') {
          return (
            <div key={`chunk-${idx}`} className="flex justify-center">
              <DynamicImage 
                url={chunk.items[0]} 
                onImageClick={onImageClick} 
                isFavorite={favorites.includes(chunk.items[0])} 
                onToggleFavorite={onToggleFavorite}
                className="w-full md:w-2/3 lg:w-1/2 aspect-[4/5] md:aspect-[3/4] rounded-sm md:rounded-lg" 
              />
            </div>
          );
        }

        if (chunk.type === 'diptych') {
          return (
            <div key={`chunk-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {chunk.items.map((url, j) => (
                <DynamicImage 
                  key={j} 
                  url={url} 
                  onImageClick={onImageClick} 
                  isFavorite={favorites.includes(url)} 
                  onToggleFavorite={onToggleFavorite}
                  className="w-full aspect-[3/4] md:aspect-[4/5] rounded-sm md:rounded-lg" 
                />
              ))}
            </div>
          );
        }

        if (chunk.type === 'offset-left') {
          return (
            <div key={`chunk-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center">
              <div className="md:col-span-8">
                <DynamicImage 
                  url={chunk.items[0]} 
                  onImageClick={onImageClick} 
                  isFavorite={favorites.includes(chunk.items[0])} 
                  onToggleFavorite={onToggleFavorite}
                  className="w-full aspect-[4/3] rounded-sm md:rounded-lg" 
                />
              </div>
              <div className="md:col-span-4 mt-8 md:mt-0">
                <DynamicImage 
                  url={chunk.items[1]} 
                  onImageClick={onImageClick} 
                  isFavorite={favorites.includes(chunk.items[1])} 
                  onToggleFavorite={onToggleFavorite}
                  className="w-full aspect-[3/4] rounded-sm md:rounded-lg" 
                />
              </div>
            </div>
          );
        }

        if (chunk.type === 'offset-right') {
          return (
            <div key={`chunk-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center">
              <div className="md:col-span-4 order-2 md:order-1 mt-8 md:mt-0">
                <DynamicImage 
                  url={chunk.items[0]} 
                  onImageClick={onImageClick} 
                  isFavorite={favorites.includes(chunk.items[0])} 
                  onToggleFavorite={onToggleFavorite}
                  className="w-full aspect-[3/4] rounded-sm md:rounded-lg" 
                />
              </div>
              <div className="md:col-span-8 order-1 md:order-2">
                <DynamicImage 
                  url={chunk.items[1]} 
                  onImageClick={onImageClick} 
                  isFavorite={favorites.includes(chunk.items[1])} 
                  onToggleFavorite={onToggleFavorite}
                  className="w-full aspect-[4/3] rounded-sm md:rounded-lg" 
                />
              </div>
            </div>
          );
        }

        if (chunk.type === 'row-3') {
          return (
            <div key={`chunk-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {chunk.items.map((url, j) => (
                <DynamicImage 
                  key={j} 
                  url={url} 
                  onImageClick={onImageClick} 
                  isFavorite={favorites.includes(url)} 
                  onToggleFavorite={onToggleFavorite}
                  className="w-full aspect-[3/4] rounded-sm md:rounded-lg" 
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default React.memo(DynamicImageLayout);
