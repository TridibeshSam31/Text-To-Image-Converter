import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, BackendStatus } from '../types';
import {
  loginApi,
  registerApi,
  fetchCreditsApi,
  checkBackendHealth,
  getApiBaseUrl,
  setApiBaseUrl,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  credits: number | null;
  isAuthenticated: boolean;
  isLoadingCredits: boolean;
  backendStatus: BackendStatus;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshCredits: () => Promise<void>;
  checkServerHealth: () => Promise<void>;
  updateApiBaseUrl: (url: string) => void;
  currentBaseUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'imagify_auth_token';
const USER_KEY = 'imagify_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(false);
  const [currentBaseUrl, setCurrentBaseUrl] = useState<string>(getApiBaseUrl());
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isChecking: true,
    isOnline: false,
    message: 'Checking backend status...',
  });

  const checkServerHealth = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, isChecking: true }));
    const result = await checkBackendHealth();
    setBackendStatus({
      isChecking: false,
      isOnline: result.isOnline,
      message: result.message,
      lastChecked: Date.now(),
    });
  }, []);

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
        if (res.user?.name && user) {
          const updatedUser = { ...user, name: res.user.name, creditBalance: res.credits };
          setUser(updatedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
      }
    } catch {
      // Keep existing credits state on fetch failure
    } finally {
      setIsLoadingCredits(false);
    }
  }, [token, user]);

  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, [checkServerHealth]);

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

  const updateApiBaseUrl = (url: string) => {
    setApiBaseUrl(url);
    setCurrentBaseUrl(url);
    checkServerHealth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        credits,
        isAuthenticated: !!token,
        isLoadingCredits,
        backendStatus,
        login,
        register,
        logout,
        refreshCredits,
        checkServerHealth,
        updateApiBaseUrl,
        currentBaseUrl,
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
