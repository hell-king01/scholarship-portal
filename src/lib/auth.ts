/**
 * Utility functions for authentication and user role management
 */

export type UserRole = 'student' | 'admin' | 'mentor';

interface JWTPayload {
  userId?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: In production, always verify tokens on the server
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Get user role from auth token
 * Returns 'student' as default if role cannot be determined
 */
export const getUserRole = (): UserRole => {
  const token = localStorage.getItem('authToken');
  if (!token) return 'student';
  
  const payload = decodeJWT(token);
  if (!payload) return 'student';
  
  // Check if token is expired
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('authToken');
    return 'student';
  }
  
  // Return role from token, default to 'student'
  const role = payload.role?.toLowerCase();
  if (role === 'admin' || role === 'mentor' || role === 'student') {
    return role;
  }
  
  return 'student';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  const payload = decodeJWT(token);
  if (!payload) return false;
  
  // Check if token is expired
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('authToken');
    return false;
  }
  
  return true;
};

/**
 * Get user ID from token
 */
export const getUserId = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  const payload = decodeJWT(token);
  return payload?.userId || null;
};

/**
 * Check if user has required role
 */
export const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const userRole = getUserRole();
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};


