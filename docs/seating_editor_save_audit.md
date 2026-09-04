# Seating Editor Persistence Audit

**Last updated:** post view-settings store consolidation (Sep 2026).

Reference for how the seating **editor** persists changes: which state buckets exist, what writes to Supabase, and how view mode stays in sync.

Primary files:

- [`src/hooks/useSeatingChart.ts`](../src/hooks/useSeatingChart.ts) — editor orchestration, reads/writes `useSeatingStore` for layout canvas data
- [`src/hooks/useSeatingEditorPersistence.ts`](../src/hooks/useSeatingEditorPersistence.ts) — Layer 1 targeted persist + rollback (store-backed); wraps writes with [`withTransientRetry`](../src/lib/withTransientRetry.ts)
- [`src/hooks/useSeatingLayoutManager.ts`](../src/hooks/useSeatingLayoutManager.ts) — view-mode layout create / rename / delete / select
- [`src/features/seating/components/canvas/LayoutManagerDrawer.tsx`](../src/features/seating/components/canvas/LayoutManagerDrawer.tsx) — layout manager drawer UI (wired from `SeatingViewWorkspace`)
- [`src/features/seating/lib/api/seating.ts`](../src/features/seating/lib/api/seating.ts) — Layer 3 Supabase access
- [`src/hooks/useSeatingEditorToolbarActions.ts`](../src/hooks/useSeatingEditorToolbarActions.ts) — view-setting toggles
- [`src/features/seating/stores/useSeatingStore.ts`](../src/features/seating/stores/useSeatingStore.ts) — **single desk** for groups, assignments, positions (editor + view)
- [`src/features/seating/stores/seatingLayoutStoreHelpers.ts`](../src/features/seating/stores/seatingLayoutStoreHelpers.ts) — Record/Map helpers, position builder
- [`src/features/dashboard/hooks/sync/SeatingChartDataSync.tsx`](../src/features/dashboard/hooks/sync/SeatingChartDataSync.tsx) — layout/group/view-settings hydration

---

## Architecture (editor mutation flow)

```mermaid
flowchart LR
  action[Canvas or toolbar action]
  store[useSeatingStore]
  persist[useSeatingEditorPersistence]
  api[seating.ts granular API]
  db[(Supabase)]
  broadcast[broadcastSeatingChartRefresh]

  action --> store
  store --> persist
  persist --> api
  api --> db
  api --> broadcast
  broadcast --> store
```

**Pattern:** optimistic store update → targeted API call with transient retry (`withTransientRetry`, 2 retries / 300–800ms) → on exhaustion rollback store slice + error toast. **`group_rows`** is recomputed from assignments and written via `updateSeatingGroupRows` after assignment-affecting changes.

**Exit (toolbar X):** navigate only — removes `mode=edit`, emits `SEATING_EDIT_MODE` false, calls `refreshSeatingGroupsForLayout` as a safety net. **`SeatingChartDataSync`** also listens for edit-mode exit and refreshes groups **again** plus view settings. **No batch save on exit.** See [Remaining concerns](#remaining-concerns) for duplicate-fetch and in-flight-persist risks.

---

## State buckets

| Bucket | Location | Used by |
|--------|----------|---------|
| Groups list | `useSeatingStore.groups` | Editor canvas + view canvas |
| Seat assignments | `useSeatingStore.groupAssignmentsById` (Record) | Editor canvas + view canvas |
| Group XY positions | `useSeatingStore.groupPositionsById` (Record) | Editor canvas + view canvas |
| Unseated roster | `useSeatingStore.unseatedStudents` | Left nav |
| Selected student for placement | `useSeatingStore.selectedStudentForGroup` | Left nav + canvas |
| View settings (grid, furniture, desk, color toggles) | `useSeatingStore` (`showGrid`, `showObjects`, `layoutOrientation`, `colorByGender`, `colorByLevel`) | Editor + view canvas, toolbar menus, left nav |

---

## Persistence inventory

Legend: **Store** = `useSeatingStore` · **DB** = Supabase via `seating.ts`

### View preferences (toolbar)

| Change | Store | DB | Notes |
|--------|:-----:|:--:|-------|
| Show grid | Yes | **Immediate** | `useSeatingEditorToolbarActions` → optimistic `syncLayoutViewSettings` → `updateLayoutViewSettings` → `SEATING_VIEW_SETTINGS_CHANGED` |
| Show furniture | Yes | **Immediate** | Same |
| Teacher's desk left/right | Yes | **Immediate** | Same |
| Color by gender | Yes | **Immediate** | Same |
| Color by level | Yes | **Immediate** | Same |

**Store hydration:** [`SeatingChartDataSync.tsx`](../src/features/dashboard/hooks/sync/SeatingChartDataSync.tsx) — fetch on layout change, edit exit, tab visible, Supabase realtime, and local toggle events. [`useSeatingLayoutManager.ts`](../src/hooks/useSeatingLayoutManager.ts) applies cached layout row instantly when `layouts` list already contains the selection.

### Group structure (create / edit / delete)

| Change | Store | DB | Notes |
|--------|:-----:|:--:|-------|
| Add one group | Yes (via `fetchGroups`) | **Immediate** | `insertSeatingGroup` |
| Add multiple groups | Yes (via `fetchGroups`) | **Immediate** | `insertSeatingGroups` |
| Edit group (modal: name, columns) | Yes (after API) | **Immediate** | `updateSeatingGroupFields` via `persistGroupColumnsChange` — store patched on success, not optimistically |
| Inline rename group | Yes | **Immediate** | `updateSeatingGroupFields` (name only) |
| Update group columns (settings menu) | Yes (after API) | **Immediate** | Same as modal — `persistGroupColumnsChange` → columns + derived `group_rows` |
| Delete one team | Yes | **Immediate** | `deleteTeamAssignmentsAndGroup` |
| Clear one team (unseat) | Yes (+ unseated) | **Immediate** | `deleteStudentSeatAssignmentsForSeatingGroupId` + `syncGroupRowsForGroupIds` |
| Clear all groups | Yes (+ unseated) | **Immediate** | `deleteAssignmentsForGroupsSequential` + `syncGroupRowsForGroupIds` |
| Delete all groups | Yes (+ unseated) | **Immediate** | Assignments delete + `deleteSeatingGroupsSequential` |

### Layout geometry and seating (canvas — immediate granular persist)

| Change | Store | DB | Layer 3 / orchestrator |
|--------|:-----:|:--:|------------------------|
| Drag group XY | Yes | **Immediate** | `updateSeatingGroupPosition` |
| Add student to group | Yes (+ unseated) | **Immediate** | `insertStudentSeatAssignment` + `updateSeatingGroupRows` |
| Remove student from group | Yes (+ unseated) | **Immediate** | `deleteStudentSeatAssignmentsByStudentId` + `updateSeatingGroupRows` |
| Swap students (same or cross group) | Yes | **Immediate** | `swapSeatAssignments` (delete both + insert both) + `updateSeatingGroupRows` |
| Move student cross-group | Yes | **Immediate** | `deleteStudentSeatAssignmentsByStudentId` + `insertStudentSeatAssignment` + `updateSeatingGroupRows` |
| Move / change seat within same group | Yes | **Immediate** | `updateStudentSeatAssignmentByStudentId` (+ `fallbackGroupId` upsert if no DB row) + `updateSeatingGroupRows` |
| `group_rows` (derived) | Yes (computed + patched on store `groups`) | **Immediate** | `updateSeatingGroupRows` after assignment changes; also written with column changes via `persistGroupColumnsChange` |

Orchestration lives in [`useSeatingEditorPersistence.ts`](../src/hooks/useSeatingEditorPersistence.ts). Granular writes use [`withTransientRetry`](../src/lib/withTransientRetry.ts); only after retries are exhausted do failed persists roll back store assignments and show an error notification.

### Bulk seating tools

| Change | Store | DB | Notes |
|--------|:-----:|:--:|-------|
| Auto-assign seats | Yes (via `fetchGroups`) | **Immediate** | Bulk `insertStudentSeatAssignments`; then `syncGroupRowsForGroupIds` per affected group |
| Randomize seats | Yes (via `fetchGroups`) | **Immediate** | Bulk delete all layout assignments + re-insert; then `syncGroupRowsForGroupIds` |

### Layout manager (view drawer / left nav)

Orchestration: [`useSeatingLayoutManager.ts`](../src/hooks/useSeatingLayoutManager.ts). UI: [`LayoutManagerDrawer.tsx`](../src/features/seating/components/canvas/LayoutManagerDrawer.tsx) from [`SeatingViewWorkspace.tsx`](../src/features/seating/SeatingViewWorkspace.tsx); left-nav edit/delete via `setLayoutNavHandlers`.

| Change | Store | DB | Notes |
|--------|:-----:|:--:|-------|
| Create layout | Selected id + localStorage after success | **Immediate** | `createSeatingLayout` → `refreshSeatingLayoutsForClass` → enter editor (`mode=edit`) |
| Inline rename (drawer) | Via layouts list refresh | **Immediate** | `handleInlineRenameLayout` → `updateSeatingLayoutName` → refresh |
| Rename (edit modal) | Via layouts list refresh | **Immediate** | `handleEditLayoutSave` → same API → refresh |
| Delete layout | Clears selection + localStorage if active | **Immediate** | `deleteSeatingLayoutCascade` (groups + seat assignments) → refresh |
| Select layout | `selectedLayoutId` + localStorage | **No** | Navigation only; applies cached view settings from layouts list |

**Pattern (vs editor canvas):** Not optimistic — list/name update after API + `refreshSeatingLayoutsForClass`. Failures use `throw` / `alert` (not editor `SuccessNotificationModal` / `withTransientRetry`). Does not touch `groupAssignmentsById` / group positions except cascade delete wiping that layout’s DB rows.

### UI / selection (not persisted)

| Change | Local hook | Store | DB |
|--------|:----------:|:-----:|:--:|
| Selected student for swap | Yes | No | No |
| Selected student for group placement | No | Yes | No |
| Group settings menu open state | Yes | No | No |
| Drag-in-progress | Yes | No | No |

### Exit (toolbar X) and manual repair

| Action | DB write | Notes |
|--------|:--------:|-------|
| Close editor | **No** | `handleClose`: URL `mode=edit` removed; `emitSeatingEditMode({ isEditMode: false })`; direct `refreshSeatingGroupsForLayout`. **`SeatingChartDataSync`** on the same event also calls `refreshSeatingGroupsForLayout` + `refreshLayoutViewSettings` — groups are fetched twice on every exit. |
| Manual layout repair | **Yes (full replace)** | Settings → **Sync layout to database** → confirmation → `SEATING_REPAIR_LAYOUT` → `repairSeatingLayoutFromStore`. Deletes all layout assignments and re-inserts from store; batch-updates group positions. |

**Repair guards:** Event handler blocks when `persistInFlightRef > 0`, randomize in flight, or repair already running (`saveAllChangesInFlightRef`). Toolbar disables the menu item while repair or randomize is in flight; granular persists are blocked at the handler with a “Please wait” toast (modal can still be opened during a granular persist).

Editor UX copy: [`SeatingCanvasDecor`](../src/features/seating/components/canvas/SeatingCanvasDecor.tsx) shows **“Changes save automatically”** when `showSaveHint` is on.

---

## Layer 3 granular APIs (assignment / layout)

| Function | Used for |
|----------|----------|
| `updateSeatingGroupPosition` | Group drag drop |
| `updateSeatingGroupRows` | Derived row count after assignment changes |
| `insertStudentSeatAssignment` | Single placement, cross-group move, swap re-insert; upserts on `(student_id, seating_chart_id)` |
| `updateStudentSeatAssignmentByStudentId` | Same-group seat change; scoped to one layout |
| `deleteStudentSeatAssignmentsByStudentId` | Removal, cross-group move, swap; optional layout scope (omit = all layouts, e.g. archive) |
| `swapSeatAssignments` | Two-student swap (layout-scoped delete + insert both) |

### Layer 3 layout-lifecycle APIs (layout manager)

| Function | Used for |
|----------|----------|
| `createSeatingLayout` | New chart row for class; then refresh + open editor |
| `updateSeatingLayoutName` | Rename from drawer inline edit or edit-layout modal |
| `deleteSeatingLayoutCascade` | Delete chart + its groups + seat assignments |

**DB invariant:** `UNIQUE(student_id, seating_chart_id)` on `student_seat_assignments` (migration `20250904000000_student_seat_assignments_layout_unique.sql`). Inserts enrich `seating_chart_id` from the target group; fetch dedupes defensively by student within a layout.

Batch helpers (`updateSeatingGroupsLayoutBatch`, `deleteStudentSeatAssignmentsForGroupIds`, `insertStudentSeatAssignmentsBatched`) remain for **`repairSeatingLayoutFromStore`** (manual recovery), randomize, and auto-assign.

**Cross-tab refresh (notify-only):** Mutators call `broadcastByGroupIds` / `broadcastSeatingChartRefresh` after DB success. Broadcast is **best-effort** — failures are logged and never roll back store or fail the mutation. Channel split ([`seatingRealtime.ts`](../src/features/seating/lib/seatingRealtime.ts)):

| Channel | Purpose |
|---------|---------|
| `seating_charts_settings_${layoutId}` | `postgres_changes` on `seating_charts` (view settings) |
| `seating_chart_refresh_${layoutId}` | `broadcast` event for group/assignment refresh |

`SeatingChartDataSync` holds both long-lived subscriptions; same-tab sends reuse the joined refresh channel when available (avoids colliding with a second subscribe on the same name). If notify fails, other tabs catch up via visibility refresh / next fetch.

---

## View settings: hydration (store-canonical)

| Path | When | What it updates |
|------|------|-----------------|
| `SeatingChartDataSync` → `refreshLayoutViewSettings` | `selectedLayoutId` changes | Store via `syncLayoutViewSettings` |
| `SeatingChartDataSync` → `refreshLayoutViewSettings` | Edit mode exit (`SEATING_EDIT_MODE` false) | Store (safety net after editor close) |
| `SeatingChartDataSync` → `visibilitychange` | Tab becomes visible | Store via fetch |
| `SeatingChartDataSync` → `subscribeToSeatingChartRowUpdates` | Supabase `seating_charts` UPDATE | Store via `syncLayoutViewSettings` |
| `SeatingChartDataSync` → refresh broadcast channel | Cross-tab assignment/group mutate | `refreshSeatingGroupsForLayout` |
| `SeatingChartDataSync` → `SEATING_VIEW_SETTINGS_CHANGED` | Local toggle in another surface | Store via `syncLayoutViewSettings` |
| `useSeatingLayoutManager` → `applyLayoutViewSettings` | `selectedLayoutId` + cached `layouts` row | Store (instant before network) |
| Toggle handlers (`useSeatingEditorToolbarActions`) | User toggles any view setting | Optimistic store → DB → event |

---

## Related docs

- [`docs/archive/color_by_level_planning.md`](archive/color_by_level_planning.md) — color-by-level feature planning
- [`docs/architecture-plan.md`](architecture-plan.md) — Layer 1 / Layer 2 / Layer 3 boundaries
- [`docs/seat-index-logic.md`](seat-index-logic.md) — seat index math (`seatingLogic.ts`)

---

## Resolved since prior audit

| Item | Status |
|------|--------|
| Groups / assignments / positions split between hook local state and store | **Resolved** — Option C: single desk in `useSeatingStore` for editor + view |
| Save-on-exit batch reconcile | **Resolved** — exit navigates only; immediate granular persist for normal edits |
| Duplicate seat assignments across layouts | **Resolved** — `UNIQUE(student_id, seating_chart_id)` + layout-scoped delete/update/upsert |
| `group_rows` missing on column-only change | **Resolved** — `persistGroupColumnsChange` writes columns + derived rows together |
| Unwired manual layout repair | **Resolved** — Settings → Sync layout → `SEATING_REPAIR_LAYOUT` |
| Misleading `SEATING_SAVE` event name | **Resolved** — renamed to `SEATING_REPAIR_LAYOUT`; deprecated `reconcileSeatingLayoutFullReplace` alias removed |
| Duplicate view-setting state (toolbar + hook decor + store) | **Resolved** — all five flags store-canonical; `SeatingChartDataSync` central hydration worker |
| Editor vs view decor asymmetry | **Resolved** — editor and view both read `useSeatingStore` for grid/furniture/desk |
| Redundant view-settings hydration | **Resolved** — removed duplicate sync from `useSeatingEditorToolbarActions`, `useSeatingChart`, and `useSeatingLayoutManager` |
| Unused `renumberSeatIndicesForGroup` | **Resolved** — dead Layer 3 API + hook wrapper removed; empty-seat holes intentional (students keep visual place on remove) |
| Failed persist UX (no auto-retry) | **Resolved** — `withTransientRetry` in `useSeatingEditorPersistence` (2 retries, 300/800ms); rollback + error modal only after exhaustion. No offline queue by design. |
| Layout manager drawer (informational) | **Resolved** — create / rename / delete / select inventory under **Layout manager (view drawer / left nav)**; Layer 3 lifecycle APIs listed |

---

## Remaining concerns

### Partially resolved

1. **Exit refresh scope (low):** `handleClose` still calls only `refreshSeatingGroupsForLayout`, but **`SeatingChartDataSync`** now refreshes view settings on edit-mode exit as well. Net: view settings are covered indirectly; groups are fetched **twice** on every exit (see #2).

### New concerns (from Option C + repair work)

2. **Exit refresh race with in-flight persist (medium):** Closing the editor while `persistInFlightRef > 0` can trigger DB fetches that overwrite optimistic store state with stale data. No guard delays exit refresh until granular persists finish. Retry backoff extends the in-flight window slightly.

3. **Column changes not optimistic (low):** `persistGroupColumnsChange` patches store **after** API success only (unlike seat/group-position edits). Column changes in the settings menu or edit-group modal feel laggy until the API returns.

4. **Repair UI guard incomplete (low):** Toolbar disables “Sync layout” during repair or randomize only. During granular persists the menu stays enabled; opening the confirmation modal succeeds but the event handler shows “Please wait”. Consider also disabling when `persistInFlightRef > 0`.

5. **Destructive repair blast radius (medium):** `repairSeatingLayoutFromStore` deletes **all** layout assignments then re-inserts from store. If store is stale (missed rollback notice, exit refresh race #2), repair writes stale state to DB and wipes divergent rows. Intended as recovery only; high blast radius.
