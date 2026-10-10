import type { AuthResponse, CreditsResponse, GenerateImageResponse } from '../types';

const DEFAULT_BASE_URL = 'http://localhost:4000';

export const getApiBaseUrl = (): string => {
  return localStorage.getItem('imagify_api_base_url') || import.meta.env.VITE_API_URL || DEFAULT_BASE_URL;
};

export const setApiBaseUrl = (url: string): void => {
  const sanitized = url.trim().replace(/\/+$/, '');
  localStorage.setItem('imagify_api_base_url', sanitized);
};

export const checkBackendHealth = async (): Promise<{ isOnline: boolean; message: string }> => {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const text = await response.text();
      return { isOnline: true, message: text.trim() || 'API Connected' };
    }
    return { isOnline: false, message: `HTTP ${response.status}: ${response.statusText}` };
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      return { isOnline: false, message: 'Connection timed out (backend not responding)' };
    }
    return { isOnline: false, message: error.message || 'Cannot reach backend server' };
  }
};

export const registerApi = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const error = err as Error;
    return {
      sucess: false,
      message: error.message || 'Failed to connect to registration service',
    };
  }
};

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const error = err as Error;
    return {
      sucess: false,
      message: error.message || 'Failed to connect to authentication service',
    };
  }
};

export const fetchCreditsApi = async (token: string, userId?: string): Promise<CreditsResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      token: token,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${baseUrl}/api/users/credits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId: userId || '' }),
    });

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const error = err as Error;
    return {
      sucess: false,
      message: error.message || 'Failed to retrieve credit balance',
    };
  }
};

export const generateImageApi = async (
  prompt: string,
  token: string,
  userId?: string
): Promise<GenerateImageResponse> => {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  // Image synthesis can take 15-30s on external APIs like Clipdrop
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      token: token,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${baseUrl}/api/image/generate-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        userId: userId || '',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as Error;
    if (error.name === 'AbortError') {
      return {
        sucess: false,
        message:
          'Image generation request timed out after 60 seconds. Note: the existing backend imageController currently omits res.json() on successful generation, which causes requests to hang.',
      };
    }
    return {
      sucess: false,
      message: error.message || 'Failed to communicate with image generation endpoint',
    };
  }
};
