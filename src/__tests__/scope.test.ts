import { BugSplat } from 'bugsplat';
import { BugSplatInit } from '../BugSplatScope';
import { Scope } from '../scope';
import MockBugSplat, { mockPost } from '../__mocks__/MockBugSplat';

describe('Scope', () => {
  let scope: Scope<BugSplat, BugSplatInit>;

  const fakeInit: BugSplatInit = {
    database: 'db1',
    application: 'this app',
    version: '3.2.1',
  };

  beforeEach(() => {
    mockPost.mockClear();
    MockBugSplat.mockClear();

    scope = new Scope(
      ({ database, application, version }: BugSplatInit) =>
        new MockBugSplat(database, application, version)
    );
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

      expect(scope.getInstance()).toBe(MockBugSplat.mock.instances.at(-1));
    });

    it('should return null after clearInstance()', () => {
      scope.init(fakeInit);

      expect(scope.getInstance()).not.toBeNull();

      scope.clearInstance();

      expect(scope.getInstance()).toBeNull();
    });
  });

  describe('.useInstance()', () => {
    it('should call action with stored instance', () => {
      scope.init(fakeInit);

      scope.useInstance((instance) => {
        expect(instance).toBe(scope.getInstance());
      });
    });
  });
});
