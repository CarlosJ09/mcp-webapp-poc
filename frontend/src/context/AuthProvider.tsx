/**
 * Authentication Context Provider
 * Manages user authentication state throughout the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/config/auth0';

interface AuthState {
  user: UserProfile | null;
  authenticated: boolean;
  loading: boolean;
  expiresAt?: number;
}

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    authenticated: false,
    loading: true,
  });

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const sessionData = await response.json();
      
      setAuthState({
        user: sessionData.user,
        authenticated: sessionData.authenticated,
        loading: false,
        expiresAt: sessionData.expiresAt,
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      setAuthState({
        user: null,
        authenticated: false,
        loading: false,
      });
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Initialize session on mount
  useEffect(() => {
    refreshSession();
  }, []);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (authState.authenticated && authState.expiresAt) {
      const timeUntilExpiry = authState.expiresAt - Date.now();
      const refreshBuffer = 60000; // Refresh 1 minute before expiry
      
      if (timeUntilExpiry > refreshBuffer) {
        const timeoutId = setTimeout(() => {
          refreshSession();
        }, timeUntilExpiry - refreshBuffer);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [authState.authenticated, authState.expiresAt]);

  const contextValue: AuthContextValue = {
    ...authState,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
