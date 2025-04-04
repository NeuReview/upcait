import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRoute: React.FC = () => {
  const { isAuthenticated, loading, otpPending } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (otpPending) {
    return <Navigate to="/otp" replace />;
  }
  
  return <Outlet />;
};

export default AuthRoute; 