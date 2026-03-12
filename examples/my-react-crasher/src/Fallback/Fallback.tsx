import styles from './Fallback.module.css';

interface FallbackProps {
  submissionLink?: { href: string; text: string } | null;
  loading?: boolean;
  onReset: () => void;
}

export default function Fallback({
  submissionLink,
  loading,
  onReset,
}: FallbackProps) {
  const link = submissionLink && (
    <a href={submissionLink.href} target="_blank" rel="noreferrer">
      {submissionLink.text}
    </a>
  );

  return (
    <div className={styles.root}>
      <p>{loading ? 'loading...' : link}</p>
      <button className={styles.reset} onClick={onReset}>
        <h2>Reset</h2>
      </button>
    </div>
  );
}
