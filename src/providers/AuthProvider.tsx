import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppUser, AuthState, AuthError, AuthErrorCode } from '@/features/authentication/types/auth.types';
import { authApi } from '@/features/authentication/services/authApi';
import { getGoogleIdToken, googleSignOut } from '@/features/authentication/services/googleAuth';
import {
  markSessionExists,
  clearSessionMarker,
  hasSessionMarker,
} from '@/features/authentication/utils/sessionStorage';

// ─── State & Reducer ──────────────────────────────────────────────────────────

type Action =
  | { type: 'LOADING' }
  | { type: 'SET_USER'; payload: AppUser }
  | { type: 'SET_ERROR'; payload: AuthError }
  | { type: 'CLEAR' };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOADING':    return { ...state, isLoading: true, error: null };
    case 'SET_USER':   return { user: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':  return { user: null, isLoading: false, error: action.payload };
    case 'CLEAR':      return { user: null, isLoading: false, error: null };
  }
}

const initial: AuthState = { user: null, isLoading: true, error: null };

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  signIn: (onVerified?: (user: AppUser) => Promise<void> | void) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const marker = await hasSessionMarker();
      if (!marker) {
        dispatch({ type: 'CLEAR' });
        return;
      }
      try {
        const { user } = await authApi.me();
        dispatch({ type: 'SET_USER', payload: user });
      } catch {
        // Session expired or invalid — go to login
        await clearSessionMarker();
        dispatch({ type: 'CLEAR' });
      }
    })();
  }, []);

  const signIn = useCallback(
    async (onVerified?: (user: AppUser) => Promise<void> | void) => {
      dispatch({ type: 'LOADING' });
      try {
        const idToken = await getGoogleIdToken();
        if (idToken === null) {
          // User cancelled — silently return to idle
          dispatch({ type: 'CLEAR' });
          return;
        }
        const { user } = await authApi.signIn(idToken);
        await markSessionExists();
        if (onVerified) {
          await onVerified(user);
        }
        dispatch({ type: 'SET_USER', payload: user });
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        dispatch({
          type: 'SET_ERROR',
          payload: {
            code: (e.code as AuthErrorCode) ?? 'UNKNOWN',
            message: e.message ?? 'An unexpected error occurred.',
          },
        });
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try { await authApi.signOut(); } catch { /* best-effort */ }
    await googleSignOut();
    await clearSessionMarker();
    dispatch({ type: 'CLEAR' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
