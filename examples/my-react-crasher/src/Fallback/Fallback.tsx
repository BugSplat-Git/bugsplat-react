import { FallbackProps, getBugSplat } from '@bugsplat/react';
import styles from './Fallback.module.css';

const BASE_CRASH_URL = 'https://app.bugsplat.com/v2/crash';

export default function Fallback({
  resetErrorBoundary,
  response,
}: FallbackProps) {
  const bugSplat = getBugSplat();
  const database = bugSplat?.database;

  const crashId =
    response?.error === null ? response.response.crash_id : undefined;

  const link = crashId && database && (
    <a
      href={`${BASE_CRASH_URL}?database=${database}&id=${crashId}`}
      target="_blank"
      rel="noreferrer"
    >
      Crash {crashId} in database {database}
    </a>
  );

  return (
    <div className={styles.root}>
      <p>{response ? link : 'loading...'}</p>
      <button className={styles.reset} onClick={resetErrorBoundary}>
        <h2>Reset</h2>
      </button>
    </div>
  );
}
