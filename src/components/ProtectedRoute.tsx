import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = '/',
}: ProtectedRouteProps) => {
  const { role, authenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If not authenticated and trying to access protected route, redirect to login
    if (!loading && !authenticated && location.pathname !== '/auth') {
      // Could redirect to login with return URL
    }
  }, [authenticated, loading, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If role is required, check if user has it
  if (requiredRole) {
    const hasAccess = Array.isArray(requiredRole)
      ? requiredRole.includes(role)
      : role === requiredRole;

    if (!hasAccess) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};


