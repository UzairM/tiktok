const path = require('path');

module.exports = {
  root: true,
  extends: ['universe/native', 'universe/shared/typescript-analysis'],
  plugins: ['react', 'react-native', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: ['./tsconfig.json', './frontend/tsconfig.json']
      },
      extends: ['plugin:@typescript-eslint/recommended'],
    },
  ],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/sort-styles': 'off',
    'react-native/no-unused-styles': 'warn',
    'react-native/no-raw-text': ['warn', { skip: ['Button'] }],
    'react-native/no-single-element-style-arrays': 'warn',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }]
  },
}; 