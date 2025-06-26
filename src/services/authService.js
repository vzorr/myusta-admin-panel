// src/services/authService.js - Fixed for proxy
import { API_ENDPOINTS, LOGIN_CREDENTIALS, APP_CONFIG } from '../utils/constants';

class AuthService {
  constructor() {
    // In development, use empty string for proxy. In production, use full URL
    this.baseUrl = process.env.NODE_ENV === 'development' ? '' : API_ENDPOINTS.MYUSTA_BACKEND;
    
    if (APP_CONFIG.DEBUG) {
      console.log('AuthService baseUrl:', this.baseUrl);
      console.log('Environment:', process.env.NODE_ENV);
    }
  }

  async login(credentials = LOGIN_CREDENTIALS) {
    const loginData = JSON.stringify({
      "emailOrPhone": credentials.emailOrPhone,
      "password": credentials.password,
      "role": credentials.role
    });

    const config = {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: loginData
    };

    // Construct URL - in development this will be '/api/auth/login', in production full URL
    const url = this.baseUrl ? `${this.baseUrl}/api/auth/login` : '/api/auth/login';

    if (APP_CONFIG.DEBUG) {
      console.log('Login request:', {
        url: url,
        data: JSON.parse(loginData),
        config,
        baseUrl: this.baseUrl
      });
    }

    try {
      const response = await fetch(url, config);
      
      if (APP_CONFIG.DEBUG) {
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      if (APP_CONFIG.DEBUG) {
        console.log('Login response:', JSON.stringify(responseData, null, 2));
      }

      // Handle the specific response format you provided
      if (responseData.success && responseData.result) {
        const { result } = responseData;
        const token = result.token;
        
        if (token) {
          // Store token and user data
          this.storeToken(token);
          this.storeUserData(result);
          
          const user = {
            id: result.userId,
            firstName: result.firstName,
            lastName: result.lastName,
            name: `${result.firstName} ${result.lastName}`,
            email: result.email,
            role: result.role
          };

          return {
            success: true,
            user: user,
            token: token,
            data: responseData
          };
        } else {
          return {
            success: false,
            error: 'No token received from server'
          };
        }
      } else {
        return {
          success: false,
          error: responseData.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = error.message;
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check if the server is running and CORS is properly configured.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: The server needs to allow requests from this domain.';
      } else if (error.message.includes('TypeError')) {
        errorMessage = 'Network error: Please check your internet connection and try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ... rest of your methods remain the same (logout, refreshToken, etc.)
  
  async logout() {
    try {
      const token = this.getStoredToken();
      
      if (token) {
        const config = {
          method: 'POST',
          mode: 'cors',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        const url = this.baseUrl ? `${this.baseUrl}/api/auth/logout` : '/api/auth/logout';
        
        try {
          await fetch(url, config);
        } catch (error) {
          console.warn('Logout endpoint failed:', error);
        }
      }
      
      this.clearToken();
      this.clearUserData();
      return { success: true };
    } catch (error) {
      this.clearToken();
      this.clearUserData();
      return { success: true };
    }
  }

  async refreshToken() {
    const token = this.getStoredToken();
    if (!token) return { success: false, error: 'No token found' };

    const config = {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    };

    const url = this.baseUrl ? `${this.baseUrl}/api/auth/refresh` : '/api/auth/refresh';

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      if (response.ok && responseData.success && responseData.result?.token) {
        const newToken = responseData.result.token;
        this.storeToken(newToken);
        return {
          success: true,
          token: newToken
        };
      }
      
      return {
        success: false,
        error: responseData.message || 'Token refresh failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateToken(token) {
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      return false;
    }

    const config = {
      method: 'GET',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const url = this.baseUrl ? `${this.baseUrl}/api/auth/validate` : '/api/auth/validate';

    try {
      const response = await fetch(url, config);
      return response.ok;
    } catch (error) {
      console.warn('Token validation failed:', error);
      return false;
    }
  }

  // Token management methods
  storeToken(token) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
      if (APP_CONFIG.DEBUG) {
        console.log('Token stored:', token.substring(0, 20) + '...');
      }
    }
  }

  getStoredToken() {
    if (typeof Storage !== "undefined") {
      return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    }
    return null;
  }

  clearToken() {
    if (typeof Storage !== "undefined") {
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      if (APP_CONFIG.DEBUG) {
        console.log('Token cleared');
      }
    }
  }

  storeUserData(userData) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem('userData', JSON.stringify(userData));
      if (APP_CONFIG.DEBUG) {
        console.log('User data stored:', userData);
      }
    }
  }

  getStoredUserData() {
    if (typeof Storage !== "undefined") {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  clearUserData() {
    if (typeof Storage !== "undefined") {
      localStorage.removeItem('userData');
      if (APP_CONFIG.DEBUG) {
        console.log('User data cleared');
      }
    }
  }

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp && payload.exp < currentTime;
      }
      
      return false;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return false;
    }
  }

  getUserFromToken(token = null) {
    const tokenToUse = token || this.getStoredToken();
    if (!tokenToUse) return null;

    try {
      const parts = tokenToUse.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name,
          phone: payload.phone
        };
      }
    } catch (error) {
      console.warn('Error parsing token:', error);
    }
    
    return null;
  }

  async testLogin() {
    const data = JSON.stringify({
      "emailOrPhone": "amirsohail680@gmail.com",
      "password": "Password123@",
      "role": "customer"
    });

    const config = {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: data
    };

    console.log('Testing login with exact configuration...');
    
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/auth/login` : '/api/auth/login';
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      console.log('Test login response:', JSON.stringify(responseData, null, 2));
      return responseData;
    } catch (error) {
      console.error('Test login error:', error);
      throw error;
    }
  }

  getAuthHeader() {
    const token = this.getStoredToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default new AuthService();