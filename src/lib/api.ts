const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const authAPI = {
  getChallenge: (address: string) =>
    apiCall(`/api/v1/auth/challenge?address=${address}`),

  verify: (payload: any) =>
    apiCall('/api/v1/auth/verify', { method: 'POST', body: JSON.stringify(payload) }),

  logout: () =>
    apiCall('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({}) }),

  recover: (payload: any) =>
    apiCall('/api/v1/auth/recover', { method: 'POST', body: JSON.stringify(payload) }),
};

export const userAPI = {
  getMe: () =>
    apiCall('/api/v1/users/me'),

  updateProfile: (data: any) =>
    apiCall('/api/v1/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updateSecurity: (data: any) =>
    apiCall('/api/v1/users/security', { method: 'PUT', body: JSON.stringify(data) }),
};

export const walletAPI = {
  getBalance: () =>
    apiCall('/api/v1/wallet/balance'),

  getHistory: () =>
    apiCall('/api/v1/wallet/history'),

  sendToken: (data: unknown) =>
    apiCall('/api/v1/wallet/send', { method: 'POST', body: JSON.stringify(data) }),

  confirmSend: (data: unknown) =>
    apiCall('/api/v1/wallet/confirm-send', { method: 'POST', body: JSON.stringify(data) }),

  saveContact: (data: unknown) =>
    apiCall('/api/v1/wallet/contacts', { method: 'POST', body: JSON.stringify(data) }),

  getContacts: () =>
    apiCall('/api/v1/wallet/contacts'),
};