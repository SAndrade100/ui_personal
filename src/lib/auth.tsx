import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextValue = {
  user: { id: string; name: string } | null;
  signin: (cb?: () => void) => void;
  signout: (cb?: () => void) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // no-op for now; could hydrate from storage
  }, []);

  const signin = (cb?: () => void) => {
    setUser({ id: 'u1', name: 'Beatriz' });
    if (cb) cb();
  };

  const signout = (cb?: () => void) => {
    setUser(null);
    if (cb) cb();
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
