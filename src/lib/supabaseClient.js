// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Use .env do Vite se existir (recomendado)
const VITE_URL = import.meta?.env?.VITE_SUPABASE_URL;
const VITE_ANON = import.meta?.env?.VITE_SUPABASE_ANON_KEY;

// Fallback para os valores que você já tinha
const FALLBACK_URL = 'https://rouvkvcngmsquebokdyg.supabase.co';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdXZrdmNuZ21zcXVlYm9rZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDM3MzIsImV4cCI6MjA2NTQxOTczMn0.SL-ZXxdXUdEQvdn9nws2uOVZksSwduixVqfsmE0NGHU';

// Escolhe env ou fallback
const supabaseUrl = VITE_URL || FALLBACK_URL;
const supabaseAnonKey = VITE_ANON || FALLBACK_ANON;

// Singleton
let _client;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL/Anon Key ausentes.');
  }
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} catch (e) {
  console.error('Erro criando o Supabase client:', e);
  _client = null;
}

// Exporta dos dois jeitos
export const supabase = _client;
export default _client;
