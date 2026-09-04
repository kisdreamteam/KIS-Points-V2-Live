/**
 * Shared counter for seating-editor granular persists in flight.
 * Lets exit-refresh (SeatingChartDataSync) wait until writes settle before refetching.
 */

let inFlight = 0;
const idleWaiters = new Set<() => void>();

export function beginEditorPersist(): void {
  inFlight += 1;
}

export function endEditorPersist(): void {
  inFlight = Math.max(0, inFlight - 1);
  if (inFlight === 0) {
    for (const waiter of idleWaiters) waiter();
    idleWaiters.clear();
  }
}

export function getEditorPersistInFlight(): number {
  return inFlight;
}

/** Resolves when no persists are in flight, or after timeoutMs (whichever first). */
export function waitForEditorPersistsIdle(timeoutMs = 8000): Promise<void> {
  if (inFlight === 0) return Promise.resolve();
  return new Promise((resolve) => {
    const onIdle = () => {
      clearTimeout(timer);
      idleWaiters.delete(onIdle);
      resolve();
    };
    const timer = setTimeout(onIdle, timeoutMs);
    idleWaiters.add(onIdle);
  });
}
