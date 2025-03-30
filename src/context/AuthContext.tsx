import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeCookie, getCookie, setCookie } from '../utils/cookies';
import { isTokenExpired, getTokenExpirationTime, decodeToken } from '../utils/jwt';
import { AuthState } from '../types/auth';
import { User, Role } from '../types/user';
import { useLogin } from '../services/api';
import { Spin } from 'antd';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { login: loginApi } = useLogin();
  const navigate = useNavigate();

  // Check token validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getCookie('auth_token');
        
        if (!token) {
          dispatch({ type: 'SET_LOADING', payload: false });
          navigate('/login', { replace: true });
          return;
        }

        if (isTokenExpired(token)) {
          // Token is expired, remove it and redirect to login
          removeCookie('auth_token');
          dispatch({ type: 'LOGOUT' });
          navigate('/login', { replace: true });
          return;
        }

        // Token is valid, decode and set user info
        const decoded = decodeToken(token);
        const userRole = Object.values(Role).includes(decoded.role as Role) ? decoded.role as Role : Role.STAFF;
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: {
              id: decoded.id || 0,
              name: decoded.name || 'User',
              email: decoded.email || '',
              role: userRole,
              permissions: decoded.permissions || []
            },
            token
          }
        });
        
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login', { replace: true });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const data = await loginApi(email, password);
      
      // Store token in cookie
      if (data.token) {
        const expirationTime = getTokenExpirationTime(data.token);
        setCookie('auth_token', data.token, expirationTime);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: {
            id: data.id || 0,
            name: data.name || 'User',
            email: data.email || email,
            role: data.role || Role.STAFF,
            permissions: data.permissions || []
          }, 
          token: data.token 
        },
      });

      navigate('/', { replace: true });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  const logout = () => {
    removeCookie('auth_token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  };

  const setToken = (token: string | null) => {
    if (token) {
      const expirationTime = getTokenExpirationTime(token);
      setCookie('auth_token', token, expirationTime);
    } else {
      removeCookie('auth_token');
    }
    dispatch({ type: 'SET_TOKEN', payload: token });
  };

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 