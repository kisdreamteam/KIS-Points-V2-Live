# Seating Editor Save Audit

**Phase 1 of n** — inventory only. No behavior changes.

Goal: document which editor mutations update **local state**, **`useSeatingStore`**, and **Supabase**, and where the current hybrid is inconsistent.

---

## State buckets (editor session)

| Bucket | Location | Used by |
|--------|----------|---------|
| Groups list | `useSeatingChart` local `groups` | Editor canvas |
| Seat assignments | `useSeatingChart` local `groupAssignments` (Map) | Editor canvas |
| Group XY positions | `useSeatingChart` local `groupPositions` (Map) | Editor canvas |
| Unseated roster | `useSeatingStore.unseatedStudents` | Left nav |
| Selected student for placement | `useSeatingStore.selectedStudentForGroup` | Left nav + canvas |
| View settings | `useSeatingStore` (`showGrid`, `showObjects`, `layoutOrientation`, `colorByGender`, `colorByLevel`) | Toolbar, left nav styling, view mode |
| Decor mirror (grid/furniture/desk) | `useSeatingChart` local `showGrid` / `showObjects` / `layoutOrientation` | `SeatingCanvasDecor` in editor only |
| View-mode canvas data | `useSeatingStore` (`groups`, `groupAssignmentsById`, `groupPositionsById`) | **Not** updated during editor canvas edits; refreshed after exit save / sync workers |

**Exit batch save** (`saveAllChangesToDatabase`, on toolbar X): writes `position_x`, `position_y`, `group_columns`, `group_rows`, then **delete-all + re-insert** seat assignments for the layout.

Primary files: [`src/hooks/useSeatingChart.ts`](../src/hooks/useSeatingChart.ts), [`src/hooks/useSeatingEditorToolbarActions.ts`](../src/hooks/useSeatingEditorToolbarActions.ts), [`src/features/seating/stores/useSeatingStore.ts`](../src/features/seating/stores/useSeatingStore.ts), [`src/features/seating/lib/api/seating.ts`](../src/features/seating/lib/api/seating.ts).

---

## Phase 1 — Change inventory (short form)

Legend:

- **Local hook** = `useSeatingChart` React state
- **Store** = `useSeatingStore`
- **DB** = Supabase via `seating.ts`
- **Exit** = only in `saveAllChangesToDatabase` when leaving editor (X)

### View preferences (toolbar)

| Change | Local hook | Store | DB | Notes |
|--------|:----------:|:-----:|:--:|-------|
| Show grid | Yes (`showGrid`) | Yes | **Immediate** | Toolbar → `updateLayoutViewSettings` + `syncLayoutViewSettings` + event; hook syncs local decor via event/fetch |
| Show furniture | Yes (`showObjects`) | Yes | **Immediate** | Same |
| Teacher's desk left | Yes (`layoutOrientation`) | Yes | **Immediate** | Same |
| Color by gender | No | Yes | **Immediate** | Canvas / left nav read store |
| Color by level | No | Yes | **Immediate** | Same |

These are **not** exit-only — they persist on toggle today.

---

### Group structure (create / edit / delete)

| Change | Local hook | Store | DB | Notes |
|--------|:----------:|:-----:|:--:|-------|
| Add one group | Yes (via `fetchGroups`) | No | **Immediate** | `insertSeatingGroup` |
| Add multiple groups | Yes (via `fetchGroups`) | No | **Immediate** | `insertSeatingGroups` |
| Edit group (modal: name, columns) | Yes | No | **Immediate** | `updateSeatingGroupFields` |
| Inline rename group | Yes | No | **Immediate** | `updateSeatingGroupFields` |
| Update group columns (settings menu) | Yes | No | **Immediate** | `updateSeatingGroupFields` |
| Delete one team | Yes | No | **Immediate** | `deleteTeamAssignmentsAndGroup` |
| Clear one team (unseat) | Yes | No | **Immediate** | `deleteStudentSeatAssignmentsForSeatingGroupId` |
| Clear all groups | Yes | No | **Immediate** | `deleteAssignmentsForGroupsSequential` |
| Delete all groups | Yes | No | **Immediate** | Assignments delete + `deleteSeatingGroupsSequential` |

---

### Layout geometry and seating (canvas interactions)

| Change | Local hook | Store | DB | Notes |
|--------|:----------:|:-----:|:--:|-------|
| Drag group XY | Yes (`groupPositions`) | No | **Exit** | Comment in code: "persist via batch save later" |
| Add student to group (left nav / slot) | Yes (`groupAssignments`) | Yes (unseated list) | **Exit** | Local assign + remove from `unseatedStudents` |
| Remove student from group | Yes | Yes (unseated) | **Exit** | Local only for assignments |
| Swap students (same or cross group) | Yes | No | **Exit** | Local `groupAssignments` only |
| Move student between groups | Yes | No | **Exit** | Local only |
| Change seat index within group | Yes | No | **Exit** | Local only |
| `group_rows` (derived from seat count) | Yes (computed) | No | **Exit** | Saved in batch with groups; comments note "updated on Save" after some ops |

---

### Bulk seating tools

| Change | Local hook | Store | DB | Notes |
|--------|:----------:|:-----:|:--:|-------|
| Auto-assign seats | Yes (via `fetchGroups`) | Yes (unseated) | **Partial immediate** | `insertStudentSeatAssignments` runs immediately; `group_rows` still deferred to exit batch |
| Randomize seats | Yes (via `fetchGroups`) | No | **Immediate** | Deletes all layout assignments + re-inserts; unlike manual swaps |

---

### UI / selection (not persisted)

| Change | Local hook | Store | DB |
|--------|:----------:|:-----:|:--:|
| Selected student for swap | Yes | No | No |
| Selected student for group placement | No | Yes | No |
| Group settings menu open state | Yes | No | No |
| Drag-in-progress | Yes | No | No |

---

### Exit save batch (toolbar X)

Runs once; writes to DB:

1. `updateSeatingGroupsLayoutBatch` — all groups: `position_x`, `position_y`, `group_columns`, `group_rows`
2. `deleteStudentSeatAssignmentsForGroupIds` — all groups in layout
3. `insertStudentSeatAssignmentsBatched` — full replace from local `groupAssignments`
4. `refreshSeatingGroupsForLayout` — hydrates **view-mode** `useSeatingStore`

Also triggered by `SEATING_SAVE` event (if wired elsewhere).

---

## Hybrid inconsistencies (Phase 1 observations)

1. **View settings** → immediate DB; **group drag + manual seat edits** → exit batch only.
2. **Randomize** and **auto-assign** write assignments to DB immediately; **manual swap/add/remove** do not.
3. **Group CRUD** (add/delete/clear/rename/columns) → immediate DB; **position drags** → exit only (initial create position is immediate).
4. **Two desks**: editor canvas uses hook local state; view mode uses `useSeatingStore` — store canvas data updates after exit save (or separate refresh paths), not on every editor edit.
5. **Duplicate view-setting state**: grid/furniture/desk exist in both store and hook local state (synced via events/fetch, not a single source).
6. **`group_rows`**: may be stale in DB after auto-assign/clear until exit save, despite assignments already changed in DB for some flows.

---

## Out of scope (later phases)

- Target architecture (immediate vs exit-debounced per change type)
- Implementation plan
- Realtime / cross-tab behavior
- Rollback / optimistic failure handling
- Layout rename/delete from layout manager drawer

---

## Related docs

- [`docs/color_by_level_planning.md`](color_by_level_planning.md) — Appendix B (immediate view-settings persist vs exit save for layout)
- [`docs/architecture-plan.md`](architecture-plan.md) — Layer 1 / Layer 2 boundaries
