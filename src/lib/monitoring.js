import { trackEvent, trackMetric, trackError } from './telemetry';
import { isDevelopmentEnv } from './envValidation';

/**
 * Sistema de Monitoramento e Health Checks
 */
class MonitoringSystem {
  constructor() {
    this.checks = new Map();
    this.alerts = [];
    this.metrics = new Map();
    this.thresholds = {
      performance: {
        pageLoadTime: 3000, // 3 segundos
        apiResponseTime: 1000, // 1 segundo
        memoryUsage: 100, // MB
        errorRate: 0.05 // 5%
      },
      availability: {
        apiUptime: 0.99, // 99%
        featureUptime: 0.95 // 95%
      }
    };
    
    this.init();
  }

  init() {
    this.setupPerformanceMonitoring();
    this.setupHealthChecks();
    this.setupErrorTracking();
    this.setupResourceMonitoring();
    
    // Executa checks periódicamente
    this.startPeriodicChecks();
  }

  // Monitora performance em tempo real
  setupPerformanceMonitoring() {
    // Monitor de API responses
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordApiCall(args[0], response.status, duration);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordApiError(args[0], error, duration);
        throw error;
      }
    };

    // Monitor de JavaScript execution time
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (callback, delay, ...args) => {
      const wrappedCallback = () => {
        const start = performance.now();
        try {
          callback();
        } finally {
          const end = performance.now();
          if (end - start > 16.67) { // > 1 frame (60fps)
            this.recordSlowOperation('setTimeout', end - start);
          }
        }
      };
      return originalSetTimeout(wrappedCallback, delay, ...args);
    };
  }

  // Sistema de health checks
  setupHealthChecks() {
    this.registerHealthCheck('localStorage', () => {
      try {
        const testKey = '__health_check__';
        localStorage.setItem(testKey, 'test');
        const value = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return value === 'test';
      } catch (error) {
        return false;
      }
    });

    this.registerHealthCheck('sessionStorage', () => {
      try {
        const testKey = '__health_check__';
        sessionStorage.setItem(testKey, 'test');
        const value = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        return value === 'test';
      } catch (error) {
        return false;
      }
    });

    this.registerHealthCheck('network', async () => {
      try {
        // Testa conectividade básica
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('https://httpbin.org/get', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return true;
      } catch (error) {
        return false;
      }
    });

    this.registerHealthCheck('webWorkerSupport', () => {
      return typeof Worker !== 'undefined';
    });

    this.registerHealthCheck('serviceWorkerSupport', () => {
      return 'serviceWorker' in navigator;
    });
  }

  // Rastreamento avançado de erros
  setupErrorTracking() {
    let errorCount = 0;
    let totalInteractions = 0;
    
    // Track error rate
    window.addEventListener('error', (event) => {
      errorCount++;
      this.updateErrorRate(errorCount, totalInteractions);
      
      trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href
      });
    });

    // Track user interactions for error rate calculation
    ['click', 'submit', 'input'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        totalInteractions++;
        this.updateErrorRate(errorCount, totalInteractions);
      }, { passive: true });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      errorCount++;
      this.updateErrorRate(errorCount, totalInteractions);
      
      trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        url: window.location.href
      });
    });
  }

  // Monitor de recursos do sistema
  setupResourceMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        const usedMB = memInfo.usedJSHeapSize / (1024 * 1024);
        
        this.recordMetric('memoryUsage', usedMB);
        
        if (usedMB > this.thresholds.performance.memoryUsage) {
          this.createAlert('high_memory_usage', {
            current: usedMB,
            threshold: this.thresholds.performance.memoryUsage
          });
        }
      }, 30000); // Check every 30 seconds
    }

    // Monitor connection quality
    if ('connection' in navigator) {
      const updateConnectionInfo = () => {
        const connection = navigator.connection;
        this.recordMetric('networkEffectiveType', connection.effectiveType);
        this.recordMetric('networkDownlink', connection.downlink);
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.createAlert('slow_connection', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink
          });
        }
      };

      navigator.connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }
  }

  // Registra um health check customizado
  registerHealthCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  // Executa todos os health checks
  async runHealthChecks() {
    const results = new Map();
    
    for (const [name, checkFn] of this.checks) {
      try {
        const result = await Promise.race([
          checkFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);
        
        results.set(name, { status: 'healthy', result });
      } catch (error) {
        results.set(name, { 
          status: 'unhealthy', 
          error: error.message,
          result: false
        });
        
        this.createAlert('health_check_failed', {
          check: name,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Registra chamada de API
  recordApiCall(url, status, duration) {
    const isSuccess = status >= 200 && status < 300;
    
    trackMetric('apiResponseTime', duration, {
      url: typeof url === 'string' ? url : url.toString(),
      status,
      success: isSuccess
    });

    if (duration > this.thresholds.performance.apiResponseTime) {
      this.createAlert('slow_api_response', {
        url,
        duration,
        threshold: this.thresholds.performance.apiResponseTime
      });
    }

    if (!isSuccess) {
      this.createAlert('api_error', {
        url,
        status,
        duration
      });
    }
  }

  // Registra erro de API
  recordApiError(url, error, duration) {
    trackError(error, {
      url: typeof url === 'string' ? url : url.toString(),
      duration,
      type: 'api_error'
    });

    this.createAlert('api_failure', {
      url,
      error: error.message,
      duration
    });
  }

  // Registra operação lenta
  recordSlowOperation(operation, duration) {
    trackMetric('slowOperation', duration, {
      operation,
      threshold: 16.67
    });

    this.createAlert('slow_operation', {
      operation,
      duration
    });
  }

  // Atualiza taxa de erros
  updateErrorRate(errors, interactions) {
    if (interactions === 0) return;
    
    const errorRate = errors / interactions;
    this.recordMetric('errorRate', errorRate);
    
    if (errorRate > this.thresholds.performance.errorRate) {
      this.createAlert('high_error_rate', {
        current: errorRate,
        threshold: this.thresholds.performance.errorRate,
        totalErrors: errors,
        totalInteractions: interactions
      });
    }
  }

  // Registra métrica
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    // Mantém histórico das últimas 100 medições
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const history = this.metrics.get(name);
    history.push(metric);
    
    if (history.length > 100) {
      history.shift();
    }

    trackMetric(name, value, metadata);
  }

  // Cria alerta
  createAlert(type, data) {
    const alert = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: Date.now(),
      severity: this.getAlertSeverity(type)
    };

    this.alerts.push(alert);
    
    // Remove alertas antigos (mantém últimos 50)
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    trackEvent('monitoring_alert', {
      alertType: type,
      severity: alert.severity,
      data
    });

    // Em desenvolvimento, loga alerts críticos
    if (isDevelopmentEnv() && alert.severity === 'critical') {
      console.warn('Critical Alert:', alert);
    }
  }

  // Determina severidade do alerta
  getAlertSeverity(type) {
    const severityMap = {
      'high_memory_usage': 'warning',
      'slow_connection': 'warning',
      'health_check_failed': 'error',
      'slow_api_response': 'warning',
      'api_error': 'error',
      'api_failure': 'critical',
      'slow_operation': 'warning',
      'high_error_rate': 'critical'
    };

    return severityMap[type] || 'info';
  }

  // Inicia checks periódicos
  startPeriodicChecks() {
    // Health checks a cada 5 minutos
    setInterval(async () => {
      const results = await this.runHealthChecks();
      
      trackEvent('health_check_completed', {
        totalChecks: results.size,
        healthyChecks: Array.from(results.values()).filter(r => r.status === 'healthy').length,
        timestamp: Date.now()
      });
    }, 5 * 60 * 1000);

    // Limpeza de dados antigos a cada hora
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  // Limpeza de dados antigos
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Remove alertas antigos
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneHourAgo);
    
    // Remove métricas antigas de cada tipo
    for (const [name, history] of this.metrics) {
      const filtered = history.filter(metric => metric.timestamp > oneHourAgo);
      this.metrics.set(name, filtered);
    }
  }

  // API pública para obter status
  getSystemStatus() {
    return {
      alerts: this.alerts.slice(-10), // Últimos 10 alertas
      metrics: this.getLatestMetrics(),
      uptime: performance.now(),
      timestamp: Date.now()
    };
  }

  // Obtém métricas mais recentes
  getLatestMetrics() {
    const latest = {};
    
    for (const [name, history] of this.metrics) {
      if (history.length > 0) {
        latest[name] = history[history.length - 1];
      }
    }
    
    return latest;
  }

  // Força execução de health checks
  async checkHealth() {
    return await this.runHealthChecks();
  }
}

// Instância global
const monitoring = new MonitoringSystem();

// Funções públicas
export const getSystemStatus = () => monitoring.getSystemStatus();
export const runHealthCheck = () => monitoring.checkHealth();
export const registerHealthCheck = (name, checkFn) => monitoring.registerHealthCheck(name, checkFn);

export default monitoring;