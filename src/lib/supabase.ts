import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function isValidSupabaseUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    trimmed.includes('your-supabase-url') ||
    trimmed.includes('your-project-id') ||
    trimmed.includes('your-project') ||
    trimmed.includes('example.com') ||
    trimmed === 'YOUR_SUPABASE_URL'
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidSupabaseKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (
    trimmed.includes('your-anon-key') ||
    trimmed.includes('your-key') ||
    trimmed === 'YOUR_SUPABASE_ANON_KEY' ||
    trimmed.length < 20
  ) {
    return false;
  }
  return true;
}

function initSupabase(): SupabaseClient | null {
  const url = rawSupabaseUrl.trim();
  const key = rawSupabaseAnonKey.trim();

  if (!isValidSupabaseUrl(url) || !isValidSupabaseKey(key)) {
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Could not initialize Supabase client; falling back to local store:', err);
    return null;
  }
}

export const supabase: SupabaseClient | null = initSupabase();

export const isSupabaseConfigured: boolean = Boolean(supabase);
