/**
 * Pure seat-index math for the fixed-slot group grid (reading order).
 *
 * @see docs/seat-index-logic.md
 */

import type { GroupAssignment } from '@/features/seating/lib/api/seating';

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

/** Highest occupied 1-based seat index in a group; `0` when empty. */
export function getMaxSeatIndexFromAssignments(assignments: readonly GroupAssignment[]): number {
  if (assignments.length === 0) return 0;
  return getNextIndex(assignments.map((a) => a.seat_index ?? 0)) - 1;
}

/**
 * Header row + student rows for `seating_groups.group_rows` (minimum 2).
 * Matches editor grid math used before batch save.
 */
export function computeGroupRowsFromAssignments(
  assignmentsInGroup: readonly GroupAssignment[],
  groupColumns: number
): number {
  const studentsPerRow = groupColumns || 2;
  const maxIdx = getMaxSeatIndexFromAssignments(assignmentsInGroup);
  const studentRowCount = maxIdx === 0 ? 1 : Math.ceil(maxIdx / studentsPerRow);
  return Math.max(2, 1 + studentRowCount);
}
