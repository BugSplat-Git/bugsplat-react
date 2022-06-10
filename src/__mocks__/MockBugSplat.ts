import { BugSplat, BugSplatOptions, BugSplatResponse } from 'bugsplat';

export const mockPost = jest.fn(
  async (_errorToPost: string | Error, _options?: BugSplatOptions) =>
    new Promise<BugSplatResponse>((resolve) => resolve({} as BugSplatResponse))
);

const MockBugSplat = jest.fn(function (
  this: BugSplat,
  ..._args: ConstructorParameters<typeof BugSplat>
) {
  this.post = mockPost;

  return this;
});

export default MockBugSplat;
