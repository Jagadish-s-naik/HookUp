import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
  console.warn('Supabase URL or Anon Key is missing or invalid. Check your .env file.');
}

const finalUrl = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = (supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key') ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(finalUrl, finalKey);
