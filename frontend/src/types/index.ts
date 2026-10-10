export interface User {
  name: string;
  email?: string;
  creditBalance?: number;
}

export interface AuthResponse {
  sucess?: boolean;
  success?: boolean;
  message?: string;
  user?: {
    name: string;
  };
  token?: string;
}

export interface CreditsResponse {
  sucess?: boolean;
  success?: boolean;
  message?: string;
  credits?: number;
  user?: {
    name: string;
  };
}

export interface GenerateImageResponse {
  sucess?: boolean;
  success?: boolean;
  message?: string;
  resultImage?: string;
  creditBalance?: number;
  CreditBalance?: number;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  aspectRatio?: string;
}

export type CanvasState = 'empty' | 'loading' | 'success' | 'error';

export interface GenerationError {
  title: string;
  message: string;
  details?: string;
  statusCode?: number;
  isBackendDefect?: boolean;
}

export interface BackendStatus {
  isChecking: boolean;
  isOnline: boolean;
  message: string;
  lastChecked?: number;
}

export interface CreditPlan {
  id: 'Basic' | 'Advanced' | 'Business';
  name: string;
  credits: number;
  amount: number;
  description: string;
  badge?: string;
}

export interface RazorpayOrderResponse {
  sucess?: boolean;
  success?: boolean;
  message?: string;
  order?: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  key?: string;
}

export interface RazorpayVerifyResponse {
  sucess?: boolean;
  success?: boolean;
  message?: string;
  credits?: number;
}

