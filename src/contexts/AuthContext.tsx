import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "student" | "mentor" | "alumni";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // base64 or URL
  nickname?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: UserRole, nickname?: string, avatar?: string) => boolean;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface StoredUser extends User {
  password: string;
}

const defaultUsers: StoredUser[] = [
  { id: "1", name: "Demo Student", email: "student@test.com", password: "123456", role: "student", nickname: "StudentDev" },
  { id: "2", name: "Demo Mentor", email: "mentor@test.com", password: "123456", role: "mentor", nickname: "MentorGuide" },
  { id: "3", name: "Demo Alumni", email: "alumni@test.com", password: "123456", role: "alumni", nickname: "AlumniPro" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(defaultUsers);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  }, [users]);

  const register = useCallback((name: string, email: string, password: string, role: UserRole, nickname?: string, avatar?: string) => {
    if (users.find((u) => u.email === email)) return false;
    const newUser: StoredUser = { id: String(Date.now()), name, email, password, role, nickname, avatar };
    setUsers((prev) => [...prev, newUser]);
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    return true;
  }, [users]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updates } : u)));
  }, [user]);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
