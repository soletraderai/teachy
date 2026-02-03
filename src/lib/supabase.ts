/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

// Migrate from old storage key to new one
const OLD_SUPABASE_KEY = 'teachy-supabase-auth';
const NEW_SUPABASE_KEY = 'quiztube-supabase-auth';
if (typeof localStorage !== 'undefined') {
  const oldData = localStorage.getItem(OLD_SUPABASE_KEY);
  if (oldData && !localStorage.getItem(NEW_SUPABASE_KEY)) {
    localStorage.setItem(NEW_SUPABASE_KEY, oldData);
    localStorage.removeItem(OLD_SUPABASE_KEY);
  }
}

// Create Supabase client for frontend
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Auto-refresh tokens before they expire
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL (for OAuth callbacks)
      detectSessionInUrl: true,
      // Storage key for session
      storageKey: 'quiztube-supabase-auth',
    },
  }
);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Auth helper functions
export const supabaseAuth = {
  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign in with Google OAuth
  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Reset password request
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Refresh session
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },
};

export default supabase;
