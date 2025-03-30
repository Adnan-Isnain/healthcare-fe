import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { removeCookie, getCookie, setCookie } from '../utils/cookies';
import { isTokenExpired, getTokenExpirationTime } from '../utils/jwt';
import { AuthState } from '../types/auth';
import { User } from '../types/user';
import { useLogin } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

const initialState: AuthState = {
  user: null,
  token: getCookie('auth_token'),
  isLoading: false,
  error: null,
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_TOKEN'; payload: string | null };

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
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { login: loginApi } = useLogin();

  // Check token validity on mount and token changes
  useEffect(() => {
    const token = getCookie('auth_token');
    if (token) {
      if (isTokenExpired(token)) {
        removeCookie('auth_token');
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      } else if (!state.token) {
        dispatch({ type: 'SET_TOKEN', payload: token });
      }
    }
  }, [state.token]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const data = await loginApi(email, password);
      
      // Store token in both cookie and localStorage
      if (data.token) {
        const expirationTime = getTokenExpirationTime(data.token);
        setCookie('auth_token', data.token, expirationTime);
        localStorage.setItem('token', data.token);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: {
            id: data.id || 0,
            name: data.name || 'User',
            email: data.email || email,
            role: data.role || 'USER',
            permissions: data.permissions || []
          }, 
          token: data.token 
        },
      });
      
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
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const setToken = (token: string | null) => {
    if (token) {
      const expirationTime = getTokenExpirationTime(token);
      setCookie('auth_token', token, expirationTime);
      localStorage.setItem('token', token);
    } else {
      removeCookie('auth_token');
      localStorage.removeItem('token');
    }
    dispatch({ type: 'SET_TOKEN', payload: token });
  };

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