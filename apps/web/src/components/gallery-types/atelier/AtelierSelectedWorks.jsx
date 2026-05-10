
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const AtelierImage = ({ src, onLightbox, onFavorite, isFav, className = "", imgClassName = "", alt = "Selected work" }) => {
  const imageUrl = typeof src === 'object' ? src.url : src;
  const imageAlt = typeof src === 'object' && src.filename ? src.filename : alt;
  
  return (
    <motion.div 
      initial={{ filter: 'grayscale(80%)', scale: 0.96, opacity: 0 }}
      whileInView={{ filter: 'grayscale(0%)', scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
      viewport={{ once: true, margin: "-10%" }}
      className={`relative group cursor-pointer overflow-hidden bg-[hsl(var(--atelier-champagne))]/20 ${className}`}
      onClick={() => onLightbox(imageUrl)}
    >
      <img src={imageUrl} alt={imageAlt} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${imgClassName}`} loading="lazy" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(imageUrl); }}
          className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[hsl(var(--atelier-black))] ${isFav ? 'opacity-100' : ''}`}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-[hsl(var(--atelier-accent))] text-[hsl(var(--atelier-accent))]' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

const AtelierSelectedWorks = ({ images, onLightbox, onFavorite, favorites }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 md:py-48 px-4 md:px-12 max-w-[100rem] mx-auto bg-[hsl(var(--atelier-ivory))] text-[hsl(var(--atelier-black))]">
      
      <div className="flex justify-center mb-32">
        <p className="atelier-label text-center border-b border-[hsl(var(--atelier-black))]/20 pb-4 px-8">Curated Selection</p>
      </div>

      <div className="space-y-32 md:space-y-48">
        
        {/* Pattern 1: Single large portrait */}
        {images[0] && (
          <div className="flex justify-center">
            <AtelierImage 
              src={images[0]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[0] === 'object' ? images[0].url : images[0])}
              className="w-full md:w-[65%] lg:w-[50%] aspect-[4/5]"
            />
          </div>
        )}

        {/* Pattern 2: Diptych different heights */}
        {(images[1] || images[2]) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-end">
            {images[1] && <AtelierImage src={images[1]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[1] === 'object' ? images[1].url : images[1])} className="w-full aspect-[3/4]" />}
            {images[2] && <AtelierImage src={images[2]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[2] === 'object' ? images[2].url : images[2])} className="w-full md:w-[80%] aspect-[4/5] ml-auto md:mb-24" />}
          </div>
        )}

        {/* Pattern 3: Triptych */}
        {(images[3] || images[4] || images[5]) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images[3] && <AtelierImage src={images[3]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[3] === 'object' ? images[3].url : images[3])} className="w-full aspect-[4/5] mt-12" />}
            {images[4] && <AtelierImage src={images[4]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[4] === 'object' ? images[4].url : images[4])} className="w-full aspect-[3/4]" />}
            {images[5] && <AtelierImage src={images[5]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[5] === 'object' ? images[5].url : images[5])} className="w-full aspect-[4/5] mt-24" />}
          </div>
        )}

        {/* Pattern 4: Full width landscape */}
        {images[6] && (
          <div className="w-full">
            <AtelierImage src={images[6]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[6] === 'object' ? images[6].url : images[6])} className="w-full aspect-[16/9] md:aspect-[21/9]" />
            <p className="atelier-caption text-center mt-6">A moment frozen in time, reflecting the day's inherent beauty.</p>
          </div>
        )}

        {/* Pattern 5: Offset pair */}
        {(images[7] || images[8]) && (
          <div className="relative w-full max-w-5xl mx-auto py-12 flex flex-col md:block h-auto md:h-[90vh]">
            {images[7] && <AtelierImage src={images[7]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[7] === 'object' ? images[7].url : images[7])} className="w-full md:w-[55%] aspect-[4/5] md:absolute md:left-0 md:top-0 z-10 mb-8 md:mb-0" />}
            {images[8] && <AtelierImage src={images[8]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[8] === 'object' ? images[8].url : images[8])} className="w-full md:w-[50%] aspect-[3/4] md:absolute md:right-0 md:bottom-0 z-20 md:-mt-24" />}
          </div>
        )}

        {/* Pattern 6: Feature image + text */}
        {images[9] && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <AtelierImage src={images[9]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[9] === 'object' ? images[9].url : images[9])} className="w-full aspect-[4/5]" />
            </div>
            <div className="md:col-span-5 px-4 md:px-12 order-first md:order-last mb-12 md:mb-0">
               <h3 className="font-editorial text-4xl mb-6">The details that define the story.</h3>
               <p className="font-minimal text-[hsl(var(--atelier-black))]/70 leading-relaxed">
                 Every subtle texture and fleeting glance contributes to the tapestry of the day. We capture these quiet moments with the same reverence as the grand celebrations.
               </p>
            </div>
          </div>
        )}

        {/* Pattern 7: Asymmetric grid 4 */}
        {(images[10] || images[11] || images[12] || images[13]) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {images[10] && <div className="md:col-span-8"><AtelierImage src={images[10]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[10] === 'object' ? images[10].url : images[10])} className="w-full aspect-[4/3]" /></div>}
            {images[11] && <div className="md:col-span-4"><AtelierImage src={images[11]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[11] === 'object' ? images[11].url : images[11])} className="w-full aspect-[3/4]" /></div>}
            {images[12] && <div className="md:col-span-5"><AtelierImage src={images[12]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[12] === 'object' ? images[12].url : images[12])} className="w-full aspect-[1/1]" /></div>}
            {images[13] && <div className="md:col-span-7"><AtelierImage src={images[13]} onLightbox={onLightbox} onFavorite={onFavorite} isFav={favorites.includes(typeof images[13] === 'object' ? images[13].url : images[13])} className="w-full aspect-[16/9]" /></div>}
          </div>
        )}

      </div>
    </section>
  );
};

export default AtelierSelectedWorks;
