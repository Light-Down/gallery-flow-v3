
import React from 'react';
import { Calendar, MapPin, Camera } from 'lucide-react';
import { formatDate } from '@/utils/galleryHelpers.js';

const MetadataCard = ({ gallery }) => {
  if (!gallery) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
      <h1 className="text-3xl md:text-4xl font-editorial font-bold mb-6 text-card-foreground">
        {gallery.coupleNames}
      </h1>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{formatDate(gallery.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{gallery.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">Atelier Photography</span>
        </div>
      </div>
    </div>
  );
};

export default MetadataCard;
