import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, setToken, clearToken, getToken } from './api';

type User = { id: string; name: string; role: 'student' | 'trainer' };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  signin: (email: string, password: string, cb?: (err?: string) => void) => void;
  signout: (cb?: () => void) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    const stored = getToken();
    if (!stored) return;
    setTokenState(stored);
    apiFetch<User>('/api/auth/me').then(setUser).catch(() => clearToken());
  }, []);

  const signin = (
    email: string,
    password: string,
    cb?: (err?: string) => void,
  ) => {
    apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
      .then(({ token: t, user: u }) => {
        setToken(t);
        setTokenState(t);
        setUser(u);
        if (cb) cb();
      })
      .catch((err: Error) => {
        if (cb) cb(err.message);
      });
  };

  const signout = (cb?: () => void) => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    clearToken();
    setTokenState(null);
    setUser(null);
    if (cb) cb();
  };

  return (
    <AuthContext.Provider value={{ user, token, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
