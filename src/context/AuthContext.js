// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false,
        error: action.payload.error
      };
    case 'LOGOUT':
      return {
        ...initialState
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app start
    const initializeAuth = async () => {
      const storedToken = AuthService.getStoredToken();
      
      if (storedToken && !AuthService.isTokenExpired(storedToken)) {
        const isValid = await AuthService.validateToken(storedToken);
        
        if (isValid) {
          dispatch({
            type: 'SET_TOKEN',
            payload: { token: storedToken }
          });
        } else {
          AuthService.clearToken();
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const result = await AuthService.login(credentials);
      
      if (result.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: result.user,
            token: result.token
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: { error: result.error }
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      dispatch({ type: 'LOGOUT' });
      return { success: true };
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
      return { success: true };
    }
  };

  const refreshToken = async () => {
    try {
      const result = await AuthService.refreshToken();
      
      if (result.success) {
        dispatch({
          type: 'SET_TOKEN',
          payload: { token: result.token }
        });
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;