import { useRef, useCallback } from 'react';

/**
 * Hook para cache de queries com TTL (Time To Live)
 * Reduz requisições desnecessárias e melhora a performance
 */
export const useQueryCache = (defaultTTL = 5 * 60 * 1000) => { // 5 minutos default
  const cache = useRef(new Map());

  const get = useCallback((key) => {
    const cached = cache.current.get(key);
    if (!cached) return null;
    
    const { data, timestamp, ttl } = cached;
    const now = Date.now();
    
    if (now - timestamp > ttl) {
      cache.current.delete(key);
      return null;
    }
    
    return data;
  }, []);

  const set = useCallback((key, data, ttl = defaultTTL) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, [defaultTTL]);

  const invalidate = useCallback((key) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const has = useCallback((key) => {
    const cached = cache.current.get(key);
    if (!cached) return false;
    
    const { timestamp, ttl } = cached;
    const now = Date.now();
    
    if (now - timestamp > ttl) {
      cache.current.delete(key);
      return false;
    }
    
    return true;
  }, []);

  return { get, set, invalidate, has };
};

/**
 * Hook para cache de queries do Supabase com invalidação automática
 */
export const useSupabaseCache = () => {
  const { get, set, invalidate, has } = useQueryCache();

  const cachedQuery = useCallback(async (queryKey, queryFn, ttl) => {
    // Verifica se já tem em cache
    if (has(queryKey)) {
      return get(queryKey);
    }

    try {
      const result = await queryFn();
      
      // Só cacheia se não teve erro
      if (!result.error) {
        set(queryKey, result, ttl);
      }
      
      return result;
    } catch (error) {
      return { error, data: null };
    }
  }, [get, set, has]);

  return { cachedQuery, invalidate };
};

export default useQueryCache;