import { getValidatedEnv, isDevelopmentEnv } from './envValidation';

/**
 * Sistema de Telemetria e Analytics
 * Coleta métricas de performance e uso de forma anônima
 */
class TelemetrySystem {
  constructor() {
    this.enabled = false;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.metrics = new Map();
    this.batchSize = 50;
    this.flushInterval = 30000; // 30 segundos
    
    this.init();
  }

  init() {
    try {
      // Só ativa telemetria se configurada e se não for desenvolvimento
      const isDev = isDevelopmentEnv();
      const hasConsent = localStorage.getItem('telemetry-consent') === 'true';
      
      this.enabled = !isDev && hasConsent;
      
      if (this.enabled) {
        this.setupPerformanceObserver();
        this.setupErrorTracking();
        this.setupUserInteractionTracking();
        this.startBatchFlush();
        this.trackPageLoad();
      }
    } catch (error) {
      console.warn('Falha ao inicializar telemetria:', error);
      this.enabled = false;
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Rastreia eventos de performance
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observa Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric(entry.name, entry.value, {
            rating: this.getVitalRating(entry.name, entry.value),
            entryType: entry.entryType
          });
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });

      // Track Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('LCP', entry.startTime, {
            rating: this.getVitalRating('LCP', entry.startTime),
            element: entry.element?.tagName || 'unknown'
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cumulativeScore = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cumulativeScore += entry.value;
          }
        }
        if (cumulativeScore > 0) {
          this.trackMetric('CLS', cumulativeScore, {
            rating: this.getVitalRating('CLS', cumulativeScore)
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Erro ao configurar PerformanceObserver:', error);
    }
  }

  // Rastreia erros da aplicação
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack?.substring(0, 1000) // Limita tamanho do stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('promise_rejection', {
        reason: event.reason?.toString?.() || 'Unknown',
        stack: event.reason?.stack?.substring(0, 1000)
      });
    });
  }

  // Rastreia interações do usuário
  setupUserInteractionTracking() {
    // Track clicks em elementos importantes
    document.addEventListener('click', (event) => {
      const target = event.target;
      const tagName = target.tagName.toLowerCase();
      
      // Só rastreia elementos interativos importantes
      if (['button', 'a', 'input'].includes(tagName)) {
        const elementId = target.id || target.className || tagName;
        this.trackEvent('user_interaction', {
          type: 'click',
          element: elementId.substring(0, 100), // Limita tamanho
          page: window.location.pathname
        });
      }
    }, { passive: true });

    // Track navigation
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', {
        duration: Date.now() - this.startTime,
        page: window.location.pathname
      });
      this.flush(); // Flush final
    });
  }

  // Avalia rating dos Core Web Vitals
  getVitalRating(metric, value) {
    const thresholds = {
      'LCP': { good: 2500, poor: 4000 },
      'FID': { good: 100, poor: 300 },
      'CLS': { good: 0.1, poor: 0.25 },
      'FCP': { good: 1800, poor: 3000 },
      'TTFB': { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Rastreia carregamento da página
  trackPageLoad() {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.trackEvent('page_load', {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent.substring(0, 200)
          });
        }
      }, 0);
    });
  }

  // API pública para tracking
  trackEvent(eventName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent.substring(0, 100)
    };

    this.events.push(event);

    // Auto-flush se atingir o batch size
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  trackMetric(name, value, metadata = {}) {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      value,
      metadata,
      timestamp: Date.now()
    });
  }

  // Sanitiza propriedades para remover dados sensíveis
  sanitizeProperties(properties) {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'email', 'phone'];
    const sanitized = {};

    for (const [key, value] of Object.entries(properties)) {
      const lowerKey = key.toLowerCase();
      
      // Remove chaves sensíveis
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Limita tamanho de strings
      if (typeof value === 'string' && value.length > 500) {
        sanitized[key] = value.substring(0, 500) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  generateEventId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Envia dados coletados
  async flush() {
    if (!this.enabled || this.events.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      events: [...this.events],
      metrics: Object.fromEntries(this.metrics),
      timestamp: Date.now(),
      version: '1.0.0'
    };

    try {
      // Em ambiente real, enviaria para endpoint de telemetria
      // Para desenvolvimento, apenas loga
      if (isDevelopmentEnv()) {
        console.log('Telemetry data:', payload);
      } else {
        // await fetch('/api/telemetry', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });
      }

      // Limpa buffer após envio bem-sucedido
      this.events = [];
      this.metrics.clear();

    } catch (error) {
      console.warn('Erro ao enviar dados de telemetria:', error);
      // Mantém alguns eventos em caso de falha
      if (this.events.length > this.batchSize * 2) {
        this.events = this.events.slice(-this.batchSize);
      }
    }
  }

  // Configura flush automático
  startBatchFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Ativa/desativa telemetria com base no consentimento
  setConsentStatus(hasConsent) {
    localStorage.setItem('telemetry-consent', hasConsent.toString());
    
    if (hasConsent && !this.enabled && !isDevelopmentEnv()) {
      this.enabled = true;
      this.init();
    } else if (!hasConsent && this.enabled) {
      this.enabled = false;
      this.events = [];
      this.metrics.clear();
    }
  }

  // Retorna estatísticas da sessão atual
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      eventsTracked: this.events.length,
      metricsTracked: this.metrics.size,
      enabled: this.enabled
    };
  }
}

// Instância global
const telemetry = new TelemetrySystem();

// Funções de conveniência para uso na aplicação
export const trackEvent = (eventName, properties) => {
  telemetry.trackEvent(eventName, properties);
};

export const trackMetric = (name, value, metadata) => {
  telemetry.trackMetric(name, value, metadata);
};

export const trackError = (error, context = {}) => {
  telemetry.trackEvent('application_error', {
    message: error.message,
    stack: error.stack?.substring(0, 1000),
    context
  });
};

export const trackUserAction = (action, details = {}) => {
  telemetry.trackEvent('user_action', {
    action,
    ...details,
    page: window.location.pathname
  });
};

export const setTelemetryConsent = (hasConsent) => {
  telemetry.setConsentStatus(hasConsent);
};

export const getTelemetryStats = () => {
  return telemetry.getSessionStats();
};

export default telemetry;