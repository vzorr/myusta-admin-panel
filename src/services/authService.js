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
      mode: 'cors', // Explicitly set CORS mode
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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

  async logout() {
    try {
      const token = this.getStoredToken();
      
      if (token) {
        // Optional: Call logout endpoint if available
        const config = {
          method: 'POST',
          mode: 'cors',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        try {
          await fetch(`${this.baseUrl}/api/auth/logout`, config);
        } catch (error) {
          console.warn('Logout endpoint failed:', error);
        }
      }
      
      this.clearToken();
      this.clearUserData();
      return { success: true };
    } catch (error) {
      // Clear token anyway
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

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, config);
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

    // Check if token is expired first
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

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, config);
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

  // User data management methods
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

  // Get user info from stored token
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

  // Test the exact login configuration
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
      const response = await fetch('https://myusta.al/myusta-backend/api/auth/login', config);
      const responseData = await response.json();
      
      console.log('Test login response:', JSON.stringify(responseData, null, 2));
      return responseData;
    } catch (error) {
      console.error('Test login error:', error);
      throw error;
    }
  }

  // Method to get authorization header for API calls
  getAuthHeader() {
    const token = this.getStoredToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default new AuthService();