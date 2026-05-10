
import React from 'react';
import { motion } from 'framer-motion';

const AtelierArticleSection = ({ image, config }) => {
  if (!config.editorialText && !config.pullQuote) return null;

  return (
    <section className="py-24 md:py-48 px-6 md:px-12 max-w-7xl mx-auto bg-[hsl(var(--atelier-ivory))] text-[hsl(var(--atelier-black))]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 relative">
        
        {/* Sticky Image Column */}
        <div className="md:col-span-5 relative h-auto md:h-[150vh]">
          {image && (
            <div className="md:sticky md:top-32 w-full">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1 }}
                src={image} 
                alt="Editorial context" 
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
          )}
        </div>

        {/* Text Column */}
        <div className="md:col-span-7 flex flex-col justify-center py-12 md:py-32">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="font-editorial text-4xl md:text-6xl mb-12">The Art of Connection</h2>
            
            {config.editorialText && (
              <p className="font-minimal text-lg leading-relaxed text-[hsl(var(--atelier-black))]/80 mb-16 max-w-prose">
                {config.editorialText}
              </p>
            )}

            {config.pullQuote && (
              <div className="relative pl-8 md:pl-12 py-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--atelier-accent))]" />
                <p className="atelier-pull-quote text-[hsl(var(--atelier-black))]">
                  "{config.pullQuote}"
                </p>
              </div>
            )}
            
            <div className="mt-16 flex items-center gap-4">
              <div className="w-12 h-[1px] bg-[hsl(var(--atelier-black))]/30" />
              <p className="atelier-label text-[hsl(var(--atelier-black))]/50">Editorial Note</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default AtelierArticleSection;
