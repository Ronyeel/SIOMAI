import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '../services/authService';

const SESSION_KEY = 'siomai_user_session';

export const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      setUser(response.user);
      // Persist session to SecureStore
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.email) throw new Error('No user session.');
    const refreshed = await AuthService.updateProfile(user.email, updates);
    const updatedUser = { ...user, ...refreshed };
    setUser(updatedUser);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

