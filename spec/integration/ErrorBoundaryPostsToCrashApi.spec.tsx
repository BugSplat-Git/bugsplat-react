import {
  BugSplatApiClient,
  CrashApiClient,
  Environment,
} from '@bugsplat/js-api-client';
import { render, waitFor } from '@testing-library/react';
import { BugSplatResponse } from 'bugsplat';
import { BugSplatResponseBody } from 'bugsplat/dist/cjs/bugsplat-response';
import { ErrorBoundary } from '../../src/ErrorBoundary';
import { init } from '../../src/appScope';
import dotenv from 'dotenv';

/**
 * Load environment variables from .env file
 */
dotenv.config();

const appBaseUrl = 'https://app.bugsplat.com';

const email = process.env.EMAIL;
if (!email) {
  throw new Error('`EMAIL` environment variable must be set!');
}

const password = process.env.PASSWORD;
if (!password) {
  throw new Error('`PASSWORD` environment variable must be set!');
}

const BlowUpError = new Error('Error thrown during render.');

function BlowUp(): JSX.Element {
  throw BlowUpError;
}

describe('ErrorBoundary posts a caught rendering error to BugSplat', () => {
  let client: CrashApiClient;

  beforeEach(async () => {
    const apiClient = new BugSplatApiClient(appBaseUrl, Environment.Node);
    await apiClient.login(email, password);
    client = new CrashApiClient(apiClient);
  });

  it('should post a crash report with all the provided information', async () => {
    const database = 'fred';
    const application = 'my-react-crasher';
    const version = '3.2.1';
    const appKey = 'Key!';
    const user = 'User!';
    const email = 'fred@bedrock.com';
    const description = 'Description!';

    init({
      database,
      application,
      version,
    })((bugSplat) => {
      bugSplat.setDefaultAppKey(appKey);
      bugSplat.setDefaultUser(user);
      bugSplat.setDefaultEmail(email);
      bugSplat.setDefaultDescription(description);

      bugSplat['_formData'] = () => new globalThis.FormData();
      bugSplat['_fetch'] = globalThis.fetch;
    });

    let result: BugSplatResponse | undefined | null;

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

    await waitFor(() => expect(result).not.toBeUndefined());

    if (result?.error !== null) {
      throw Error('There was a problem with the response');
    }

    const crashData = await client.getCrashById(
      database,
      result.response.crash_id
    );

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
