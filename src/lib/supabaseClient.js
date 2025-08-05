import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rouvkvcngmsquebokdyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdXZrdmNuZ21zcXVlYm9rZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDM3MzIsImV4cCI6MjA2NTQxOTczMn0.SL-ZXxdXUdEQvdn9nws2uOVZksSwduixVqfsmE0NGHU';

let supabaseInstance = null;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing. Check your environment variables.");
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
  });
} catch (error) {
  console.error("Error creating Supabase client:", error);
}

export const supabase = supabaseInstance;