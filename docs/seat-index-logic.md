# School-Specific Seating Logic (Rule Document)

**Last updated:** September 2026 (aligned with immediate editor persistence + Option C store)

## 1. Core Physics (1-Based Indexing)
The relationship between a student's stored `seat_index` (S) and their visual `(row, col)` position (0-based UI indices) is critical for rendering.

- **Column Position:** `col = (S - 1) % C`
- **Row Position:** `row = floor((S - 1) / C)`
- **Seat Index from Coordinates:** `S = (row * C) + col + 1`

Pure helpers: [`src/features/seating/lib/seatingLogic.ts`](../src/features/seating/lib/seatingLogic.ts)

## 2. Visual Layout Constraints
- **Column Range:** Minimum 1, Maximum 3 (Default: 2).
- **Row Calculation:** `total_rows = max(1, ceil(max_seat_index / C))`. This ensures at least one row of empty slots is rendered even for empty groups.
- **Group Width:**
  - 1 Column: 50% of the 2-column base width.
  - 2 Columns: 100% (Base Width / ~400px).
  - 3 Columns: Dynamically computed from base width constants (wider than 2-column, but not a fixed 1.5x multiplier).

## 3. Assignment Logic (Editor Behavior)
Assignment orchestration lives in **`useSeatingChartEditor`** ([`src/hooks/useSeatingChart.ts`](../src/hooks/useSeatingChart.ts)) and reads/writes layout canvas data in **`useSeatingStore`** (groups, `groupAssignmentsById`, `groupPositionsById`). Persistence is **immediate and granular** via [`useSeatingEditorPersistence.ts`](../src/hooks/useSeatingEditorPersistence.ts) — not batch-on-exit.

- **Manual Placement:** Clicking an empty slot assigns that `seat_index` to the student (optimistic store update → API).
- **Auto-Append:** Adding a student without a target uses `getNextSeatIndex` → `max(current_indices) + 1`. This does **not** fill holes automatically.
- **Column Expansion:** The "Expand in Column" feature uses `getNextSeatIndexInColumn` to find the next vertical slot in a specific column rather than appending to the end of the reading order.
- **Remove / move / swap:** Store updated optimistically; targeted Layer 3 calls (`insert`, `update`, `delete`, `swapSeatAssignments`) + derived `group_rows` write. See [`seating_editor_save_audit.md`](seating_editor_save_audit.md).
- **Renumbering:** Layer 3 exposes `renumberSeatIndicesForGroup` in [`seating.ts`](../src/features/seating/lib/api/seating.ts) (contiguous `seat_index` 1..N in reading order). The editor hook wraps that API in a callback, but **nothing in the editor UI currently calls it**, so day-to-day edits do not auto-renumber. Holes after remove are intentional. Treat as **available plumbing / future use** unless wired into specific operations (would also need store refresh after API).

## 4. Architectural Implementation Note
- **View canvas (`SeatingGroupsCanvas`):** Reads assignments from `useSeatingStore`; renders students at calculated coordinates from `seat_index`.
- **Editor canvas (`SeatingEditorWorkspace`):** Same store-backed assignments; orchestration in `useSeatingChartEditor`.
- **DB invariant:** One seat per student per layout — `UNIQUE(student_id, seating_chart_id)` on `student_seat_assignments` (see [`db-schema.md`](db-schema.md)).
