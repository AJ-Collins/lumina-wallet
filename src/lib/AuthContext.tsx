import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from './api';
import bs58 from 'bs58';

const isTokenExpired = (token?: string | null) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const payloadBase64 = parts[1];
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    const exp = payload.exp;
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !isTokenExpired(token)) {
      fetchUser();
    } else {
      if (token) localStorage.removeItem('authToken');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('Unauthorized event received, logging out...');
      localStorage.removeItem('authToken');
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await userAPI.getMe();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('authToken');
      setUser(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Full challenge → sign → verify login flow.
   *
   * @param {string}   address  - Base58 Solana public key
   * @param {Function} signFn   - async (messageBytes: Uint8Array) => Uint8Array (signature)
   */
  const login = async (address, signFn, platform = 'web') => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: fetch challenge from backend
      const { message, nonce } = await authAPI.getChallenge(address);

      // Step 2: sign the challenge with the wallet's private key
      const messageBytes = new TextEncoder().encode(message);

      console.log('=== FRONTEND DEBUG ===');
      console.log('message to sign:\n', message);
      console.log('nonce:', nonce);
      console.log('======================');

      const signatureBytes = await signFn(messageBytes);

      // Convert signature Uint8Array → hex string for the API
      const signature = bs58.encode(signatureBytes);

      // Step 3: verify signature with backend and receive JWT
      const response = await authAPI.verify({ address, signature, nonce, platform });
      localStorage.setItem('authToken', response.token);

      await fetchUser();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};