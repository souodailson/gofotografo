import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23f3f4f6' viewBox='0 0 24 24'%3E%3Cpath d='M4 4h16v16H4V4z'/%3E%3C/svg%3E",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("overflow-hidden", className)}>
      {isInView && (
        <img
          src={isLoaded ? src : placeholder}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-60"
          )}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
      {!isInView && (
        <div 
          className={cn("bg-muted animate-pulse w-full h-full", className)} 
          style={{ aspectRatio: props.style?.aspectRatio || 'auto' }}
        />
      )}
    </div>
  );
};

export default LazyImage;