// src/services/authService.js - Updated to use environment variables directly
import { API_ENDPOINTS, LOGIN_CREDENTIALS, APP_CONFIG } from '../utils/constants';
import { URL_MAPPINGS } from '../config/urlMappings';

class AuthService {
  constructor() {
    // Get base URL from environment variables
    this.baseUrl = URL_MAPPINGS.base.myusta; // Uses REACT_APP_MYUSTA_BACKEND_URL
    console.log('🏗️ AuthService initialized with baseUrl:', this.baseUrl);
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
      body: loginData,
      timeout: 10000 // 10 second timeout for login
    };

    // Use the URL_MAPPINGS helper for login endpoint
    const url = URL_MAPPINGS.myusta.auth.login();
    console.log('🔗 Login URL:', url);
    console.log('🌐 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      MYUSTA_BACKEND: process.env.REACT_APP_MYUSTA_BACKEND_URL,
      CHAT_BACKEND: process.env.REACT_APP_CHAT_BACKEND_URL
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    config.signal = controller.signal;

    try {
      console.log('🚀 Attempting login to:', url);
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login failed with status:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('📥 Login response received:', { success: responseData.success, hasResult: !!responseData.result });

      if (responseData.success && responseData.result) {
        const { result } = responseData;
        const token = result.token;
        
        if (token) {
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

          console.log('✅ Login successful for user:', user.email);
          return {
            success: true,
            user: user,
            token: token,
            data: responseData
          };
        } else {
          console.error('❌ No token in response');
          return {
            success: false,
            error: 'No token received from server'
          };
        }
      } else {
        console.error('❌ Login failed:', responseData.message);
        return {
          success: false,
          error: responseData.message || 'Login failed'
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Login error:', error);
      
      let errorMessage = error.message;
      
      if (error.name === 'AbortError') {
        errorMessage = 'Login timeout: Request took too long to complete';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = `Network error: Unable to connect to MyUsta backend at ${url}. 
        
Please check:
1. Backend server is running on ${this.baseUrl}
2. CORS is properly configured 
3. Environment variable REACT_APP_MYUSTA_BACKEND_URL=${process.env.REACT_APP_MYUSTA_BACKEND_URL}`;
      } else if (error.message.includes('CORS')) {
        errorMessage = `CORS error: The MyUsta backend at ${url} needs to allow requests from this domain.`;
      } else if (error.message.includes('TypeError')) {
        errorMessage = 'Network error: Please check your internet connection and try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

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

        const url = URL_MAPPINGS.myusta.auth.logout();
        console.log('🔗 Logout URL:', url);
        
        try {
          const response = await fetch(url, config);
          if (response.ok) {
            console.log('✅ Logout successful');
          } else {
            console.warn('⚠️ Logout endpoint returned:', response.status);
          }
        } catch (error) {
          console.warn('⚠️ Logout endpoint failed:', error.message);
        }
      }
      
      this.clearToken();
      this.clearUserData();
      console.log('🧹 Local auth data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
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

    const url = URL_MAPPINGS.myusta.auth.refresh();
    console.log('🔄 Token refresh URL:', url);

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      if (response.ok && responseData.success && responseData.result?.token) {
        const newToken = responseData.result.token;
        this.storeToken(newToken);
        console.log('✅ Token refreshed successfully');
        return {
          success: true,
          token: newToken
        };
      }
      
      console.warn('⚠️ Token refresh failed:', responseData.message);
      return {
        success: false,
        error: responseData.message || 'Token refresh failed'
      };
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateToken(token) {
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      console.log('🕒 Token is expired');
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

    const url = URL_MAPPINGS.myusta.auth.validate();

    try {
      const response = await fetch(url, config);
      const isValid = response.ok;
      console.log(isValid ? '✅ Token is valid' : '❌ Token validation failed');
      return isValid;
    } catch (error) {
      console.warn('⚠️ Token validation failed:', error);
      return false;
    }
  }

  storeToken(token) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
      console.log('💾 Token stored');
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
      console.log('🗑️ Token cleared');
    }
  }

  storeUserData(userData) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('💾 User data stored');
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
      console.log('🗑️ User data cleared');
    }
  }

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < currentTime;
        
        if (isExpired) {
          console.log('🕒 Token expired at:', new Date(payload.exp * 1000));
        }
        
        return isExpired;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Error checking token expiration:', error);
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
      console.warn('⚠️ Error parsing token:', error);
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

    try {
      const url = URL_MAPPINGS.myusta.auth.login();
      console.log('🧪 Test login URL:', url);
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      console.log('🧪 Test login result:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Test login failed:', error);
      throw error;
    }
  }

  getAuthHeader() {
    const token = this.getStoredToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Helper method to get current backend URL
  getBackendUrl() {
    return this.baseUrl;
  }

  // Helper method to check environment configuration
  checkEnvironmentConfig() {
    console.group('🔧 AuthService Environment Configuration');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_MYUSTA_BACKEND_URL:', process.env.REACT_APP_MYUSTA_BACKEND_URL);
    console.log('REACT_APP_CHAT_BACKEND_URL:', process.env.REACT_APP_CHAT_BACKEND_URL);
    console.log('Resolved MyUsta URL:', this.baseUrl);
    console.log('Login endpoint:', URL_MAPPINGS.myusta.auth.login());
    console.groupEnd();
  }
}

export default new AuthService();