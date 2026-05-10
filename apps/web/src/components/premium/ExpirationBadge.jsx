
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { calculateExpirationDays } from '@/utils/galleryHelpers.js';

const ExpirationBadge = ({ expirationDate }) => {
  if (!expirationDate) return null;

  const status = calculateExpirationDays(expirationDate);
  const isExpired = status === 'Expired';
  const isWarning = status && status.includes('day');

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
        <AlertCircle className="w-4 h-4" />
        <span>Gallery Expired</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${isWarning ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-secondary text-secondary-foreground border-border'}`}>
      <Clock className="w-4 h-4" />
      <span>{status}</span>
    </div>
  );
};

export default ExpirationBadge;
