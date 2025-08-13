// src/lib/envValidation.js
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("URL do Supabase deve ser válida"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Chave anônima do Supabase é obrigatória"),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional().default('development'),
});

// Fallbacks seguros para desenvolvimento
const DEVELOPMENT_FALLBACKS = {
  VITE_SUPABASE_URL: 'https://rouvkvcngmsquebokdyg.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdXZrdmNuZ21zcXVlYm9rZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDM3MzIsImV4cCI6MjA2NTQxOTczMn0.SL-ZXxdXUdEQvdn9nws2uOVZksSwduixVqfsmE0NGHU'
};

let validatedEnv = null;

export const getValidatedEnv = () => {
  if (validatedEnv) return validatedEnv;

  // Detecta se está em ambiente Vite
  const isViteContext = typeof import.meta !== 'undefined' && import.meta.env;
  const isDev = isViteContext ? 
    (import.meta.env.DEV === true || import.meta.env.MODE === 'development') : 
    true; // Assume desenvolvimento fora do Vite

  let env = {
    VITE_SUPABASE_URL: isViteContext ? import.meta.env.VITE_SUPABASE_URL : undefined,
    VITE_SUPABASE_ANON_KEY: isViteContext ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined,
    VITE_APP_ENV: isViteContext ? (import.meta.env.VITE_APP_ENV || 'development') : 'development',
  };

  // Sempre usa fallbacks em desenvolvimento se as variáveis não estiverem definidas
  if (isDev && (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY)) {
    if (isViteContext) {
      console.warn('⚠️ Usando configurações de fallback para desenvolvimento');
    }
    env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL || DEVELOPMENT_FALLBACKS.VITE_SUPABASE_URL;
    env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || DEVELOPMENT_FALLBACKS.VITE_SUPABASE_ANON_KEY;
  }

  try {
    validatedEnv = EnvSchema.parse(env);
    return validatedEnv;
  } catch (error) {
    if (isViteContext) {
      console.error('❌ Erro na validação das variáveis de ambiente:');
      console.error(error.errors || error.message);
    }
    
    // Em desenvolvimento, sempre usa fallbacks como último recurso
    if (isDev) {
      if (isViteContext) {
        console.warn('🔄 Aplicando configurações de fallback como último recurso...');
      }
      
      validatedEnv = {
        VITE_SUPABASE_URL: DEVELOPMENT_FALLBACKS.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: DEVELOPMENT_FALLBACKS.VITE_SUPABASE_ANON_KEY,
        VITE_APP_ENV: 'development'
      };
      
      if (isViteContext) {
        console.log('✅ Configurações de fallback aplicadas com sucesso');
      }
      
      return validatedEnv;
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