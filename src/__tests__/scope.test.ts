import { createScope, BugSplatScope, BugSplatInit } from '../scope';
import MockBugSplat, { mockPost } from '../__mocks__/MockBugSplat';

describe('createScope()', () => {
  let scope: BugSplatScope;

  const fakeInit: BugSplatInit = {
    database: 'db1',
    application: 'this app',
    version: '3.2.1',
  };

  beforeEach(() => {
    mockPost.mockClear();
    MockBugSplat.mockClear();
    scope = createScope(MockBugSplat);
  });

  describe('.init()', () => {
    it('should initialize a new client instance', () => {
      expect(MockBugSplat.mock.instances.length).toBe(0);

      scope.init(fakeInit);

      expect(MockBugSplat.mock.instances.length).toBeGreaterThan(0);
    });
  });

  describe('.getInstance()', () => {
    it('should return null before init()', () => {
      expect(scope.getInstance()).toBeNull();
    });

    it('should return an instance after init()', () => {
      scope.init(fakeInit);

      expect(scope.getInstance()).not.toBeNull();
    });

    it('should return null after reset()', () => {
      scope.init(fakeInit);

      expect(scope.getInstance()).not.toBeNull();

      scope.reset();

      expect(scope.getInstance()).toBeNull();
    });
  });

  describe('.post()', () => {
    it('should call BugSplat.post with args', async () => {
      expect.assertions(1);

      scope.init(fakeInit);

      await scope.post('test-me');

      expect(mockPost).toHaveBeenCalledWith('test-me');
    });

    it('should throw Error if scope is not initialized', async () => {
      try {
        await scope.post('');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
