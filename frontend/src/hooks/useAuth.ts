/**
 * Authentication Hook
 * Provides convenient access to authentication state and methods
 */

import { useAuth as useAuthContext } from '@/context/AuthProvider';

export function useAuth() {
  return useAuthContext();
}

// Re-export for convenience
export * from '@/context/AuthProvider';
