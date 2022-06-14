import { createScope, Scope } from '../scope';

describe('Scope', () => {
  let scope: Scope<object>;

  beforeEach(() => {
    scope = createScope();
  });

  describe('.getInstance()', () => {
    it('should return null before anything is set', () => {
      expect(scope.getInstance()).toBe(null);
    });

    it('should return the value set by setInstance()', () => {
      const value = {};

      scope.setInstance(value);

      expect(scope.getInstance()).toBe(value);
    });
  });
});
