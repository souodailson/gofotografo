import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rouvkvcngmsquebokdyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdXZrdmNuZ21zcXVlYm9rZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDM3MzIsImV4cCI6MjA2NTQxOTczMn0.SL-ZXxdXUdEQvdn9nws2uOVZksSwduixVqfsmE0NGHU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);