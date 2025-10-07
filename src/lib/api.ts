// API utility functions for authenticated requests

const API_KEY_STORAGE_KEY = 'gatewayz_api_key';
const USER_DATA_STORAGE_KEY = 'gatewayz_user_data';

export interface AuthResponse {
  success: boolean;
  message: string;
  user_id: number;
  api_key: string;
  auth_method: string;
  privy_user_id: string;
  is_new_user: boolean;
  display_name: string;
  email: string;
  credits: number;
  timestamp: string | null;
}

export interface UserData {
  user_id: number;
  api_key: string;
  auth_method: string;
  privy_user_id: string;
  display_name: string;
  email: string;
  credits: number;
}

// API Key Management
export const saveApiKey = (apiKey: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  }
};

export const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    console.log('Retrieving API key from localStorage:', {
      found: !!apiKey,
      preview: apiKey ? `${apiKey.substring(0, 10)}...` : 'None',
      storage_key: API_KEY_STORAGE_KEY
    });
    return apiKey;
  }
  console.log('getApiKey called on server side, returning null');
  return null;
};

export const removeApiKey = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_STORAGE_KEY);
  }
};

// User Data Management
export const saveUserData = (userData: UserData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userData));
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_DATA_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

// Authenticated API Request Helper
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. User must be authenticated.');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(endpoint, requestOptions);
};

// Process authentication response
export const processAuthResponse = (response: AuthResponse): void => {
  console.log('Processing auth response:', {
    success: response.success,
    has_api_key: !!response.api_key,
    api_key_preview: response.api_key ? `${response.api_key.substring(0, 10)}...` : 'None'
  });
  
  if (response.success && response.api_key) {
    saveApiKey(response.api_key);
    console.log('API key saved to localStorage');
    
    // Convert credits to integer to match backend expectations
    const creditsAsInteger = Math.floor(response.credits);
    
    const userData: UserData = {
      user_id: response.user_id,
      api_key: response.api_key,
      auth_method: response.auth_method,
      privy_user_id: response.privy_user_id,
      display_name: response.display_name,
      email: response.email,
      credits: creditsAsInteger,
    };
    
    saveUserData(userData);
    console.log('User data saved to localStorage');
    
    console.log('User authenticated successfully:', {
      user_id: response.user_id,
      display_name: response.display_name,
      credits: creditsAsInteger,
      original_credits: response.credits,
      is_new_user: response.is_new_user
    });
  } else {
    console.warn('Authentication response invalid:', {
      success: response.success,
      has_api_key: !!response.api_key
    });
  }
};
