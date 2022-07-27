import { ErrorBoundary, useErrorHandler } from '@bugsplat/react';
import { type ReactNode, useState } from 'react';
import logo from './bugsplat-logo.png';
import styles from './App.module.css';
import Fallback from '../Fallback';

const BUGSPLAT_URL = 'https://www.bugsplat.com/';
const DOCS_REACT_URL =
  'https://docs.bugsplat.com/introduction/getting-started/integrations/web/react';

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

function App() {
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className={styles.root}>
      <Link href={BUGSPLAT_URL}>
        <img alt="BugSplat Logo" className={styles.logo} src={logo} />
      </Link>
      <div className={styles.content}>
        <h1>Welcome to my-react-crasher</h1>
        <p>
          This is a sample application that demonstrates
          <Link href={BUGSPLAT_URL}>BugSplat</Link> error reporting for
          <Link href={DOCS_REACT_URL}>React</Link> applications built with
          JavaScript or TypeScript.
        </p>
        <ErrorBoundary
          fallback={(props) => <Fallback {...props} />}
          onReset={() => setError(null)}
          resetKeys={[error]}
        >
          <ThrowOnError error={error} />
        </ErrorBoundary>
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
      </div>
    </div>
  );
}

export default App;
