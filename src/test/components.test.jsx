import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LazyImage from '@/components/common/LazyImage';
import OptimizedInput from '@/components/common/OptimizedInput';
import { LazyVisibilityLoader } from '@/components/common/LazyComponentLoader';
import userEvent from '@testing-library/user-event';

describe('Performance Components', () => {
  describe('LazyImage', () => {
    it('deve renderizar placeholder antes de carregar', () => {
      render(
        <LazyImage 
          src="https://example.com/image.jpg" 
          alt="Test Image" 
          data-testid="lazy-image"
        />
      );
      
      // Verifica se o placeholder está presente
      expect(screen.getByTestId('lazy-image')).toBeInTheDocument();
    });

    it('deve carregar imagem quando visível', async () => {
      // Mock do IntersectionObserver
      const mockObserve = vi.fn();
      const mockDisconnect = vi.fn();
      
      global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
      }));

      render(
        <LazyImage 
          src="https://example.com/image.jpg" 
          alt="Test Image" 
          data-testid="lazy-image"
        />
      );
      
      expect(mockObserve).toHaveBeenCalled();
    });
  });

  describe('OptimizedInput', () => {
    it('deve fazer debounce das mudanças', async () => {
      const user = userEvent.setup();
      const mockCallback = vi.fn();
      
      render(
        <OptimizedInput
          onDebouncedChange={mockCallback}
          debounceMs={100}
          data-testid="optimized-input"
        />
      );
      
      const input = screen.getByTestId('optimized-input');
      
      // Digita rapidamente
      await user.type(input, 'test');
      
      // Callback não deve ter sido chamado ainda (debounce)
      expect(mockCallback).not.toHaveBeenCalled();
      
      // Espera o debounce
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('test');
      }, { timeout: 200 });
    });
  });

  describe('LazyVisibilityLoader', () => {
    it('deve renderizar fallback inicialmente', () => {
      render(
        <LazyVisibilityLoader fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="content">Content</div>
        </LazyVisibilityLoader>
      );
      
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('deve renderizar conteúdo quando visível', async () => {
      // Mock do IntersectionObserver que simula visibilidade
      global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
        // Simula entrada na viewport imediatamente
        setTimeout(() => {
          callback([{ isIntersecting: true }]);
        }, 0);
        
        return {
          observe: vi.fn(),
          disconnect: vi.fn(),
          unobserve: vi.fn(),
        };
      });

      render(
        <LazyVisibilityLoader fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="content">Content</div>
        </LazyVisibilityLoader>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });
  });
});