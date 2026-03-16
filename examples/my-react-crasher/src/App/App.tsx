import { ErrorBoundary, getBugSplat, useErrorHandler, useFeedback, type BugSplatResponse } from '@bugsplat/react';
import { type ReactNode, useEffect, useState } from 'react';
import logo from './bugsplat-logo.png';
import styles from './App.module.css';
import Fallback from '../Fallback';
import FeedbackDialog, { type FeedbackData } from '../FeedbackDialog';

const BUGSPLAT_URL = 'https://www.bugsplat.com/';
const DOCS_REACT_URL =
  'https://docs.bugsplat.com/introduction/getting-started/integrations/web/react';
const BASE_CRASH_URL = 'https://app.bugsplat.com/v2/crash';

function Link({ href, children }: { href?: string; children: ReactNode }) {
  return (
    <a target="_blank" rel="noreferrer" href={href}>
      {children}
    </a>
  );
}

const ERRORS: Error[] = [
  TypeError('Bug.Splat is not a function'),
  URIError('Malformed URI sequence'),
  SyntaxError("Invalid character: '@'"),
  RangeError('The argument must be between -500 and 500'),
];

function ThrowOnError(props: { error: Error | null }) {
  useErrorHandler(props.error);
  return null;
}

interface SubmissionLink {
  href: string;
  text: string;
}

function App() {
  const [error, setError] = useState<Error | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [submissionLink, setSubmissionLink] = useState<SubmissionLink | null>(null);
  const { postFeedback, response: feedbackResponse } = useFeedback();

  const database = getBugSplat()?.database;

  function handleSubmissionResponse(response: BugSplatResponse) {
    if (!database || response.error) return;
    const crashId = response.response.crash_id;
    setSubmissionLink({
      href: `${BASE_CRASH_URL}?database=${database}&id=${crashId}`,
      text: `View submission ${crashId} in database ${database}`,
    });
  }

  useEffect(() => {
    if (feedbackResponse) {
      handleSubmissionResponse(feedbackResponse);
    }
  }, [feedbackResponse]);

  async function handleFeedbackSubmit(data: FeedbackData) {
    setShowFeedbackDialog(false);
    const attachments = data.attachments.map((file) => ({
      filename: file.name,
      data: file,
    }));
    await postFeedback(data.title, {
      description: data.description,
      attachments,
    });
  }

  return (
    <div className={styles.root}>
      <Link href={BUGSPLAT_URL}>
        <img alt="BugSplat Logo" className={styles.logo} src={logo} />
      </Link>
      <div className={styles.content}>
        <h1>Welcome to my-react-crasher</h1>
        <p>
          This is a sample application that demonstrates{' '}
          <Link href={BUGSPLAT_URL}>BugSplat</Link> error reporting for{' '}
          <Link href={DOCS_REACT_URL}>React</Link> applications built with
          JavaScript or TypeScript.
        </p>
        <ErrorBoundary
          fallback={() => (
            <Fallback
              submissionLink={submissionLink}
              loading={!submissionLink}
              onReset={() => { setError(null); setSubmissionLink(null); }}
            />
          )}
          onError={(_error, _componentStack, response) => {
            if (response) {
              handleSubmissionResponse(response);
            }
          }}
          onReset={() => setError(null)}
          resetKeys={[error]}
        >
          <ThrowOnError error={error} />
        </ErrorBoundary>
        {submissionLink && !error && (
          <Fallback
            submissionLink={submissionLink}
            onReset={() => setSubmissionLink(null)}
          />
        )}
        <div className={styles.errors}>
          <h2>Errors</h2>
          {ERRORS.map((error) => (
            <button
              key={error.name}
              className={styles.error}
              onClick={() => setError(error)}
            >
              <h2>{error.name}</h2>
              <h4>{error.message}</h4>
            </button>
          ))}
        </div>
        <div className={styles.feedback}>
          <h2>Feedback</h2>
          <p>Let your users send arbitrary feedback and file attachments directly to your BugSplat dashboard.</p>
          <button className={styles.feedbackBtn} onClick={() => setShowFeedbackDialog(true)}>
            Send Feedback
          </button>
        </div>
      </div>
      {showFeedbackDialog && (
        <FeedbackDialog
          onClose={() => setShowFeedbackDialog(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}

export default App;
