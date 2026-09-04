'use client';

/**
 * Shared counter for seating-editor granular persists in flight.
 * Lets exit-refresh (SeatingChartDataSync) wait until writes settle before refetching,
 * and lets the editor toolbar disable Sync layout while saves are in flight.
 */

import { useSyncExternalStore } from 'react';

let inFlight = 0;
const idleWaiters = new Set<() => void>();
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

export function beginEditorPersist(): void {
  inFlight += 1;
  notifyListeners();
}

export function endEditorPersist(): void {
  inFlight = Math.max(0, inFlight - 1);
  notifyListeners();
  if (inFlight === 0) {
    for (const waiter of idleWaiters) waiter();
    idleWaiters.clear();
  }
}

export function getEditorPersistInFlight(): number {
  return inFlight;
}

export function subscribeEditorPersistInFlight(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
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

export function useEditorPersistInFlight(): boolean {
  return useSyncExternalStore(
    subscribeEditorPersistInFlight,
    () => getEditorPersistInFlight() > 0,
    () => false
  );
}
