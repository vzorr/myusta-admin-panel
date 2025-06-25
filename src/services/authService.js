// src/services/authService.js
import { API_ENDPOINTS, LOGIN_CREDENTIALS, APP_CONFIG } from '../utils/constants';

class AuthService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.MYUSTA_BACKEND;
  }

  async login(credentials = LOGIN_CREDENTIALS) {
    const loginData = JSON.stringify({
      "emailOrPhone": credentials.emailOrPhone,
      "password": credentials.password,
      "role": credentials.role
    });

    const config = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: loginData
    };

    if (APP_CONFIG.DEBUG) {
      console.log('Login request:', {
        url: `${this.baseUrl}/api/auth/login`,
        data: JSON.parse(loginData),
        config
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, config);
      const responseData = await response.json();

      if (APP_CONFIG.DEBUG) {
        console.log('Login response:', JSON.stringify(responseData));
      }

      if (response.ok) {
        // Handle different response formats
        const token = responseData.token || responseData.access_token || responseData.accessToken;
        const user = responseData.user || responseData.data?.user || {
          email: credentials.emailOrPhone,
          role: credentials.role,
          name: responseData.name || responseData.username || credentials.emailOrPhone.split('@')[0]
        };

        if (token) {
          this.storeToken(token);
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
          error: responseData.message || responseData.error || `HTTP Error: ${response.status}`
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  async logout() {
    try {
      // Optional: Call logout endpoint if available
      if (this.getStoredToken()) {
        const config = {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getStoredToken()}`
          }
        };

        try {
          await fetch(`${this.baseUrl}/api/auth/logout`, config);
        } catch (error) {
          // Continue with logout even if server call fails
          console.warn('Logout endpoint failed:', error);
        }
      }
      
      this.clearToken();
      return { success: true };
    } catch (error) {
      // Clear token anyway
      this.clearToken();
      return { success: true };
    }
  }

  async refreshToken() {
    const token = this.getStoredToken();
    if (!token) return { success: false, error: 'No token found' };

    const config = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, config);
      const responseData = await response.json();
      
      if (response.ok && (responseData.token || responseData.access_token)) {
        const newToken = responseData.token || responseData.access_token;
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

    // Check if token is expired first
    if (this.isTokenExpired(token)) {
      return false;
    }

    const config = {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, config);
      return response.ok;
    } catch (error) {
      console.warn('Token validation failed:', error);
      return false;
    }
  }

  storeToken(token) {
    localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
    if (APP_CONFIG.DEBUG) {
      console.log('Token stored:', token.substring(0, 20) + '...');
    }
  }

  getStoredToken() {
    return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    if (APP_CONFIG.DEBUG) {
      console.log('Token cleared');
    }
  }

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Handle JWT tokens
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp && payload.exp < currentTime;
      }
      
      // For non-JWT tokens, assume they're valid
      return false;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return false; // Assume valid if we can't parse
    }
  }

  // Get user info from stored token
  getUserFromToken(token = null) {
    const tokenToUse = token || this.getStoredToken();
    if (!tokenToUse) return null;

    try {
      const parts = tokenToUse.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          id: payload.sub || payload.userId || payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name || payload.username
        };
      }
    } catch (error) {
      console.warn('Error parsing token:', error);
    }
    
    return null;
  }

  // Test the exact login configuration you provided
  async testLogin() {
    const data = JSON.stringify({
      "emailOrPhone": "amirsohail680@gmail.com",
      "password": "Password123@",
      "role": "customer"
    });

    const config = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: data
    };

    console.log('Testing login with exact configuration...');
    
    try {
      const response = await fetch('https://myusta.al/myusta-backend/api/auth/login', config);
      const responseData = await response.json();
      
      console.log('Test login response:', JSON.stringify(responseData));
      return responseData;
    } catch (error) {
      console.error('Test login error:', error);
      throw error;
    }
  }
}

export default new AuthService();