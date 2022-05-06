/* eslint-env node */
module.exports = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
};
