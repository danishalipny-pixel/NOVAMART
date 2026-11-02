import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('novamart_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('novamart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'become-seller'

  // Sync token and user to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('novamart_token', token);
    } else {
      localStorage.removeItem('novamart_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('novamart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('novamart_user');
    }
  }, [user]);

  // Verify and refresh session on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('novamart_token');
      if (!storedToken) return;

      try {
        const response = await authApi.getMe();
        if (response && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        // If token expired or invalid, reset credentials
        if (err.status === 401) {
          setToken(null);
          setUser(null);
        }
      }
    };

    verifySession();
  }, []);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const { user: userData, tokens } = response.data;

      setToken(tokens.accessToken);
      setUser(userData);
      closeAuthModal();
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      const { user: newUser, tokens } = response.data;

      setToken(tokens.accessToken);
      setUser(newUser);
      closeAuthModal();
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const becomeSeller = async (storeData) => {
    setIsLoading(true);
    try {
      const response = await authApi.becomeSeller(storeData);
      const { user: updatedUser, tokens } = response.data;

      setToken(tokens.accessToken);
      setUser(updatedUser);
      closeAuthModal();
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('novamart_token');
      localStorage.removeItem('novamart_user');
    }
  };

  const value = {
    user,
    setUser,
    token,
    isAuthenticated: Boolean(user && token),
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    isLoading,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    becomeSeller,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from './useAuth';
export default AuthContext;
