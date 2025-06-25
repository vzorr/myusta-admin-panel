// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, LOGIN_CREDENTIALS } from '../utils/constants';
import { LogIn, Eye, EyeOff, TestTube, Database, Server, Settings, Shield } from 'lucide-react';
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-xl transform rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-28 h-28 border-2 border-white rounded-xl transform -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-lg"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Welcome</h1>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            to {APP_CONFIG.APP_NAME} - Welcome to Myusta Admin Panel - your powerful command center for the ultimate service ecosystem. Seamlessly manage Usta onboarding, elevate customer experiences, optimize service delivery, and unlock actionable insights. Transform how you control users, services, bookings, and operations from one intelligent hub.
          </p>
          
          {/* Illustration Icons */}
          <div className="flex items-center space-x-8 mt-12">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Database className="w-12 h-12 text-white" />
            </div>
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Server className="w-12 h-12 text-white" />
            </div>
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Settings className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">adminPanel</h2>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Login Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 ml-2 text-xl leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Test Result Display */}
            {testResult && (
              <div className={`mb-6 rounded-xl p-4 border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    testResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      testResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {testResult.success ? '✓' : '!'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-semibold ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      API Test {testResult.success ? 'Successful' : 'Failed'}
                    </h3>
                    <div className="mt-2">
                      <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto max-h-32 font-mono">
                        {JSON.stringify(testResult.success ? testResult.data : { error: testResult.error }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={LOGIN_CREDENTIALS.emailOrPhone}
                readOnly
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 font-medium"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showCredentials ? "text" : "password"}
                  value={LOGIN_CREDENTIALS.password}
                  readOnly
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 font-medium"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showCredentials ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mb-4"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3" />
                  Log in
                </>
              )}
            </button>

            {/* Test API Button */}
            <button
              onClick={handleTestLogin}
              disabled={testMode || isLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium border border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {testMode ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-2"></div>
                  Testing API Connection...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test API Connection
                </>
              )}
            </button>

            {/* Login Configuration Collapsible */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  <span>Login Configuration</span>
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Role:</span>
                    <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded capitalize text-xs">
                      {LOGIN_CREDENTIALS.role}
                    </span>
                  </div>
                  <div className="py-2">
                    <div className="text-gray-600 font-medium mb-2">API Endpoint:</div>
                    <div className="font-mono text-gray-900 bg-white p-2 rounded text-xs break-all">
                      {process.env.REACT_APP_MYUSTA_BACKEND_URL}/api/auth/login
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* Debug Information */}
            {APP_CONFIG.DEBUG && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-amber-600 text-xs font-bold">D</span>
                  </div>
                  <h4 className="text-sm font-semibold text-amber-800">Debug Mode Active</h4>
                </div>
                <div className="text-sm text-amber-700 space-y-1 ml-7">
                  <div>Environment: <span className="font-mono bg-amber-100 px-1 rounded">{process.env.NODE_ENV}</span></div>
                  <div>Check browser console for detailed logs</div>
                  <div>Backend URL: <span className="font-mono text-xs break-all">{process.env.REACT_APP_MYUSTA_BACKEND_URL}</span></div>
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
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs mt-2">
              <Shield className="w-3 h-3" />
              <span>Secure admin access</span>
              <span>•</span>
              <span>Database management system</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;