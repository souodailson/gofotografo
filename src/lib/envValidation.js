// src/lib/envValidation.js
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("URL do Supabase deve ser válida"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Chave anônima do Supabase é obrigatória"),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional().default('development'),
});

let validatedEnv = null;

export const getValidatedEnv = () => {
  if (validatedEnv) return validatedEnv;

  try {
    const env = {
      VITE_SUPABASE_URL: import.meta?.env?.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta?.env?.VITE_SUPABASE_ANON_KEY,
      VITE_APP_ENV: import.meta?.env?.VITE_APP_ENV || 'development',
    };

    validatedEnv = EnvSchema.parse(env);
    return validatedEnv;
  } catch (error) {
    console.error('❌ Erro na validação das variáveis de ambiente:');
    console.error(error.errors || error.message);
    
    // Em desenvolvimento, mostrar erro detalhado
    if (import.meta?.env?.DEV) {
      throw new Error(
        `Configuração de ambiente inválida: ${
          error.errors?.map(e => `${e.path}: ${e.message}`).join(', ') || error.message
        }`
      );
    }
    
    throw new Error('Erro na configuração do ambiente. Verifique o console para detalhes.');
  }
};

export const isProductionEnv = () => {
  try {
    const env = getValidatedEnv();
    return env.VITE_APP_ENV === 'production';
  } catch {
    return false;
  }
};

export const isDevelopmentEnv = () => {
  try {
    const env = getValidatedEnv();
    return env.VITE_APP_ENV === 'development';
  } catch {
    return true; // Default para development se houver erro
  }
};