/* eslint-env node */

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  coverageProvider: 'v8',
  globals: { fetch, FormData, Blob },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
};
