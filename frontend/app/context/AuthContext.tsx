'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenService, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize token from localStorage if exists (for migration)
        tokenService.initTokenFromLocalStorage();

        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }

        // Verify token is valid by fetching current user
        const token = tokenService.getToken();
        if (token) {
            authAPI.getCurrentUser()
                .then((data) => {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                })
                .catch(() => {
                    tokenService.removeToken();
                    localStorage.removeItem('user');
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        console.log('AuthContext: Calling login API...'); // Debug log
        const data = await authAPI.login(email, password);
        console.log('AuthContext: Login API response:', data); // Debug log
        console.log('AuthContext: User data:', data.user); // Debug log
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('AuthContext: User saved to localStorage'); // Debug log
    };

    const signup = async (name: string, email: string, password: string) => {
        const data = await authAPI.signup(name, email, password);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const data = await authAPI.getCurrentUser();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
