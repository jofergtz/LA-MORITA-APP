import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const DEFAULT_SUPABASE_URL = 'https://xldbwdvzsfduomioziol.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZGJ3ZHZ6c2ZkdW9taW96aW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA1NTMsImV4cCI6MjEwMDIzNjU1M30.zs5nokMY2p5rPTSxBo2q039_7fmHc4eVBwIlvYZzw7U';

export const supabaseUrl = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-public-key'
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

