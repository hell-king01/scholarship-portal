import { supabase } from './supabase';

export type UserRole = 'student' | 'admin' | 'mentor';

/**
 * Get user role from Supabase session or user metadata
 * Returns 'student' as default if role cannot be determined
 */
export const getUserRole = async (): Promise<UserRole> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return 'student';

  // Try to get role from user metadata first
  const role = session.user.user_metadata?.role?.toLowerCase();
  if (role === 'admin' || role === 'mentor' || role === 'student') {
    return role as UserRole;
  }

  // Fallback: Check profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role) {
    return profile.role as UserRole;
  }

  return 'student';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Get user ID from session
 */
export const getUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id || null;
};

/**
 * Check if user has required role
 */
export const hasRole = async (requiredRole: UserRole | UserRole[]): Promise<boolean> => {
  const userRole = await getUserRole();
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};



