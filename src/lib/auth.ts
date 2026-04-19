import { Role } from '@/types/api';

const TOKEN_KEY = 'mouqawel_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as DecodedToken;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
}
