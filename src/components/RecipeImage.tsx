
import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface RecipeImageProps {
  src: string | undefined;
  alt: string;
  aspectRatio?: number;
  className?: string;
  fallbackClassName?: string;
  withZoomEffect?: boolean;
  priority?: boolean;
}

const RecipeImage: React.FC<RecipeImageProps> = ({
  src,
  alt,
  aspectRatio = 16 / 9,
  className = '',
  fallbackClassName = '',
  withZoomEffect = false,
  priority = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);

  // Reset states when src changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    setImageSrc(src);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    setImageSrc(undefined);
  };

  return (
    <div className={cn('overflow-hidden relative bg-muted rounded-md', className)}>
      <AspectRatio ratio={aspectRatio}>
        {loading && (
          <Skeleton 
            className="absolute inset-0 w-full h-full z-10 animate-pulse bg-gradient-to-r from-muted to-muted-foreground/10" 
          />
        )}
        
        {!error && imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500',
              loading ? 'opacity-0' : 'opacity-100',
              withZoomEffect && 'group-hover:scale-110'
            )}
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20',
            fallbackClassName
          )}>
            <ImageOff className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default RecipeImage;
