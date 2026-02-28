import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/auth';

interface AuthContextType {
    user: any | null;
    role: UserRole;
    authenticated: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>('student');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial session check
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setUser(session.user);
                    setRole(session.user.user_metadata?.role || 'student');
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event, session?.user?.id);

            if (session) {
                setUser(session.user);
                setRole(session.user.user_metadata?.role || 'student');
            } else {
                setUser(null);
                setRole('student');
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole('student');
    };

    const value = {
        user,
        role,
        authenticated: !!user,
        loading,
        signOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
