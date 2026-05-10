
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const AtelierArchiveSection = ({ images, onLightbox, onFavorite, favorites }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 md:py-40 px-4 md:px-8 max-w-[100rem] mx-auto bg-[hsl(var(--atelier-ivory))]">
      <div className="flex flex-col items-center justify-center mb-24">
        <h2 className="font-editorial text-4xl md:text-5xl text-[hsl(var(--atelier-black))] mb-4">The Archive</h2>
        <p className="atelier-label text-[hsl(var(--atelier-black))]/50">Complete Collection</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
        {images.map((src, idx) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, filter: 'grayscale(100%)', y: 30 }}
            whileInView={{ opacity: 1, filter: 'grayscale(0%)', y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="break-inside-avoid relative group cursor-pointer overflow-hidden bg-[hsl(var(--atelier-champagne))]/30"
            onClick={() => onLightbox(src)}
          >
            <img src={src} alt={`Archive ${idx}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); onFavorite(src); }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[hsl(var(--atelier-black))] ${favorites.includes(src) ? 'opacity-100' : ''}`}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(src) ? 'fill-[hsl(var(--atelier-accent))] text-[hsl(var(--atelier-accent))]' : ''}`} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AtelierArchiveSection;
