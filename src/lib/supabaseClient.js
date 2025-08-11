// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { getValidatedEnv, isDevelopmentEnv } from './envValidation.js';

// Singleton para o cliente Supabase
let _client = null;

const initializeSupabaseClient = () => {
  try {
    const env = getValidatedEnv();
    
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Variáveis de ambiente do Supabase não encontradas.');
    }

    _client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    if (isDevelopmentEnv()) {
      console.log('✅ Supabase client inicializado com sucesso');
    }

    return _client;
  } catch (error) {
    console.error('❌ Erro ao inicializar Supabase client:', error.message);
    
    if (isDevelopmentEnv()) {
      console.error('Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env');
    }
    
    _client = null;
    throw error;
  }
};

// Inicializar o cliente
try {
  initializeSupabaseClient();
} catch (error) {
  // Em desenvolvimento, re-throw para mostrar erro
  if (isDevelopmentEnv()) {
    throw error;
  }
  // Em produção, apenas log do erro
  console.error('Supabase initialization failed:', error.message);
}

// Getter para o cliente com lazy initialization
export const getSupabaseClient = () => {
  if (!_client) {
    try {
      return initializeSupabaseClient();
    } catch (error) {
      throw new Error('Não foi possível conectar ao banco de dados. Verifique sua configuração.');
    }
  }
  return _client;
};

// Export padrão para compatibilidade
export const supabase = getSupabaseClient();
export default supabase;
