import type { BugSplat } from 'bugsplat';
import { Scope } from '../src/scope';

describe('setupScope', () => {
  let scope: Scope;

  beforeEach(() => {
    scope = new Scope();
  });

  describe('.getClient()', () => {
    it('should return null before anything is set', () => {
      expect(scope.getClient()).toBe(null);
    });

    it('should return the value set by setClient()', () => {
      const value = {};

      scope.setClient(value as BugSplat);

      expect(scope.getClient()).toBe(value);
    });
  });
});
