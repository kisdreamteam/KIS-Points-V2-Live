/**
 * Pure seat-index math for the fixed-slot group grid (reading order).
 *
 * @see docs/seat-index-logic.md
 */

export interface SeatGridCoordinates {
  /** 0-based row in the student grid (below the group header). */
  row: number;
  /** 0-based column within the group. */
  col: number;
}

/**
 * 1-based seat index `S` from 0-based grid coordinates (left-to-right, then top-to-bottom).
 *
 * Preconditions: `columns >= 1`, `row >= 0`, `col >= 0`, `col < columns`.
 */
export function getSlotIndex(row: number, col: number, columns: number): number {
  return row * columns + col + 1;
}

/**
 * Inverse of {@link getSlotIndex}: 0-based `(row, col)` from 1-based stored `seat_index`.
 *
 * @param index 1-based `seat_index` `S` (same as slot index in the UI).
 * @param columns Group column count `C` (callers should pass the same `validColumns` as rendering).
 *
 * Preconditions: `index >= 1`, `columns >= 1`.
 */
export function getCoordinates(index: number, columns: number): SeatGridCoordinates {
  const s = index - 1;
  return {
    row: Math.floor(s / columns),
    col: s % columns,
  };
}

/**
 * Next seat index for auto-append: `max(occupied) + 1`. Does not fill holes.
 * Empty list yields `1` (matches prior `getNextSeatIndex` on empty assignments).
 *
 * Preconditions: `existingIndices` contains only finite numbers; callers may coerce `null`/`undefined` to `0` before passing.
 */
export function getNextIndex(existingIndices: readonly number[]): number {
  if (existingIndices.length === 0) {
    return 1;
  }
  return Math.max(...existingIndices) + 1;
}
