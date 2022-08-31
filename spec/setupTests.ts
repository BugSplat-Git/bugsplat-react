import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {
    /**
     *
     */
  });
});
