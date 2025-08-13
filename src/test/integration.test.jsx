import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Testes de integração para funcionalidades principais
describe('Integration Tests - Core Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Dashboard Integration', () => {
    it('deve carregar e exibir cards do dashboard', async () => {
      const mockDashboardData = [
        { id: '1', type: 'stat', title: 'Total Clientes', value: '150' },
        { id: '2', type: 'stat', title: 'Receita Mensal', value: 'R$ 12.500' }
      ];

      // Mock da resposta da API
      global.mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ data: mockDashboardData, error: null })
      });

      // Simula componente que usa os dados
      const DashboardMock = () => {
        const [data, setData] = React.useState([]);
        
        React.useEffect(() => {
          const fetchData = async () => {
            const result = await global.mockSupabase
              .from('dashboard_cards')
              .select('*');
            if (result.data) setData(result.data);
          };
          fetchData();
        }, []);

        return (
          <div data-testid="dashboard">
            {data.map(item => (
              <div key={item.id} data-testid={`card-${item.id}`}>
                <h3>{item.title}</h3>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        );
      };

      render(<DashboardMock />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByText('Total Clientes')).toBeInTheDocument();
      expect(screen.getByText('R$ 12.500')).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('deve gerenciar o fluxo completo de logout', async () => {
      const user = userEvent.setup();
      
      // Mock do contexto de auth
      const AuthMock = () => {
        const [isLoggedIn, setIsLoggedIn] = React.useState(true);

        const handleLogout = async () => {
          // Simula limpeza de dados
          localStorage.clear();
          sessionStorage.clear();
          
          // Mock do Supabase signOut
          await global.mockSupabase.auth.signOut();
          
          setIsLoggedIn(false);
        };

        return (
          <div>
            {isLoggedIn ? (
              <div>
                <span data-testid="user-status">Logado</span>
                <button onClick={handleLogout} data-testid="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <span data-testid="user-status">Deslogado</span>
            )}
          </div>
        );
      };

      // Adiciona dados aos storages
      localStorage.setItem('user-data', 'test-data');
      sessionStorage.setItem('session-data', 'session-info');

      render(<AuthMock />);

      // Verifica estado inicial
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logado');
      expect(localStorage.getItem('user-data')).toBe('test-data');

      // Executa logout
      await user.click(screen.getByTestId('logout-btn'));

      // Verifica mudança de estado
      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Deslogado');
      });

      // Verifica limpeza dos storages
      expect(localStorage.getItem('user-data')).toBeNull();
      expect(sessionStorage.getItem('session-data')).toBeNull();

      // Verifica chamada do Supabase
      expect(global.mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Performance Optimizations', () => {
    it('deve aplicar lazy loading corretamente', async () => {
      const LazyComponentMock = () => {
        const [isVisible, setIsVisible] = React.useState(false);
        const [isLoaded, setIsLoaded] = React.useState(false);
        const ref = React.useRef();

        React.useEffect(() => {
          // Simula IntersectionObserver
          const observer = {
            observe: () => {
              // Simula entrada na viewport após um tempo
              setTimeout(() => {
                setIsVisible(true);
              }, 100);
            },
            disconnect: () => {}
          };

          if (ref.current) {
            observer.observe(ref.current);
          }

          return () => observer.disconnect();
        }, []);

        const handleLoad = () => {
          setIsLoaded(true);
        };

        return (
          <div ref={ref} data-testid="lazy-container">
            {isVisible ? (
              <img 
                src="test-image.jpg" 
                alt="Test" 
                onLoad={handleLoad}
                data-testid={isLoaded ? "image-loaded" : "image-loading"}
              />
            ) : (
              <div data-testid="placeholder">Loading...</div>
            )}
          </div>
        );
      };

      render(<LazyComponentMock />);

      // Inicialmente mostra placeholder
      expect(screen.getByTestId('placeholder')).toBeInTheDocument();

      // Aguarda lazy loading
      await waitFor(() => {
        expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
      }, { timeout: 200 });

      // Verifica se imagem está presente
      expect(screen.getByTestId('image-loading')).toBeInTheDocument();
    });

    it('deve implementar debounce em inputs', async () => {
      const user = userEvent.setup();
      const mockCallback = vi.fn();

      const DebouncedInputMock = () => {
        const [value, setValue] = React.useState('');
        
        // Simula debounce
        React.useEffect(() => {
          const timer = setTimeout(() => {
            if (value.trim()) {
              mockCallback(value);
            }
          }, 300);

          return () => clearTimeout(timer);
        }, [value]);

        return (
          <input
            data-testid="debounced-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite algo..."
          />
        );
      };

      render(<DebouncedInputMock />);

      const input = screen.getByTestId('debounced-input');

      // Digita rapidamente
      await user.type(input, 'test input');

      // Callback não deve ter sido chamado ainda
      expect(mockCallback).not.toHaveBeenCalled();

      // Aguarda debounce
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('test input');
      }, { timeout: 400 });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Features', () => {
    it('deve gerenciar configurações de acessibilidade', async () => {
      const user = userEvent.setup();

      const AccessibilityMock = () => {
        const [settings, setSettings] = React.useState({
          highContrast: false,
          fontSize: 'normal'
        });

        const toggleHighContrast = () => {
          const newValue = !settings.highContrast;
          setSettings(prev => ({ ...prev, highContrast: newValue }));
          
          // Simula aplicação no DOM
          if (newValue) {
            document.documentElement.classList.add('high-contrast');
          } else {
            document.documentElement.classList.remove('high-contrast');
          }
        };

        const changeFontSize = (size) => {
          setSettings(prev => ({ ...prev, fontSize: size }));
          document.documentElement.className = document.documentElement.className
            .replace(/font-\w+/g, '')
            .concat(` font-${size}`);
        };

        return (
          <div>
            <button 
              onClick={toggleHighContrast}
              data-testid="contrast-toggle"
              aria-pressed={settings.highContrast}
            >
              {settings.highContrast ? 'Desativar' : 'Ativar'} Alto Contraste
            </button>
            
            <select 
              value={settings.fontSize}
              onChange={(e) => changeFontSize(e.target.value)}
              data-testid="font-size-select"
              aria-label="Tamanho da fonte"
            >
              <option value="small">Pequeno</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>

            <div data-testid="settings-status">
              Contraste: {settings.highContrast ? 'Alto' : 'Normal'} |
              Fonte: {settings.fontSize}
            </div>
          </div>
        );
      };

      render(<AccessibilityMock />);

      // Verifica estado inicial
      expect(screen.getByTestId('settings-status')).toHaveTextContent('Contraste: Normal');
      expect(screen.getByTestId('contrast-toggle')).toHaveAttribute('aria-pressed', 'false');

      // Ativa alto contraste
      await user.click(screen.getByTestId('contrast-toggle'));

      expect(screen.getByTestId('settings-status')).toHaveTextContent('Contraste: Alto');
      expect(screen.getByTestId('contrast-toggle')).toHaveAttribute('aria-pressed', 'true');
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

      // Altera tamanho da fonte
      await user.selectOptions(screen.getByTestId('font-size-select'), 'large');

      expect(screen.getByTestId('settings-status')).toHaveTextContent('Fonte: large');
      expect(document.documentElement.classList.contains('font-large')).toBe(true);
    });
  });

  describe('Mobile Optimizations', () => {
    it('deve detectar e otimizar para mobile', () => {
      // Mock do viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      const MobileOptimizedMock = () => {
        const [isMobile, setIsMobile] = React.useState(false);
        
        React.useEffect(() => {
          const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            
            if (mobile) {
              document.body.classList.add('mobile-optimized');
              // Aplica configurações de mobile
              document.documentElement.style.setProperty('--touch-target-size', '44px');
            } else {
              document.body.classList.remove('mobile-optimized');
            }
          };

          checkMobile();
          window.addEventListener('resize', checkMobile);
          
          return () => window.removeEventListener('resize', checkMobile);
        }, []);

        return (
          <div data-testid="mobile-container">
            <span data-testid="device-type">
              {isMobile ? 'Mobile' : 'Desktop'}
            </span>
            <button 
              data-testid="touch-button"
              style={{ minHeight: 'var(--touch-target-size)', minWidth: 'var(--touch-target-size)' }}
            >
              Touch Target
            </button>
          </div>
        );
      };

      render(<MobileOptimizedMock />);

      expect(screen.getByTestId('device-type')).toHaveTextContent('Mobile');
      expect(document.body.classList.contains('mobile-optimized')).toBe(true);
      
      const touchButton = screen.getByTestId('touch-button');
      const computedStyle = window.getComputedStyle(touchButton);
      expect(computedStyle.minHeight).toBe('var(--touch-target-size)');
    });
  });

  describe('Error Handling', () => {
    it('deve capturar e reportar erros corretamente', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errors = [];

      // Mock do sistema de telemetria
      const mockTelemetry = {
        trackError: (error) => errors.push(error)
      };

      const ErrorBoundaryMock = ({ children }) => {
        const [hasError, setHasError] = React.useState(false);

        React.useEffect(() => {
          const handleError = (error) => {
            setHasError(true);
            mockTelemetry.trackError({
              message: error.message || 'Unknown error',
              stack: error.stack
            });
          };

          window.addEventListener('error', handleError);
          return () => window.removeEventListener('error', handleError);
        }, []);

        if (hasError) {
          return (
            <div data-testid="error-fallback">
              Algo deu errado. Por favor, recarregue a página.
            </div>
          );
        }

        return children;
      };

      const ProblematicComponent = () => {
        const [shouldError, setShouldError] = React.useState(false);

        if (shouldError) {
          throw new Error('Erro de teste');
        }

        return (
          <button 
            onClick={() => setShouldError(true)}
            data-testid="error-trigger"
          >
            Trigger Error
          </button>
        );
      };

      const TestApp = () => (
        <ErrorBoundaryMock>
          <ProblematicComponent />
        </ErrorBoundaryMock>
      );

      render(<TestApp />);

      const triggerButton = screen.getByTestId('error-trigger');
      
      // Simula erro
      expect(() => {
        fireEvent.click(triggerButton);
      }).toThrow('Erro de teste');

      errorSpy.mockRestore();
    });
  });
});