import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
}

// Create Supabase admin client for server-side operations
// Uses service role key for full database access
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceRoleKey);
};

// Verify a Supabase JWT token and return the user
export const verifySupabaseToken = async (token: string) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error('Supabase token verification error:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Supabase token verification failed:', error);
    return null;
  }
};

// Get user by Supabase ID
export const getSupabaseUser = async (supabaseUserId: string) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);

    if (error) {
      console.error('Failed to get Supabase user:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to get Supabase user:', error);
    return null;
  }
};

// Delete a Supabase user (for account deletion)
export const deleteSupabaseUser = async (supabaseUserId: string) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);

    if (error) {
      console.error('Failed to delete Supabase user:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete Supabase user:', error);
    return false;
  }
};

export default supabaseAdmin;
