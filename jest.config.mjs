/**
 * @type {import('jest').Config}
 */
const baseConfig = {
  coverageProvider: 'v8',
  globals: { fetch, FormData, Blob },
  preset: 'ts-jest/presets/default-esm',
  setupFilesAfterEnv: ['<rootDir>/spec/setupTests.ts'],
  testEnvironment: 'jsdom',
};

/**
 * @type {import('jest').Config}
 */
const jestConfig = {
  ...baseConfig,
  projects: [
    {
      displayName: 'unit',
      testPathIgnorePatterns: ['spec/integration', 'examples'],
      ...baseConfig,
    },
    {
      displayName: 'integration',
      testMatch: ['**/spec/integration/*.tsx'],
      ...baseConfig,
    },
  ],
};

export default jestConfig;
