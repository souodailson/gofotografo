import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './authContext.jsx';
import { supabase } from '@/lib/supabaseClient';
import { useLocation } from 'react-router-dom';

const ErrorLoggingContext = createContext(null);

export const useErrorLogger = () => useContext(ErrorLoggingContext);

const getDeviceInfo = () => {
  return {
    browser: navigator.userAgent,
    platform: navigator.platform,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    window_resolution: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
  };
};

const ErrorLoggingInternal = ({ children }) => {
  const { user, settings } = useAuth();
  const location = useLocation();

  const reportError = useCallback(async (errorData) => {
    try {
      const payload = {
        type: errorData.type || 'error',
        route: location.pathname,
        message: typeof errorData.message === 'object' ? JSON.stringify(errorData.message, null, 2) : String(errorData.message),
        stack_trace: errorData.stack_trace,
        user_info: {
          id: user?.id || null,
          email: user?.email || null,
          name: settings?.user_name || null,
        },
        device_info: getDeviceInfo(),
        user_id: user?.id || null,
      };

      await supabase.functions.invoke('report-error', {
        body: JSON.stringify(payload),
      });

    } catch (e) {
      console.error("Failed to report error:", e);
    }
  }, [user, settings, location.pathname]);

  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      const message = args.map(arg => {
        if (arg instanceof Error) return arg.message;
        try { return JSON.stringify(arg); }
        catch (e) { return String(arg); }
      }).join(' ');

      const stack = args.find(arg => arg instanceof Error)?.stack;

      reportError({
        type: 'log',
        message: `CONSOLE_ERROR: ${message}`,
        stack_trace: stack,
      });
    };

    const handleGlobalError = (event) => {
      reportError({
        message: event.message,
        stack_trace: event.error?.stack,
      });
    };

    const handleUnhandledRejection = (event) => {
      reportError({
        type: 'unhandled_rejection',
        message: event.reason?.message || 'Promise rejection with no message',
        stack_trace: event.reason?.stack,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);
  
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        if (response.status >= 400 && response.status < 600) {
            const requestUrl = args[0] instanceof Request ? args[0].url : args[0];
            
            if (requestUrl.includes('/report-error')) {
                return response;
            }

            reportError({
                type: 'network_error',
                message: `Fetch failed with status ${response.status} for URL: ${requestUrl}`,
                stack_trace: `Status: ${response.status}\nURL: ${requestUrl}\nMethod: ${args[0]?.method || 'GET'}`,
            });
        }
        return response;
    };

    return () => {
        window.fetch = originalFetch;
    };
  }, [reportError]);
  
  return children;
};

export const ErrorLoggingProvider = ({ children }) => {
  return (
    <ErrorLoggingContext.Provider value={null}>
      <ErrorLoggingInternal>
        {children}
      </ErrorLoggingInternal>
    </ErrorLoggingContext.Provider>
  );
};