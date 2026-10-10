import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import {
  loginApi,
  registerApi,
  fetchCreditsApi,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  credits: number | null;
  isAuthenticated: boolean;
  isLoadingCredits: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'imagify_auth_token';
const USER_KEY = 'imagify_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(false);

  const refreshCredits = useCallback(async () => {
    if (!token) {
      setCredits(null);
      return;
    }
    setIsLoadingCredits(true);
    try {
      const res = await fetchCreditsApi(token);
      if ((res.sucess || res.success) && typeof res.credits === 'number') {
        setCredits(res.credits);
        if (res.user?.name) {
          setUser((prevUser) => {
            const userName = res.user!.name;
            const newCredits = res.credits!;
            if (prevUser && prevUser.name === userName && prevUser.creditBalance === newCredits) {
              return prevUser;
            }
            const updated: User = {
              ...(prevUser || { email: '' }),
              name: userName,
              creditBalance: newCredits,
            };
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch {
      // Keep existing credits state on network error
    } finally {
      setIsLoadingCredits(false);
    }
  }, [token]);

  // Only refresh credits once when token is initialized or changed
  useEffect(() => {
    if (token) {
      refreshCredits();
    } else {
      setCredits(null);
    }
  }, [token, refreshCredits]);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    const isSuccess = res.sucess === true || res.success === true;
    if (isSuccess && res.token) {
      setToken(res.token);
      localStorage.setItem(TOKEN_KEY, res.token);
      const newUser: User = {
        name: res.user?.name || 'Studio Member',
        email,
      };
      setUser(newUser);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return { success: true };
    }
    return {
      success: false,
      message: res.message || 'Authentication failed. Please verify credentials.',
    };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerApi(name, email, password);
    const isSuccess = res.sucess === true || res.success === true;
    if (isSuccess && res.token) {
      setToken(res.token);
      localStorage.setItem(TOKEN_KEY, res.token);
      const newUser: User = {
        name: res.user?.name || name,
        email,
      };
      setUser(newUser);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return { success: true };
    }
    return {
      success: false,
      message: res.message || 'Registration failed. Check inputs or backend availability.',
    };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCredits(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        credits,
        isAuthenticated: !!token,
        isLoadingCredits,
        login,
        register,
        logout,
        refreshCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
