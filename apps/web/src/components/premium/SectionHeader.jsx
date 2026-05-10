
import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ title, subtitle, type = 'editorial', align = 'left' }) => {
  const isSerif = type === 'editorial' || type === 'cinematic';
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`mb-12 ${alignClass}`}
    >
      <h2 className={`text-3xl md:text-5xl font-bold mb-4 capitalize ${isSerif ? 'font-editorial' : 'font-minimal tracking-tight'}`}>
        {title.replace(/-/g, ' ')}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
