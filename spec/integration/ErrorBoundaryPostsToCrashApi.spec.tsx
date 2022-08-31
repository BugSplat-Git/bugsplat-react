import {
  CrashApiClient, OAuthClientCredentialsClient
} from '@bugsplat/js-api-client';
import { render, screen, waitFor } from '@testing-library/react';
import { BugSplatResponse, BugSplatResponseBody } from 'bugsplat';
import dotenv from 'dotenv';
import { init } from '../../src/appScope';
import { ErrorBoundary } from '../../src/ErrorBoundary';

dotenv.config();

const clientId = process.env.BUGSPLAT_CLIENT_ID;
if (!clientId) {
  throw new Error('Environment variable `BUGSPLAT_CLIENT_ID` must be set!');
}

const clientSecret = process.env.BUGSPLAT_CLIENT_SECRET;
if (!clientSecret) {
  throw new Error('Environment variable `BUGSPLAT_CLIENT_SECRET` must be set!');
}

const database = process.env.BUGSPLAT_DATABASE;
if (!database) {
  throw new Error('Environment variable `BUGSPLAT_DATABASE` must be set!');
}

const BlowUpError = new Error('Error thrown during render.');

function BlowUp(): JSX.Element {
  throw BlowUpError;
}

describe('ErrorBoundary posts a caught rendering error to BugSplat', () => {
  let client: CrashApiClient;

  beforeEach(async () => {
    const api = await OAuthClientCredentialsClient.createAuthenticatedClient(clientId, clientSecret)
    client = new CrashApiClient(api); 
  });

  it('should post a crash report with all the provided information', async () => {
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

    await waitFor(() => screen.findByRole('alert'))
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
