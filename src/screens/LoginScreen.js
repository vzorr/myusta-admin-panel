// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, LOGIN_CREDENTIALS } from '../utils/constants';
import { LogIn, Eye, EyeOff, TestTube } from 'lucide-react';
import AuthService from '../services/authService';

const LoginScreen = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showCredentials, setShowCredentials] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleLogin = async () => {
    clearError();
    setTestResult(null);
    
    const result = await login();
    
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
  };

  const handleTestLogin = async () => {
    setTestMode(true);
    setTestResult(null);
    clearError();
    
    try {
      const result = await AuthService.testLogin();
      setTestResult({
        success: true,
        data: result
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setTestMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {APP_CONFIG.APP_NAME}
          </h1>
          <p className="text-gray-600">
            Database Administration Portal
          </p>
        </div>

        {/* Login Configuration Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Login Configuration</h3>
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-mono text-gray-700">
                {showCredentials ? LOGIN_CREDENTIALS.emailOrPhone : '***@***.***'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Password:</span>
              <span className="font-mono text-gray-700">
                {showCredentials ? LOGIN_CREDENTIALS.password : '***********'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role:</span>
              <span className="font-mono text-gray-700">{LOGIN_CREDENTIALS.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Endpoint:</span>
              <span className="font-mono text-gray-700 truncate">
                {process.env.REACT_APP_MYUSTA_BACKEND_URL}/api/auth/login
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Result Display */}
        {testResult && (
          <div className={`mb-6 p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {testResult.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  API Test {testResult.success ? 'Successful' : 'Failed'}
                </h3>
                <div className="mt-2">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testResult.success ? testResult.data : { error: testResult.error }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In to Admin Panel
              </div>
            )}
          </button>

          <button
            onClick={handleTestLogin}
            disabled={testMode || isLoading}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testMode ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Testing API...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <TestTube className="w-4 h-4 mr-2" />
                Test API Connection
              </div>
            )}
          </button>
        </div>

        {/* Debug Information */}
        {APP_CONFIG.DEBUG && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-xs font-medium text-yellow-800 mb-2">Debug Mode Active</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Check browser console for detailed logs</div>
              <div>Environment: {process.env.NODE_ENV}</div>
              <div>Backend URL: {process.env.REACT_APP_MYUSTA_BACKEND_URL}</div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure admin access • Database management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;