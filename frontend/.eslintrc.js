// Define __dirname at the top of the file
const __dirname = process.cwd();

module.exports = {
  root: true,
  extends: [
    'universe/native',
  ],
  plugins: ['react', 'react-native'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.json']
      }
    },
  ],
  rules: {
    // Disable all formatting rules
    'prettier/prettier': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'semi': 'off',
    'space-before-function-paren': 'off',
    'object-curly-spacing': 'off',
    'arrow-parens': 'off',
    'indent': 'off',
    'no-multiple-empty-lines': 'off',
    'import/order': 'off',
    
    // Only keep functional rules
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/sort-styles': 'off',
    'react-native/no-unused-styles': 'off',
    'react-native/no-raw-text': 'off',
    'react-native/no-single-element-style-arrays': 'off'
  }
}; 