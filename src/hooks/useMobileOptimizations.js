import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para otimizações móveis avançadas
 */
export const useMobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [touchSupported, setTouchSupported] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    isSafari: false,
    canInstall: false
  });

  // Detecta características do dispositivo
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsPortrait(height > width);
      setTouchSupported('ontouchstart' in window || navigator.maxTouchPoints > 0);

      // Detecta sistema operacional e browser
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone === true;

      setDeviceInfo({
        isIOS,
        isAndroid,
        isPWA,
        isSafari,
        canInstall: !isPWA && (isIOS || isAndroid)
      });
    };

    detectDevice();

    // Escuta mudanças de orientação e tamanho
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  // Configurações específicas para mobile
  const mobileConfig = {
    // Tamanhos de toque recomendados
    minTouchTarget: 44,
    
    // Breakpoints
    breakpoints: {
      xs: 320,
      sm: 375,
      md: 414,
      lg: 768
    },
    
    // Configurações de scroll
    scrollConfig: {
      behavior: 'smooth',
      momentum: true
    }
  };

  // Otimizações de performance para mobile
  const optimizeForMobile = useCallback((element) => {
    if (!element || !isMobile) return;

    // Adiciona classes de otimização
    element.style.WebkitOverflowScrolling = 'touch';
    element.style.transform = 'translate3d(0,0,0)'; // Force hardware acceleration
    
    // Otimiza scroll em iOS
    if (deviceInfo.isIOS) {
      element.style.WebkitOverflowScrolling = 'touch';
      element.style.overscrollBehavior = 'contain';
    }

    // Previne zoom acidental em inputs
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.style.fontSize = '16px';
    }
  }, [isMobile, deviceInfo.isIOS]);

  // Gerencia viewport para PWA
  const updateViewport = useCallback(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Configuração otimizada para mobile
    const viewportContent = [
      'width=device-width',
      'initial-scale=1.0',
      'maximum-scale=1.0',
      'user-scalable=no',
      'viewport-fit=cover'
    ].join(', ');

    viewportMeta.content = viewportContent;

    // Configurações especiais para iOS
    if (deviceInfo.isIOS) {
      // Status bar
      let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!statusBarMeta) {
        statusBarMeta = document.createElement('meta');
        statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
        statusBarMeta.content = 'black-translucent';
        document.head.appendChild(statusBarMeta);
      }

      // Mobile web app capable
      let webAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!webAppMeta) {
        webAppMeta = document.createElement('meta');
        webAppMeta.name = 'apple-mobile-web-app-capable';
        webAppMeta.content = 'yes';
        document.head.appendChild(webAppMeta);
      }
    }
  }, [deviceInfo.isIOS]);

  // Aplica otimizações no mount
  useEffect(() => {
    if (isMobile) {
      updateViewport();
      
      // Adiciona classe ao body
      document.body.classList.add('mobile-optimized');
      
      // Configurações CSS específicas
      document.documentElement.style.setProperty('--touch-target-size', `${mobileConfig.minTouchTarget}px`);
    } else {
      document.body.classList.remove('mobile-optimized');
    }

    return () => {
      document.body.classList.remove('mobile-optimized');
    };
  }, [isMobile, updateViewport, mobileConfig.minTouchTarget]);

  return {
    isMobile,
    isPortrait,
    screenSize,
    touchSupported,
    deviceInfo,
    mobileConfig,
    optimizeForMobile,
    updateViewport
  };
};

/**
 * Hook para gestos de toque otimizados
 */
export const useTouchGestures = () => {
  const [gestureState, setGestureState] = useState({
    isScrolling: false,
    isSwiping: false,
    swipeDirection: null,
    touchStart: null,
    touchEnd: null
  });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setGestureState(prev => ({
      ...prev,
      touchStart: {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      },
      isScrolling: false,
      isSwiping: false,
      swipeDirection: null
    }));
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!gestureState.touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureState.touchStart.x;
    const deltaY = touch.clientY - gestureState.touchStart.y;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Detecta direção do gesto
    let direction = null;
    if (absX > absY && absX > 30) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (absY > absX && absY > 30) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setGestureState(prev => ({
      ...prev,
      isScrolling: absY > absX && absY > 10,
      isSwiping: direction !== null,
      swipeDirection: direction
    }));
  }, [gestureState.touchStart]);

  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches[0];
    
    setGestureState(prev => ({
      ...prev,
      touchEnd: {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
    }));

    // Reset após um delay
    setTimeout(() => {
      setGestureState(prev => ({
        ...prev,
        isScrolling: false,
        isSwiping: false,
        swipeDirection: null
      }));
    }, 100);
  }, []);

  // Bind dos eventos
  const bindGestures = useCallback((element) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureState,
    bindGestures
  };
};

/**
 * Hook para safe area (notch handling)
 */
export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      // Detecta safe area insets
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  // Aplica safe area CSS
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--safe-area-top', `${safeAreaInsets.top}px`);
    root.style.setProperty('--safe-area-right', `${safeAreaInsets.right}px`);
    root.style.setProperty('--safe-area-bottom', `${safeAreaInsets.bottom}px`);
    root.style.setProperty('--safe-area-left', `${safeAreaInsets.left}px`);
  }, [safeAreaInsets]);

  return safeAreaInsets;
};

export default useMobileOptimizations;