import React, { createContext, useEffect, useState } from "react";
import api from "../lib/api";
import { setAccessToken, clearAccessToken } from "../lib/auth";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  employeeId?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: { email: string; password: string; firstName: string; lastName?: string }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await api.post("/auth/refresh-token", {}, { withCredentials: true });
        const token = resp.data?.accessToken;
        const me = resp.data?.user;
        if (token) setAccessToken(token);
        if (mounted && me) setUser(me);
      } catch (error) {
        setUser(null);
        clearAccessToken();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await api.post("/auth/login", { email, password }, { withCredentials: true });
    const token = resp.data.accessToken;
    const me = resp.data.user;
    if (token) setAccessToken(token);
    setUser(me || null);
  };

  const register = async (payload: { email: string; password: string; firstName: string; lastName?: string }) => {
    const resp = await api.post("/auth/register", payload);
    if (resp.status === 201) {
      await login(payload.email, payload.password);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};