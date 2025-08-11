// src/lib/logger.js
import { isDevelopmentEnv } from './envValidation.js';

class Logger {
  constructor() {
    this.isDev = isDevelopmentEnv();
  }

  info(message, ...args) {
    if (this.isDev) {
      console.info(`ℹ️ [INFO] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.isDev) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.isDev) {
      console.error(`❌ [ERROR] ${message}`, ...args);
    }
    // Em produção, pode enviar para serviço de monitoring
    // TODO: Integrar com Sentry ou similar
  }

  success(message, ...args) {
    if (this.isDev) {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.isDev) {
      console.debug(`🐛 [DEBUG] ${message}`, ...args);
    }
  }

  // Para logs que devem aparecer sempre (ex: inicialização crítica)
  always(message, ...args) {
    console.log(message, ...args);
  }
}

// Singleton
export const logger = new Logger();

// Helpers para casos específicos
export const logError = (context, error) => {
  logger.error(`${context}:`, error);
};

export const logSupabaseError = (operation, error) => {
  logger.error(`Supabase ${operation} error:`, {
    message: error.message,
    code: error.code,
    details: error.details,
  });
};

export const logApiCall = (endpoint, method = 'GET') => {
  logger.debug(`API Call: ${method} ${endpoint}`);
};

export const logUserAction = (action, userId = null) => {
  logger.info(`User Action: ${action}${userId ? ` (User: ${userId})` : ''}`);
};