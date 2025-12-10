
import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      });
    });

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative bg-slate-900 overflow-hidden ${className}`}>
      {isInView && (
        <img
          src={src}
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
          onLoad={() => setIsLoaded(true)}
          alt={props.alt || 'Lazy loaded image'}
          {...props}
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="slate" />
        </div>
      )}
    </div>
  );
};
