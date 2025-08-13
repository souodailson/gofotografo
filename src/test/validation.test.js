import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getValidatedEnv } from '@/lib/envValidation';

describe('Environment Validation', () => {
  const originalEnv = import.meta.env;
  
  beforeEach(() => {
    // Reset do mock do ambiente
    import.meta.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('deve validar variáveis de ambiente válidas', () => {
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-123';

    const result = getValidatedEnv();
    
    expect(result.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(result.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key-123');
  });

  it('deve lançar erro para URL inválida', () => {
    import.meta.env.VITE_SUPABASE_URL = 'invalid-url';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-123';

    expect(() => getValidatedEnv()).toThrow('URL do Supabase deve ser válida');
  });

  it('deve lançar erro para chave ausente', () => {
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;

    expect(() => getValidatedEnv()).toThrow('Chave anônima do Supabase é obrigatória');
  });

  it('deve detectar ambiente de desenvolvimento', () => {
    import.meta.env.DEV = true;
    import.meta.env.MODE = 'development';

    const { isDevelopmentEnv } = require('@/lib/envValidation');
    expect(isDevelopmentEnv()).toBe(true);
  });

  it('deve detectar ambiente de produção', () => {
    import.meta.env.DEV = false;
    import.meta.env.MODE = 'production';

    const { isDevelopmentEnv } = require('@/lib/envValidation');
    expect(isDevelopmentEnv()).toBe(false);
  });
});