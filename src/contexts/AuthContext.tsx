import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiService } from "@/services/api";

export type UserRole = "student" | "mentor" | "alumni" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nickname?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, nickname?: string, avatar?: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          apiService.setToken(token);
          const response = await apiService.getCurrentUser();
          setUser({
            id: response.id,
            name: response.name,
            email: response.email,
            role: response.role,
            avatar: response.avatar,
            nickname: response.nickname,
          });
        } catch (err) {
          localStorage.removeItem('token');
          apiService.clearToken();
          setError(err instanceof Error ? err.message : 'Failed to load user');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiService.login(email, password);
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar: response.user.avatar,
        nickname: response.user.nickname,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
        throw err;
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar: response.user.avatar,
        nickname: response.user.nickname,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
        throw err;
    <AuthContext.Provider value={{
      user,
      login,
      register,
      updateUser,
      logout,
      isAuthenticated: !!user,
      isLoading,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
