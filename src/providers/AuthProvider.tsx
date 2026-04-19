'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken as saveToken, clearToken, decodeToken, isTokenValid } from '@/lib/auth';
import { Role } from '@/types/api';

interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token);
      if (decoded) setUser({ id: decoded.sub, email: decoded.email, role: decoded.role });
    }
    setIsLoading(false);
  }, []);

  function login(token: string) {
    saveToken(token);
    const decoded = decodeToken(token);
    if (decoded) setUser({ id: decoded.sub, email: decoded.email, role: decoded.role });
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
