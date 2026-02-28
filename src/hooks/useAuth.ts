import { useAuthContext } from '@/context/AuthContext';

/**
 * Hook to access modern centralized auth state
 * Returns the same interface as before but from a central provider
 */
export const useAuth = () => {
  const { user, role, authenticated, loading, signOut } = useAuthContext();
  return { user, role, authenticated, loading, signOut };
};
