import { useState, useEffect } from 'react';
import { getUserRole, isAuthenticated, type UserRole } from '@/lib/auth';

export const useAuth = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setRole(getUserRole());
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case token expires
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { role, authenticated, loading };
};


