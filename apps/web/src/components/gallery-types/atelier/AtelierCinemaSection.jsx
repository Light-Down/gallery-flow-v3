
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const CinemaImage = ({ src, onLightbox, onFavorite, isFav, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, filter: 'grayscale(100%) brightness(0.8)' }}
    whileInView={{ opacity: 1, filter: 'grayscale(30%) brightness(1)' }}
    transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
    viewport={{ once: true, margin: "-10%" }}
    className={`relative group cursor-pointer overflow-hidden ${className}`}
    onClick={() => onLightbox(src)}
  >
    <img src={src} alt="Cinema visual" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" loading="lazy" />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(src); }}
        className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 flex items-center justify-center text-white ${isFav ? 'opacity-100 bg-white/20' : ''}`}
      >
        <Heart className={`w-5 h-5 ${isFav ? 'fill-[hsl(var(--atelier-accent))] text-[hsl(var(--atelier-accent))]' : ''}`} />
      </button>
    </div>
  </motion.div>
);

const AtelierCinemaSection = ({ images, onLightbox, onFavorite, favorites }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 md:py-40 bg-[hsl(var(--atelier-black))] text-[hsl(var(--atelier-ivory))]">
      <div className="flex justify-center mb-24">
        <p className="atelier-label text-[hsl(var(--atelier-ivory))]/50 border-b border-[hsl(var(--atelier-ivory))]/20 pb-4 px-8">The Darkroom</p>
      </div>

      <div className="flex flex-col gap-16 md:gap-32 max-w-[100rem] mx-auto px-4 md:px-8">
        
        {/* Row 1: Full Cinematic */}
        {images[0] && (
          <div className="w-full">
            <CinemaImage src={images[0]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[0])} className="w-full aspect-[21/9] md:aspect-[2.35/1]" />
            <p className="atelier-caption text-[hsl(var(--atelier-ivory))]/60 text-center mt-4">Scene I — The Anticipation</p>
          </div>
        )}

        {/* Row 2: Tall Portraits */}
        {(images[1] || images[2]) && (
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            {images[1] && <CinemaImage src={images[1]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[1])} className="w-full md:w-[35%] aspect-[2/3]" />}
            {images[2] && <CinemaImage src={images[2]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[2])} className="w-full md:w-[35%] aspect-[2/3] md:mt-24" />}
          </div>
        )}

        {/* Row 3: Full Cinematic */}
        {images[3] && (
          <div className="w-full">
            <CinemaImage src={images[3]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[3])} className="w-full aspect-[16/9] md:aspect-[2.35/1]" />
            <p className="atelier-caption text-[hsl(var(--atelier-ivory))]/60 text-center mt-4">Scene II — Light & Shadow</p>
          </div>
        )}

        {/* Row 4: Mixed */}
        {(images[4] || images[5] || images[6]) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
             {images[4] && <div className="md:col-span-3"><CinemaImage src={images[4]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[4])} className="w-full aspect-[2/3]" /></div>}
             {images[5] && <div className="md:col-span-6"><CinemaImage src={images[5]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[5])} className="w-full aspect-[16/9]" /></div>}
             {images[6] && <div className="md:col-span-3"><CinemaImage src={images[6]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(images[6])} className="w-full aspect-[2/3]" /></div>}
          </div>
        )}

      </div>
    </section>
  );
};

export default AtelierCinemaSection;
