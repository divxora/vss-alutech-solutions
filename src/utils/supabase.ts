import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User's Supabase project configuration
export const DEFAULT_SUPABASE_PROJECT_URL = 'https://cvamnocsfuanbwbljblm.supabase.co';
export const DEFAULT_SUBMIT_ENQUIRY_URL =
  'https://cvamnocsfuanbwbljblm.supabase.co/functions/v1/submit-enquiry';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_PROJECT_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
  );
};

export const getSupabaseUrl = (): string => supabaseUrl;
export const getSupabaseAnonKey = (): string => supabaseAnonKey;
export const getSubmitEnquiryUrl = (): string => {
  const custom = (import.meta.env.VITE_SUBMIT_ENQUIRY_URL as string | undefined)?.trim();
  if (custom) return custom;
  return `${supabaseUrl}/functions/v1/submit-enquiry`;
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

