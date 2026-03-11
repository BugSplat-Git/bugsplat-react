import { useCallback, useState } from 'react';
import type { BugSplatOptions, BugSplatResponse } from 'bugsplat';
import { getBugSplat } from './appScope';

/**
 * Hook for submitting user feedback to BugSplat.
 *
 * @returns Object with `postFeedback` function and `loading`/`response`/`error` state
 *
 * @example
 * const { postFeedback, loading, error } = useFeedback();
 * await postFeedback('Login button broken', { description: 'Nothing happens when I tap it' });
 */
export function useFeedback() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<BugSplatResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const postFeedback = useCallback(
    async (title: string, options?: BugSplatOptions) => {
      const client = getBugSplat();
      if (!client) {
        const err = new Error(
          'BugSplat has not been initialized. Call init() first.'
        );
        setError(err);
        return;
      }

      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        const result = await client.postFeedback(title, options);
        setResponse(result);
        if (result.error) {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { postFeedback, loading, response, error };
}
