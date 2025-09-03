'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { enterpriseApiClient } from '../lib/api/enterprise-api-client';
import type { User, RegisterRequest } from '../lib/api';

// 1. Define the context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  createGuestAccount: () => Promise<void>;
  logout: () => void;
}

// 2. Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider Props interface
interface AuthProviderProps {
  children: ReactNode;
}

// 4. AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 5. Load user on app start (if token exists)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = apiClient.getToken();
        if (token) {
          // Sync existing token to enterprise API client
          // 同步现有token到企业API客户端
          enterpriseApiClient.setAuthTokens({
            accessToken: token,
            tokenType: 'Bearer'
          });
          
          // Token exists, try to get user profile
          const userData = await apiClient.getProfile();
          setUser(userData);
        }
      } catch (error) {
        // Token invalid or expired, clear it
        apiClient.logout();
        enterpriseApiClient.clearAuthTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // 6. Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      setUser(response.user);
      
      // Sync token to enterprise API client for questions API
      // 同步token到企业API客户端用于问题API
      const token = apiClient.getToken();
      if (token) {
        enterpriseApiClient.setAuthTokens({
          accessToken: token,
          tokenType: 'Bearer'
        });
      }
    } catch (error) {
      throw error; // Let the component handle the error
    }
  };

  // 7. Register function
  const register = async (email: string, password: string, name?: string) => {
    try {
      const requestData: RegisterRequest = { email, password };
      if (name) {
        requestData.name = name;
      }
      const userData = await apiClient.register(requestData);
      // After registration, automatically log them in
      await login(email, password);
      
      // Token sync is handled in login function
      // token同步在login函数中处理
    } catch (error) {
      throw error; // Let the component handle the error
    }
  };

  // 8. Create guest account function
  const createGuestAccount = async () => {
    try {
      const response = await apiClient.createGuestAccount();
      setUser(response.user);
      
      // Sync token to enterprise API client for questions API
      // 同步token到企业API客户端用于问题API
      const token = apiClient.getToken();
      if (token) {
        enterpriseApiClient.setAuthTokens({
          accessToken: token,
          tokenType: 'Bearer'
        });
      }
      // Guest credentials are available in response.guestCredentials if needed
    } catch (error) {
      throw error; // Let the component handle the error
    }
  };

  // 9. Logout function
  const logout = () => {
    apiClient.logout();
    enterpriseApiClient.clearAuthTokens(); // Clear enterprise API client tokens too
    setUser(null);
  };

  // 10. Context value
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    createGuestAccount,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 10. Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
