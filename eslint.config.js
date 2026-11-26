import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default [
  { ignores: ['playwright-report/', 'test-results/'] },
  js.configs.recommended,
  { languageOptions: { globals: globals.node } },
  { ...playwright.configs['flat/recommended'], files: ['tests/**/*.js'] },
  {
    files: ['tests/**/*.js'],
    // customerTest (fixtures) is a test function too; expect* helpers assert.
    settings: { playwright: { globalAliases: { test: ['customerTest'] } } },
    rules: { 'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect'] }] },
  },
  {
    files: ['pages/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['**/services/**', '**/fixtures/**', '**/tests/**'] },
      ],
    },
  },
];
