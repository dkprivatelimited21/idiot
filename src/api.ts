// src/api.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const register = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

export const saveMemory = async (token: string, input: string, response: string) => {
  const res = await fetch(`${API_URL}/api/learn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ input, response })
  });
  return res.json();
};

export const loadMemory = async (token: string) => {
  const res = await fetch(`${API_URL}/api/recall`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const synthesizeSpeech = async (token: string, text: string) => {
  const res = await fetch(`${API_URL}/api/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
  return res.json();
};