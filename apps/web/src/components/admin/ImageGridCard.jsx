
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Star, Image as ImageIcon, Maximize, Columns, FolderPlus } from 'lucide-react';

const ImageGridCard = ({
  image,
  index,
  isHero,
  isCover,
  isActiveStart = false,
  isChapterStart = false,
  chapterTitle,
  chapterActionLabel = 'Kapitel',
  onDelete,
  onSetHero,
  onSetCover,
  onSelectStart,
  onCreateChapterFrom
}) => {
  const isPortrait = image.orientation === 'portrait';
  const isLandscape = image.orientation === 'landscape';
  const previewUrl = image.thumbUrl || image.url;
  const hasUrl = Boolean(previewUrl && previewUrl.trim() !== '');

  return (
    <div
      className={`image-card group relative ${onSelectStart ? 'cursor-pointer' : 'cursor-default'} ${isActiveStart ? 'image-card-selected' : ''}`}
      onClick={() => onSelectStart?.(image.filename)}
      role={onSelectStart ? 'button' : undefined}
      tabIndex={onSelectStart ? 0 : undefined}
      aria-pressed={onSelectStart ? isActiveStart : undefined}
      onKeyDown={(e) => {
        if (!onSelectStart) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectStart(image.filename);
        }
      }}
    >
      {hasUrl ? (
        <img
          src={previewUrl}
          alt={image.filename || `Image ${index}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground ${hasUrl ? 'hidden' : 'flex'}`}
      >
        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
        <span className="text-xs text-center px-2">{image.filename || 'No URL'}</span>
      </div>

      {/* Orientation Badge */}
      <div className="absolute top-2 left-2 z-20">
        <span className="bg-black/60 text-white backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 shadow-sm">
          {isPortrait && <Columns className="w-3 h-3 rotate-90" />}
          {isLandscape && <Maximize className="w-3 h-3" />}
          {!isPortrait && !isLandscape && <ImageIcon className="w-3 h-3" />}
          {image.orientation || 'square'}
        </span>
      </div>

      {chapterTitle && (
        <div className="absolute left-2 bottom-2 z-20 max-w-[calc(100%-1rem)]">
          <span className="bg-black/60 text-white backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider shadow-sm truncate block">
            {chapterTitle}
          </span>
        </div>
      )}

      {isChapterStart && (
        <div className="absolute left-1/2 top-2 z-20 max-w-[calc(100%-6rem)] -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider shadow-sm truncate block">
            Kapitelstart
          </span>
        </div>
      )}

      <div className="image-card-overlay">
        <div className="flex justify-end items-start">
          <Button 
            size="icon" 
            variant="destructive" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-end w-full gap-2">
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant={isHero ? "default" : "secondary"} 
              className={`h-8 w-8 shadow-sm ${isHero ? 'bg-primary text-primary-foreground' : 'bg-white/20 text-white backdrop-blur hover:bg-white/40'}`} 
              onClick={(e) => { e.stopPropagation(); onSetHero(index); }} 
              title="Set as Hero"
            >
              <Star className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant={isCover ? "default" : "secondary"} 
              className={`h-8 w-8 shadow-sm ${isCover ? 'bg-primary text-primary-foreground' : 'bg-white/20 text-white backdrop-blur hover:bg-white/40'}`} 
              onClick={(e) => { e.stopPropagation(); onSetCover(index); }} 
              title="Set as Cover"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
          {onCreateChapterFrom && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 bg-white/20 text-white backdrop-blur hover:bg-white/40"
              onClick={(e) => { e.stopPropagation(); onCreateChapterFrom(image.filename); }}
              title="Kapitel bis hier erstellen"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              {chapterActionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGridCard;
