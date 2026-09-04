export interface WithTransientRetryOptions {
  /** Number of retries after the first attempt. Default 2 (3 total attempts). */
  retries?: number;
  /** Backoff delays in ms before each retry. Default [300, 800]. */
  delaysMs?: number[];
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof Error && err.name === 'AbortError') return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run an async function; on throw, wait and retry for transient failures.
 * Does not retry AbortError. Rethrows the last error after exhaustion.
 */
export async function withTransientRetry<T>(
  fn: () => Promise<T>,
  options: WithTransientRetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 2;
  const delaysMs = options.delaysMs ?? [300, 800];

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isAbortError(err) || attempt >= retries) {
        throw err;
      }
      const delay = delaysMs[Math.min(attempt, delaysMs.length - 1)] ?? 0;
      if (delay > 0) await sleep(delay);
    }
  }
  throw lastError;
}
