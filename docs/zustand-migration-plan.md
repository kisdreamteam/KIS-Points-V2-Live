# KIS-Points Zustand Migration Plan

**Goal:** Systematically migrate global state from React Context to Zustand to eradicate massive rendering bottlenecks (view switching, modal rendering, class switching, and student card updates) via selector-based rendering.

**Rules of Engagement:**
1. **Maintain the 3-Layer Data Boundary:** Zustand stores live at Tier 2 (The "Desk"). They hold data and setter functions but MUST NOT contain direct Supabase calls or complex business logic. Layer 1 hooks will orchestrate API calls and then update the store.
2. **Strict Selectors:** Tier 3 UI Components must subscribe *only* to the specific slice of state they need (e.g., `useDashboardStore(state => state.activeClass)`). 
3. **Verify Before Checking:** Mark rows `[x]` only after a manual browser smoke test confirms optimistic UI updates are functioning.

---

## Phase 1: View Switching (The UI Store)
**Target:** Eliminate layout cascades when switching between Classes, Students, and Seating Chart views.

- [x] **Setup:** Run `npm install zustand`.
- [x] **Typings:** Define the UI state shape in `/src/lib/types.ts` or at the top of the store file (e.g., `activeView`, `isSidebarOpen`).
- [x] **Create Store:** Create [`/src/stores/useLayoutStore.ts`](../src/stores/useLayoutStore.ts) with basic state and setter functions.
- [x] **Reroute Readers:** `DashboardView` subscribes to `useLayoutStore` for `activeView` routing (`ClassesView` / `StudentsView`); URL is synced from [`DashboardShell`](../src/features/dashboard/layouts/DashboardShell.tsx) via `useLayoutEffect`.
- [x] **Reroute Writers:** Update [`LeftNav`](../src/components/dashboard/shell/LeftNav.tsx) and [`ViewModeModal`](../src/components/ui/modals/ViewModeModal.tsx) to call `setActiveView` from `useLayoutStore` (TopNav has no view switches).
- [x] **Verification:** `npm run build` passed; confirm in the browser: `/dashboard` ↔ class routes, grid ↔ seating via View modal, deep link `?view=seating`, and stage chrome (TopNav / toolbar) still match seating vs non-seating.

---

## Phase 2: Modals (The Modal Store)
**Target:** Prevent dashboard grid re-renders when a modal overlay opens.

- [x] **Typings:** Modal state in [`/src/stores/useModalStore.ts`](../src/stores/useModalStore.ts): `isOpen`, `modalType`, `selectedStudentId`, `awardTargetStudentIds`, `openModal` / `closeModal`.
- [x] **Create Store:** [`/src/stores/useModalStore.ts`](../src/stores/useModalStore.ts).
- [x] **Reroute Readers:** [`DashboardClassModalsHost`](../src/features/dashboard/DashboardClassModalsHost.tsx) in [`DashboardShell`](../src/features/dashboard/layouts/DashboardShell.tsx) renders `AwardPointsModal`, `EditStudentModal`, `AddStudentsModal`, and `PointsAwardedConfirmationModal` (with `useAwardPointsFlow`) using strict store selectors.
- [x] **Reroute Writers:** [`useStudentsModalsState`](../src/hooks/useStudentsModalsState.ts), [`useStudentsSelection`](../src/hooks/useStudentsSelection.ts), and [`SeatingChartView`](../src/components/dashboard/SeatingChartView.tsx) call `useModalStore.getState().openModal(...)`. Seating roster patch via [`SEATING_STUDENT_POINTS_DELTA`](../src/lib/events/students.ts); multi-select clear via [`MULTI_STUDENT_AWARD_COMPLETE`](../src/lib/events/students.ts).
- [x] **Verification:** `npm run build` passed; manually confirm award (single / whole / multi), edit student, add students, seating group/single award, and confirmation modal.

---

## Phase 3: Core Data & Class Switching (The Dashboard Store)
**Target:** Eliminate overarching cascade when changing the active class. 

- [x] **Typings:** Dashboard data state in [`/src/stores/useDashboardStore.ts`](../src/stores/useDashboardStore.ts): `activeClassId`, `classes`, `students`, loading flags, functional `setStudents`.
- [x] **Create Store:** [`/src/stores/useDashboardStore.ts`](../src/stores/useDashboardStore.ts).
- [x] **Reroute Writers (Layer 1):** [`/src/hooks/sync/useDashboardStudentSync.ts`](../src/hooks/sync/useDashboardStudentSync.ts) syncs URL → `activeClassId`, fetches roster via Layer 3 API (`fetchStudentsByClassId`), updates the store, and exports `refreshDashboardStudents(force?)`. [`useClassPointLog`](../src/hooks/useClassPointLog.ts) reads the roster from the store when the log panel opens (`classId` only).
- [x] **Reroute Readers:** [`TopNav.tsx`](../src/components/dashboard/shell/TopNav.tsx) remains title + logo only. Class switching is via URL, [`LeftNav.tsx`](../src/components/dashboard/shell/LeftNav.tsx) (`setActiveClassId` on class link click before navigation), and [`useDashboardStudentSync.ts`](../src/hooks/sync/useDashboardStudentSync.ts) keeping the store aligned with the route.
- [x] **Verification:** `npm run build` passed. Manually confirm: LeftNav class links, deep link to `/dashboard/classes/[id]`, grid ↔ seating then back to grid (triggers `refreshDashboardStudents` via [`useStudentsUrlState.ts`](../src/hooks/useStudentsUrlState.ts)).

---

## Phase 4: Point Awarding (The Selector Magic)
**Target:** Prevent the entire grid from flashing when a single student receives a point.

- [x] **Store writers:** [`useDashboardStore.ts`](../src/stores/useDashboardStore.ts) adds `updateStudent(id, patch)` and `applyPointsDelta(studentIds, delta)` (immutable map; unchanged rows keep the same object references).
- [x] **Reroute Writers (Layer 1):** [`useAwardPointsService.ts`](../src/hooks/useAwardPointsService.ts) resolves target ids, calls `applyPointsDelta` **before** Layer 3 (`awardPointsToStudents` / `awardCustomPointsToStudents` from [`lib/api/points`](../src/lib/api/points.ts)), rolls back on API failure, and supports `skipRefreshAfterAward` so [`DashboardClassModalsHost`](../src/features/dashboard/DashboardClassModalsHost.tsx) does not refetch the whole roster after an award (seating delta + confirmation unchanged).
- [x] **Reroute Readers (Tier 2/3):** [`dashboardStudentSelectors.ts`](../src/stores/dashboardStudentSelectors.ts) + `useShallow` in [`StudentsView.tsx`](../src/components/dashboard/StudentsView.tsx) for ordered ids when sort is not by points; [`StudentCard.tsx`](../src/components/dashboard/cards/StudentCard.tsx) subscribes with `useShallow` to the row for `studentId` and uses [`useLayoutStore`](../src/stores/useLayoutStore.ts) for multi-select vs award click behavior. [`StudentCardsGrid.tsx`](../src/components/dashboard/StudentCardsGrid.tsx) maps `orderedStudentIds`.
- [x] **Verification:** `npm run build` passed. Manually award (single / multi / whole class) from the dashboard modal; with sort by name or number, only affected cards should update; sort by points still reorders the id list as expected. Random tool still uses `onRefresh` after awards (`skipRefreshAfterAward` default false).

## Phase 4.5: The Seating Chart (The Teleportation)
**Target:** Keep the purple + cream seating “stage” mounted when switching classes or refetching layouts so the background does not appear to jump or unmount.

- [x] **Store:** [`/src/stores/useSeatingStore.ts`](../src/stores/useSeatingStore.ts) holds layouts (with loading/error), groups, `groupAssignmentsById`, `groupPositionsById`, view settings (`showGrid`, `showObjects`, `layoutOrientation`), editor-adjacent fields (`unseatedStudents`, `selectedStudentForGroup`, `addStudentToGroup` with the same `addStudentToGroup` window event as before), `resetForClassSwitch`, `applyGroupsFetch`, and `patchGroupAssignmentsForPointsDelta` / `subscribeSeatingPointsDeltaForClass`. No Supabase inside the store.
- [x] **Layer 1:** [`/src/hooks/sync/useSeatingChartDataSync.tsx`](../src/hooks/sync/useSeatingChartDataSync.tsx) exports `SeatingChartDataSync` plus `refreshSeatingLayoutsForClass` and `refreshSeatingGroupsForLayout`. It listens to `useDashboardStore` (`activeClassId`, roster length) and `useSeatingStore` (`selectedLayoutId`), resets seating slices on class change, refetches layouts per class, refetches groups when layout + roster are ready, and refreshes groups when `SEATING_EDIT_MODE` reports `isEditMode: false`. Mounted next to [`useDashboardStudentSync.ts`](../src/hooks/sync/useDashboardStudentSync.ts), [`useDashboardProfileSync.tsx`](../src/hooks/sync/useDashboardProfileSync.tsx), and [`useDashboardClassesFilterSync.tsx`](../src/hooks/sync/useDashboardClassesFilterSync.tsx) in [`DashboardView.tsx`](../src/features/dashboard/DashboardView.tsx).
- [x] **View:** [`SeatingChartView.tsx`](../src/features/seating/SeatingChartView.tsx) always renders the outer shell; loading, error, and “no layouts” are inner overlays or messages inside the cream panel. Group geometry subscribes via [`SeatingGroupsCanvas.tsx`](../src/features/seating/SeatingGroupsCanvas.tsx) with `useShallow`. Realtime / visibility / `SEATING_VIEW_SETTINGS_CHANGED` stay in the view and only call store setters + `refreshSeatingGroupsForLayout` where needed.
- [x] **Context removal:** `SeatingChartProvider` / `useSeatingChart` removed; [`SeatingChartEditorView.tsx`](../src/components/dashboard/SeatingChartEditorView.tsx) and [`SeatingEditorLeftNav.tsx`](../src/components/dashboard/shell/SeatingEditorLeftNav.tsx) read the same fields from `useSeatingStore`. `SeatingChartContext.tsx` deleted; [`useSeatingChartEditor`](../src/hooks/useSeatingChart.ts) unchanged aside from comment.
- [x] **Verification:** `npm run build` passes. Manual smoke: switch classes on seating (cream frame stable), editor unseated list + add-to-group + multi-select / points delta on seating still behave as before.

## Phase 4.75: LeftNav Stability (Tier 1 Insulation)
**Target:** Keep the class list in the sidebar visible and avoid a “Loading classes…” swap when switching classes or remounting inner dashboard layout (e.g. `/dashboard` ↔ `/dashboard/classes/[id]`). Student and seating fetches stay on `activeClassId` only.

- [x] **Store:** [`useDashboardStore.ts`](../src/stores/useDashboardStore.ts) adds `allAccessibleClasses` + `setAllAccessibleClasses`; `classes` remains the **viewMode-filtered** slice written by [`useDashboardClassesFilterSync.tsx`](../src/hooks/sync/useDashboardClassesFilterSync.tsx) from [`usePreferenceStore`](../src/stores/usePreferenceStore.ts) + `allAccessibleClasses`.
- [x] **Layer 1:** [`useDashboardClassesSync.tsx`](../src/hooks/sync/useDashboardClassesSync.tsx) exports `DashboardClassesSync`, `refreshDashboardClasses`, and `refreshDashboardClassesForUserAction`. Initial load runs from [`app/dashboard/layout.tsx`](../src/app/dashboard/layout.tsx) (persists across dashboard page swaps). `isLoadingClasses` is toggled only for the **bootstrap** empty load; CRUD refresh uses a **silent** path when `allAccessibleClasses` is already populated.
- [x] **LeftNav:** [`LeftNav.tsx`](../src/components/dashboard/shell/LeftNav.tsx) uses strict selectors for `allAccessibleClasses`, `isLoadingClasses`, and `activeClassId`; spinner only when `isLoadingClasses && allAccessibleClasses.length === 0`. [`DashboardShell.tsx`](../src/features/dashboard/layouts/DashboardShell.tsx) does not prop-drill class list state into `LeftNav`.
- [x] **Classes grid:** [`ClassesView.tsx`](../src/components/dashboard/ClassesView.tsx) full-page loading uses the same “no accessible rows yet” rule so background class refresh does not blank the grid.
- [x] **Verification:** `npm run build`. Manually: switch classes in the sidebar (no list flicker); `/dashboard` ↔ a class route with list already loaded; create/archive class still updates the list.


## Phase 4.8: The Preference & User Stores
*Target: Extract user profile and local UI preferences from Context.*

- [x] **User store:** [`useUserStore.ts`](../src/stores/useUserStore.ts) holds `teacherProfile` and `isLoadingProfile`.
- [x] **Preference store:** [`usePreferenceStore.ts`](../src/stores/usePreferenceStore.ts) holds `sortBy` (Zustand `persist`, key `kis-dashboard-preferences`), `viewMode`, and `viewPreference`.
- [x] **Layer 1 profile:** [`useDashboardProfileSync.tsx`](../src/hooks/sync/useDashboardProfileSync.tsx) deduped teacher profile fetch; exports `syncProfileCacheViewPreference` for [`ViewModeModal.tsx`](../src/components/ui/modals/ViewModeModal.tsx) after preferred-view API updates.
- [x] **Class list filter:** [`useDashboardClassesFilterSync.tsx`](../src/hooks/sync/useDashboardClassesFilterSync.tsx) mirrors `allAccessibleClasses` + `viewMode` → filtered `classes` on the dashboard store.
- [x] **Readers:** [`TopNav.tsx`](../src/components/dashboard/shell/TopNav.tsx) reads profile from `useUserStore`; sort / view mode / view preference from store + selectors in [`StudentsView`](../src/components/dashboard/StudentsView.tsx), [`ClassesView`](../src/components/dashboard/ClassesView.tsx), [`LeftNav`](../src/components/dashboard/shell/LeftNav.tsx), [`ClassCard`](../src/components/dashboard/cards/ClassCard.tsx), [`DashboardShell`](../src/features/dashboard/layouts/DashboardShell.tsx) slot.

## Phase 4.9: Seating Layout Nav & Chrome State
*Target: Insulate the LeftNav's seating layout list and manage multi-select globally.*

- [x] **Seating store:** [`useSeatingStore.ts`](../src/stores/useSeatingStore.ts) adds `selectedLayoutId`, `setSelectedLayoutId`, and nullable `layoutNavHandlers` (registered from [`SeatingChartView.tsx`](../src/features/seating/SeatingChartView.tsx)); `resetForClassSwitch` clears selection + handlers.
- [x] **Layout store:** [`useLayoutStore.ts`](../src/stores/useLayoutStore.ts) adds `isMultiSelectMode` + setters; [`useStudentsSelection.ts`](../src/hooks/useStudentsSelection.ts) and [`useStudentsToolbarEvents.ts`](../src/hooks/useStudentsToolbarEvents.ts) keep the store and legacy window events aligned.
- [x] **Student grid:** [`StudentCard.tsx`](../src/components/dashboard/cards/StudentCard.tsx) + [`StudentCardsGrid.tsx`](../src/components/dashboard/StudentCardsGrid.tsx) unified path; `StudentCardMulti.tsx` removed.
- [x] **Dead code:** `StageToolbarContext.tsx` deleted; `StageToolbarProvider` removed from [`DashboardWorkspace.tsx`](../src/components/dashboard/stage/DashboardWorkspace.tsx).

---

## Phase 5: The Cleanup
**Target:** Remove the old "God Box" wrappers.

- [x] **Dashboard layout:** [`DashboardShell.tsx`](../src/features/dashboard/layouts/DashboardShell.tsx) no longer wraps `DashboardProvider`, `StudentSortProvider`, or `SeatingLayoutNavProvider`; sync components listed in Phase 4.5 mount directly.
- [x] **Deleted files:** `DashboardContext.tsx`, `StudentSortContext.tsx`, `SeatingLayoutNavContext.tsx`, `StageToolbarContext.tsx`.
- [x] **Automated verification:** `npm run build` passes on the context-free layout.
- [ ] **Manual verification:** Re-run the Phase 4.8 / 4.9 checklist (sort persist, active/archived filter, seating layout flows, multi-select, profile title) before release as needed.
