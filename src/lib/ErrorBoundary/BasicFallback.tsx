/**
 * Basic fallback component to display when
 * an error is caught by ErrorBoundary
 */
export default function BasicFallback(): JSX.Element {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <h2>Something went wrong.</h2>
    </div>
  );
}
