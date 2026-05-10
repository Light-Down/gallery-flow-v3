
import React from 'react';
import { motion } from 'framer-motion';

const SectionMarker = ({ title }) => {
  if (!title) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
      className="py-32 md:py-48 flex justify-center items-center px-4"
    >
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-editorial italic text-foreground/80 tracking-wide text-center">
        {title.replace(/-/g, ' ')}
      </h2>
    </motion.div>
  );
};

export default React.memo(SectionMarker);
