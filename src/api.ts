// src/api.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    username: string;
  };
}

interface MemoryEntry {
  input: string;
  response: string;
  confidence?: number;
}

interface UserMemory {
  knowledge: MemoryEntry[];
  patterns: Array<{
    word: string;
    responses: string[];
  }>;
}

interface SpeechResponse {
  text: string;
  speech: {
    text: string;
    voice: string;
    rate: number;
    pitch: number;
  };
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }
  return response.json();
};

const setTokens = (tokens: { accessToken: string; refreshToken?: string }) => {
  accessToken = tokens.accessToken;
  if (tokens.refreshToken) {
    refreshToken = tokens.refreshToken;
    localStorage.setItem('jarvis_refresh_token', tokens.refreshToken);
  }
  localStorage.setItem('jarvis_token', tokens.accessToken);
};

export const register = async (
  username: string, 
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return handleResponse<AuthResponse>(response);
};

export const login = async (
  username: string, 
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await handleResponse<AuthResponse>(response);
  setTokens(data);
  return data;
};

const refreshAuthToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const { accessToken } = await handleResponse<{ accessToken: string }>(response);
    setTokens({ accessToken });
    return accessToken;
  } catch (err) {
    clearAuth();
    throw err;
  }
};

export const clearAuth = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('jarvis_token');
  localStorage.removeItem('jarvis_refresh_token');
};

export const initializeAuth = () => {
  const token = localStorage.getItem('jarvis_token');
  const refresh = localStorage.getItem('jarvis_refresh_token');
  if (token && refresh) {
    accessToken = token;
    refreshToken = refresh;
  }
};

export const authFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  let token = accessToken;
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401 && refreshToken) {
    if (!refreshPromise) {
      refreshPromise = refreshAuthToken().finally(() => {
        refreshPromise = null;
      });
    }
    token = await refreshPromise;
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return response;
};

export const saveMemory = async (
  input: string, 
  response: string
): Promise<void> => {
  const res = await authFetch(`${API_URL}/api/memory`, {
    method: 'POST',
    body: JSON.stringify({ input, response })
  });
  return handleResponse<void>(res);
};

export const loadMemory = async (): Promise<UserMemory> => {
  const res = await authFetch(`${API_URL}/api/memory`);
  return handleResponse<UserMemory>(res);
};

export const synthesizeSpeech = async (
  text: string
): Promise<SpeechResponse> => {
  const res = await authFetch(`${API_URL}/api/synthesize`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  return handleResponse<SpeechResponse>(res);
};

// Initialize auth tokens on app load
initializeAuth();