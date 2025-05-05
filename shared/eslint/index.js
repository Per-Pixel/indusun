/**
 * Shared ESLint configuration for both main and admin applications
 */

module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Add any shared rules here
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    '@next/next/no-img-element': 'off',
  },
  // You can add overrides for specific file patterns
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // TypeScript-specific rules
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};
