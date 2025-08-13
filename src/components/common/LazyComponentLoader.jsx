import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * HOC para carregamento lazy de componentes pesados
 * Útil para componentes que não são necessários no carregamento inicial
 */
export const withLazyLoading = (importFunc, fallbackComponent = null) => {
  const LazyComponent = lazy(importFunc);

  const WrappedComponent = (props) => (
    <Suspense 
      fallback={
        fallbackComponent || (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `LazyLoaded(${LazyComponent.displayName || LazyComponent.name || 'Component'})`;

  return WrappedComponent;
};

/**
 * Componente para carregamento condicional baseado na visibilidade
 */
export const LazyVisibilityLoader = ({ 
  children, 
  threshold = 0.1,
  fallback = <Skeleton className="h-32 w-full" />,
  className = ""
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default withLazyLoading;