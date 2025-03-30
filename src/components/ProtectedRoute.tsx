import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCookie } from '../utils/cookies';
import { isTokenExpired } from '../utils/jwt';

const ProtectedRoute: React.FC = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const cookieToken = getCookie('auth_token');
  const localStorageToken = localStorage.getItem('token');

  // Check if we have a token in both AuthContext and storage
  const hasValidToken = token && 
    ((cookieToken && !isTokenExpired(cookieToken)) || 
     (localStorageToken && !isTokenExpired(localStorageToken)));

  // Redirect to login if not authenticated
  if (!user || !hasValidToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 