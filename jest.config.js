/* eslint-env node */

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
const baseConfig = {
  coverageProvider: 'v8',
  globals: { fetch, FormData, Blob },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testEnvironment: 'jsdom',
};

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  ...baseConfig,
  projects: [
    {
      displayName: 'unit',
      testPathIgnorePatterns: ['__tests__/integration'],
      ...baseConfig,
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/*.tsx'],
      ...baseConfig,
    },
  ],
};
