
// src/services/authService.js - Simplified without logging code
import { API_ENDPOINTS, LOGIN_CREDENTIALS, APP_CONFIG } from '../utils/constants';

class AuthService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' ? '' : API_ENDPOINTS.MYUSTA_BACKEND;
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

    const url = this.baseUrl ? `${this.baseUrl}/api/auth/login` : '/api/auth/login';

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

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
      clearTimeout(timeoutId);
      let errorMessage = error.message;
      
      if (error.name === 'AbortError') {
        errorMessage = 'Login timeout: Request took too long to complete';
      } else if (error.message.includes('Failed to fetch')) {
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

  storeToken(token) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
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
    }
  }

  storeUserData(userData) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem('userData', JSON.stringify(userData));
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

    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/auth/login` : '/api/auth/login';
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  getAuthHeader() {
    const token = this.getStoredToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default new AuthService();