// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, LOGIN_CREDENTIALS } from '../utils/constants';
import { LogIn, Eye, EyeOff, TestTube, Database, Server, Shield, Settings } from 'lucide-react';
import AuthService from '../services/authService';

const LoginScreen = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showCredentials, setShowCredentials] = useState(false);
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-lg transform rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-28 h-28 border-2 border-white rounded-lg transform -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6">Welcome</h1>
          <p className="text-lg text-purple-100 mb-8 leading-relaxed">
            to {APP_CONFIG.APP_NAME} - the world's leading open-source 
            auto-generated admin panel for your Node.js application that allows you to manage all your 
            data in one place.
          </p>
          
          {/* Illustration Icons */}
          <div className="flex items-center space-x-8 mt-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Server className="w-10 h-10 text-white" />
            </div>
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">adminPanel</h2>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 ml-2 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Test Result Display */}
            {testResult && (
              <div className={`mb-6 rounded-lg p-4 border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    testResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-xs font-bold ${
                      testResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {testResult.success ? '✓' : '!'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      API Test {testResult.success ? 'Successful' : 'Failed'}
                    </h3>
                    <div className="mt-2">
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-32">
                        {JSON.stringify(testResult.success ? testResult.data : { error: testResult.error }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={LOGIN_CREDENTIALS.emailOrPhone}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Email"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showCredentials ? "text" : "password"}
                  value={LOGIN_CREDENTIALS.password}
                  readOnly
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCredentials ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Log in
                </>
              )}
            </button>

            {/* Test API Button */}
            <button
              onClick={handleTestLogin}
              disabled={testMode || isLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {testMode ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-2"></div>
                  Testing API...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test API Connection
                </>
              )}
            </button>

            {/* Login Configuration */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  <span>Login Configuration</span>
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-mono text-gray-900 capitalize">{LOGIN_CREDENTIALS.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endpoint:</span>
                    <span className="font-mono text-gray-900 text-xs break-all">
                      {process.env.REACT_APP_MYUSTA_BACKEND_URL}/api/auth/login
                    </span>
                  </div>
                </div>
              </details>
            </div>

            {/* Debug Information */}
            {APP_CONFIG.DEBUG && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-amber-600 text-xs font-bold">D</span>
                  </div>
                  <h4 className="text-sm font-semibold text-amber-800">Debug Mode</h4>
                </div>
                <div className="text-xs text-amber-700 space-y-1 ml-6">
                  <div>Environment: <span className="font-mono">{process.env.NODE_ENV}</span></div>
                  <div>Check browser console for logs</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <span>Made with</span>
              <span className="text-red-500">♥</span>
              <span>by Myusta Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;