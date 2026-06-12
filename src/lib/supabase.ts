import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from either env variables or local storage for interactive configuration
const supabaseUrl = (
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
  localStorage.getItem('cativeiro_supabase_url') || 
  ''
).trim();

const supabaseAnonKey = (
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.API_ANON_PUBLIC || 
  (import.meta as any).env?.["API ANON PUBLIC"] || 
  localStorage.getItem('cativeiro_supabase_anon_key') || 
  ''
).trim();

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export const getSupabaseUrlAndKey = () => {
  return {
    url: supabaseUrl || localStorage.getItem('cativeiro_supabase_url') || '',
    anonKey: supabaseAnonKey || localStorage.getItem('cativeiro_supabase_anon_key') || '',
  };
};

export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
