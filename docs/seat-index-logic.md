# School-Specific Seating Logic (Rule Document) - FINAL VERIFIED

## 1. Core Physics (1-Based Indexing)
The relationship between a student's stored `seat_index` (S) and their visual `(row, col)` position (0-based UI indices) is critical for rendering.

- **Column Position:** `col = (S - 1) % C`
- **Row Position:** `row = floor((S - 1) / C)`
- **Seat Index from Coordinates:** `S = (row * C) + col + 1`

## 2. Visual Layout Constraints
- **Column Range:** Minimum 1, Maximum 3 (Default: 2).
- **Row Calculation:** `total_rows = max(1, ceil(max_seat_index / C))`. This ensures at least one row of empty slots is rendered even for empty groups.
- **Group Width:**
  - 1 Column: 50% of the 2-column base width.
  - 2 Columns: 100% (Base Width / ~400px).
  - 3 Columns: Dynamically computed from base width constants (wider than 2-column, but not a fixed 1.5x multiplier).

## 3. Assignment Logic (Editor Behavior)
Assignment logic primarily lives in the **SeatingChartEditorView** and operates on local memory (The Desk) before persistence.

- **Manual Placement:** Clicking an empty slot assigns that `seat_index` to the student in local React state.
- **Auto-Append:** Adding a student without a target uses `getNextSeatIndex`, which is `max(current_indices) + 1`. This does NOT fill holes automatically.
- **Column Expansion:** The "Expand in Column" feature uses `getNextSeatIndexInColumn` to find the next vertical slot in a specific column rather than appending to the end of the reading order.
- **Persistence:** Changes are saved in a batch call to the API.
- **Renumbering:** Layer 3 exposes `renumberSeatIndicesForGroup` in `@/features/seating/lib/api/seating` (contiguous `seat_index` 1..N in reading order). `SeatingChartEditorView` wraps that API in a callback, but **nothing in the editor UI currently calls it**, so day-to-day edits do not auto-renumber. Treat this as **available plumbing / future use** unless you wire it into specific operations.

## 4. Architectural Implementation Note
- **SeatingChartView (Tier 3):** Must remain "Dumb." It only reads `seat_index` and renders students at calculated coordinates.
- **Seating index math (pure helpers):** Coordinate conversion and next-index calculation live in `src/features/seating/lib/seatingLogic.ts` (used by the seating editor hook and canvas).