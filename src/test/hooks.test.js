import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQueryCache } from '@/hooks/useQueryCache';
import { useDebounce } from '@/hooks/useDebounce';

describe('Custom Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useQueryCache', () => {
    it('deve cachear e recuperar dados', () => {
      const { result } = renderHook(() => useQueryCache());
      
      const testData = { id: 1, name: 'Test' };
      
      // Set data
      act(() => {
        result.current.set('test-key', testData);
      });
      
      // Get data
      const cachedData = result.current.get('test-key');
      expect(cachedData).toEqual(testData);
    });

    it('deve retornar null para dados expirados', async () => {
      const { result } = renderHook(() => useQueryCache(50)); // 50ms TTL
      
      const testData = { id: 1, name: 'Test' };
      
      act(() => {
        result.current.set('test-key', testData, 50);
      });
      
      // Espera expirar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cachedData = result.current.get('test-key');
      expect(cachedData).toBeNull();
    });

    it('deve invalidar cache', () => {
      const { result } = renderHook(() => useQueryCache());
      
      const testData = { id: 1, name: 'Test' };
      
      act(() => {
        result.current.set('test-key', testData);
      });
      
      expect(result.current.get('test-key')).toEqual(testData);
      
      act(() => {
        result.current.invalidate('test-key');
      });
      
      expect(result.current.get('test-key')).toBeNull();
    });

    it('deve verificar se tem dados em cache válidos', () => {
      const { result } = renderHook(() => useQueryCache());
      
      const testData = { id: 1, name: 'Test' };
      
      expect(result.current.has('test-key')).toBe(false);
      
      act(() => {
        result.current.set('test-key', testData);
      });
      
      expect(result.current.has('test-key')).toBe(true);
    });
  });

  describe('useDebounce', () => {
    it('deve fazer debounce de valores', async () => {
      let value = 'initial';
      const { result, rerender } = renderHook(
        ({ val, delay }) => useDebounce(val, delay),
        { initialProps: { val: value, delay: 100 } }
      );
      
      // Valor inicial
      expect(result.current).toBe('initial');
      
      // Muda valor
      value = 'updated';
      rerender({ val: value, delay: 100 });
      
      // Ainda deve ser o valor antigo (debounced)
      expect(result.current).toBe('initial');
      
      // Espera o debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      // Agora deve ter o novo valor
      expect(result.current).toBe('updated');
    });
  });
});