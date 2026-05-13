import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// Configure axios defaults
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('cancer_app_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cancer_app_token');
      localStorage.removeItem('cancer_app_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('cancer_app_token');
    const storedUser = localStorage.getItem('cancer_app_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('cancer_app_user');
      }
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const { data } = await axios.post(`${API_BASE}/auth/register`, userData);
      
      if (data.success) {
        localStorage.setItem('cancer_app_token', data.token);
        localStorage.setItem('cancer_app_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      const errors = err.response?.data?.errors;
      setError(message);
      return { success: false, message, errors };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
      
      if (data.success) {
        localStorage.setItem('cancer_app_token', data.token);
        localStorage.setItem('cancer_app_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cancer_app_token');
    localStorage.removeItem('cancer_app_user');
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      clearError,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
