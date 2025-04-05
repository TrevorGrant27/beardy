module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Make sure this is last
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'error', // Show Prettier errors as ESLint errors
    'react/react-in-jsx-scope': 'off', // Not needed with newer React/JSX transform
    'react/prop-types': 'off', // We use TypeScript for type checking
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow implicit return types
    // Add any project-specific rules here
  },
};
