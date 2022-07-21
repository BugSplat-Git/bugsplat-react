/* eslint-env node */

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
const baseConfig = {
  coverageProvider: 'v8',
  globals: { fetch, FormData, Blob },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/spec/setupTests.ts'],
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
      testPathIgnorePatterns: ['spec/integration'],
      ...baseConfig,
    },
    {
      displayName: 'integration',
      testMatch: ['**/spec/integration/*.tsx'],
      ...baseConfig,
    },
  ],
};
