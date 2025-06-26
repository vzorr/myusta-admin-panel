module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Suppress common warnings
    'no-console': 'off',
    'quotes': 'off', 
    'comma-dangle': 'off',
    'object-shorthand': 'off',
    'prefer-template': 'off',
    'import/order': 'off',
    'import/no-anonymous-default-export': 'off',
    'indent': 'off',
    
    // Suppress unused variable/import warnings
    'no-unused-vars': 'off', // Completely disable unused vars warnings
    'react/jsx-no-undef': 'error', // Keep undefined component errors
    'react-hooks/exhaustive-deps': 'off', // Disable dependency array warnings
    'react-hooks/rules-of-hooks': 'error' // Keep hook rules violations as errors
  }
};