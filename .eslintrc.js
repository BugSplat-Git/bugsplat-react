/* eslint-env node */
/**
 * @type {import('eslint').Linter.BaseConfig}
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'react/sort-comp': 1,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: [
          './tsconfig.json',
          './examples/my-react-crasher/tsconfig.json',
        ],
        tsconfigRootDir: __dirname,
        ecmaVersion: 13,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
      },
    },
  ],
};
