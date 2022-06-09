import { BugSplat, BugSplatOptions, BugSplatResponse } from 'bugsplat';

export const mockPost = jest.fn(
  async (_errorToPost: string | Error, _options?: BugSplatOptions) =>
    new Promise<BugSplatResponse>((resolve) => resolve({} as BugSplatResponse))
);

const MockBugSplat = jest.fn(function () {
  return { post: mockPost };
}) as unknown as jest.MockedClass<typeof BugSplat>;

export default MockBugSplat;
