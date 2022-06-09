import {
  BugSplatApiClient,
  CrashApiClient,
  Environment,
} from '@bugsplat/js-api-client';
import { render, waitFor, screen } from '@testing-library/react';
import { BugSplatResponse } from 'bugsplat';
import { BugSplatResponseBody } from 'bugsplat/dist/cjs/bugsplat-response';
import { BugSplatScope, createScope } from '../scope';
import ErrorBoundary from '../ErrorBoundary';
import MockBugSplat from '../__mocks__/MockBugSplat';

const email = 'fred@bugsplat.com';
// const password = process.env.FRED_PASSWORD;
const password = 'Flintstone';
const appBaseUrl = 'https://app.bugsplat.com';

const BlowUpError = new Error('Error thrown during render.');

function BlowUp(): JSX.Element {
  throw BlowUpError;
}

describe('<ErrorBoundary />', () => {
  let client: CrashApiClient;
  let scope: BugSplatScope;

  beforeEach(async () => {
    if (!password) {
      throw new Error('`FRED_PASSWORD` environment variable must be set!');
    }
    const apiClient = new BugSplatApiClient(appBaseUrl, Environment.Node);
    await apiClient.login(email, password);
    client = new CrashApiClient(apiClient);
    scope = createScope(MockBugSplat);
  });

  it('should post a crash report with all the provided information', async () => {
    const database = 'fred';
    const application = 'my-react-crasher';
    const version = '3.2.1';
    const appKey = 'Key!';
    const user = 'User!';
    const email = 'fred@bedrock.com';
    const description = 'Description!';

    scope.init({
      database,
      application,
      version,
      onInit: (bugSplat) => {
        bugSplat.setDefaultAppKey(appKey);
        bugSplat.setDefaultUser(user);
        bugSplat.setDefaultEmail(email);
        bugSplat.setDefaultDescription(description);
      },
    });

    const bugSplat = scope.getInstance() as unknown as {
      _formData: () => FormData;
      _fetch: typeof fetch;
    };

    bugSplat._formData = () => new globalThis.FormData();
    bugSplat._fetch = globalThis.fetch;

    let result: BugSplatResponse | null;

    render(
      <ErrorBoundary
        onError={(_e, _c, response) => {
          result = response;
        }}
        fallback={({ response }) => (
          <div role="alert">
            {(response?.response as BugSplatResponseBody)?.crash_id}
          </div>
        )}
      >
        <BlowUp />
      </ErrorBoundary>
    );

    let alert: HTMLDivElement;
    let expectedCrashId = -1;

    await waitFor(async () => {
      alert = await screen.findByRole<HTMLDivElement>('alert');

      expect(alert).toBeInTheDocument();
    });

    await waitFor(() => {
      if (result?.error !== null) {
        throw result?.error;
      }

      expectedCrashId = result.response.crash_id;
    });

    const crashData = await client.getCrashById(database, expectedCrashId);

    expect(crashData.appName).toEqual(application);
    expect(crashData.appVersion).toEqual(version);
    expect(crashData.appKey).toEqual(appKey);
    expect(crashData.description).toEqual(description);

    /**
     * Fred has PII obfuscated so the best
     * we can do for these is to check if truthy
     */
    expect(crashData.user).toBeTruthy();
    expect(crashData.email).toBeTruthy();
  });
});
