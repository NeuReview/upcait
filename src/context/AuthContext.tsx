import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

// Create a context for authentication
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  otpPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, otpPending } = useAuthStore();
  
  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    otpPending
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 