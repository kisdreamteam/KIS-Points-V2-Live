# Project Audit Report

**Date:** July 9, 2026  
**Scope:** Read-only review for security, memory efficiency, naming conventions, potential bugs, dead code, and inefficient code.  
**Note:** This report suggests improvements only. No app logic or UI was changed as part of this audit.

**Seating editor (Sep 2026):** Persistence architecture changed since this audit — immediate granular saves, unified store, manual repair. See [`seating_editor_save_audit.md`](seating_editor_save_audit.md) for current behavior and open concerns (notably large `useSeatingChart.ts`, exit refresh races).

---

## Executive Summary

The app has a clear feature-first structure and generally respects the documented 3-tier / 3-layer architecture. Supabase access is mostly isolated in `lib/api` and feature `lib/api` modules, while UI components usually receive data through hooks and props.

The biggest risks are not single catastrophic bugs, but several practical cleanup areas:

- Security depends heavily on Supabase Row Level Security (RLS), so every table touched from the browser must have verified policies.
- Dashboard route protection is client-side, so server-side middleware would add a stronger first gate.
- Some point-history/report queries aggregate data in the browser, which is fine for small classes but may become slow as point history grows.
- Student-grid and cross-tab point sync work can cause more re-renders than necessary.
- Architecture boundary drifts and large hooks make maintenance harder.
- Student numbering and some batch operations can race if multiple teachers act at the same time.

---

## Security Suggestions

### 1. Verify RLS on all client-accessed tables — **Partially resolved**

**Where:** `supabase/migrations/`, `docs/db-schema.md`, `src/features/dashboard/lib/api/points.ts`, `src/features/dashboard/lib/api/pointsReport.ts`, `src/features/students/lib/api/attendanceService.ts`, `src/features/seating/lib/api/seating.ts`, `src/lib/api/auth.service.ts`

**Finding:** The migrations in this repo clearly enable RLS for `classes`, `students`, `point_categories`, and `class_collaborators`, but the audit did not find matching RLS migrations for `profiles`, `attendance_events`, `point_events`, `custom_point_events`, `seating_charts`, `seating_groups`, or `student_seat_assignments`.

**Resolution (Sep 2026):** Version-controlled owner/collaborator RLS for `point_events` and `custom_point_events` in [`supabase/migrations/20250904120000_point_events_owner_collaborator_policies.sql`](../supabase/migrations/20250904120000_point_events_owner_collaborator_policies.sql) (helper `can_access_student`; apply/verify notes in [`supabase/README.md`](../supabase/README.md)). **Still open:** `profiles`, `attendance_events`, `seating_charts`, `seating_groups`, `student_seat_assignments`.

**Why it matters:** The browser can query and write data directly through the Supabase anon key. That is normal for Supabase apps, but the database must enforce who can read and write each row. Without RLS, a user could potentially read or change attendance, points, seating, or profile data they should not access.

**Suggestion:** Verify in Supabase that every remaining client-touched table has RLS enabled and class-owner/collaborator policies equivalent to `students` and `point_categories`. Apply the new point-events migration to remote if not already present.

### 2. Public Supabase keys are expected, but RLS is the real security boundary

**Where:** `src/lib/client.ts`

**Finding:** The app uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Why it matters:** `NEXT_PUBLIC_*` values are visible to anyone using the website. This is expected for a browser Supabase client, but it means the anon key is not a secret.

**Suggestion:** Keep service-role keys out of the browser entirely, continue ignoring `.env*`, and treat RLS policies plus RPC permissions as the real protection layer.

### 3. Browser storage is used for preferences and recent selections

**Where:** `src/features/seating/hooks/useSeatingLayoutManager.ts`, `src/features/seating/hooks/useSeatingChart.ts`, `src/components/ui/MovableToolPanel.tsx`, `src/stores/usePreferenceStore.ts`, `src/features/students/hooks/useStudentsSelection.ts`, `src/features/dashboard/components/frame/navbars/MultiSelectBottomNav.tsx`

**Finding:** The app stores selected layouts, teacher view, tool panel positions, preferences, and recent selected IDs in `localStorage`.

**Why it matters:** `localStorage` is readable by any script running on the page. It is fine for convenience settings, but it should not hold sensitive information or long-lived data that would be risky on a shared computer.

**Suggestion:** Keep this storage limited to non-sensitive preferences. For recent selections, consider clearing them on sign-out and class switch, and avoid storing names, emails, or tokens.

### 4. Collaborator and owner checks should be enforced in the database, not just the UI

**Where:** `src/features/classes/hooks/useClassManagement.ts`, `src/features/classes/lib/api/classes.ts`, `supabase/migrations/`

**Finding:** The UI prevents non-owners from managing class info and collaborators, and migrations include owner/collaborator policies for several tables.

**Why it matters:** UI checks are helpful, but users can bypass UI with direct API calls. The database must reject unauthorized changes.

**Suggestion:** Periodically audit Supabase policies and RPC definitions (`create_new_class`, `list_accessible_classes`, `lookup_teacher_by_email`, `award_points_to_student`) to confirm they enforce the same rules as the UI.

### 5. Add server-side route protection for dashboard routes

**Where:** `src/app/dashboard/layout.tsx`, `src/features/dashboard/hooks/sync/DashboardClassesSync.tsx`, `src/features/dashboard/hooks/sync/DashboardProfileSync.tsx`

**Finding:** Dashboard protection currently happens after the client app loads and checks session state. There is no `middleware.ts` gate for `/dashboard/*`.

**Why it matters:** Users without a valid session can still receive the dashboard JavaScript and shell before the client redirects them. RLS should still block data, but server-side route protection gives a stronger first layer.

**Suggestion:** Add Supabase SSR middleware for `/dashboard/*` to validate cookies and redirect unauthenticated users before rendering the dashboard.

### 6. Prefer validated user checks for security-sensitive decisions

**Where:** `src/lib/api/auth.service.ts`, `src/lib/api/auth.ts`, `src/features/dashboard/lib/api/skills.ts`

**Finding:** Some auth helpers use `supabase.auth.getSession()`.

**Why it matters:** `getSession()` reads the local session. For sensitive decisions, Supabase recommends validating the user with `getUser()` because it checks with Supabase Auth.

**Suggestion:** Use `getUser()` where code is deciding whether a user may do something important, and keep `getSession()` for lightweight UI state only.

### 7. Validate route `classId` before loading class data

**Where:** `src/features/dashboard/hooks/sync/useDashboardRouteStateSync.ts`, `src/features/dashboard/hooks/sync/DashboardStudentSync.tsx`, `src/features/dashboard/hooks/sync/dashboardStudentRefresh.ts`

**Finding:** A `/dashboard/classes/[classId]` URL can trigger data fetches for that ID before the app verifies it is in the user's accessible class list.

**Why it matters:** Correct RLS should still block unauthorized data, but the app should avoid even attempting to load class data for a class the user cannot access.

**Suggestion:** Add an app-layer guard that checks the route `classId` against accessible classes before triggering roster, attendance, or seating fetches.

### 8. Enforce signup and role restrictions outside the form

**Where:** `src/features/auth/hooks/useAuthFlow.ts`, `src/lib/api/auth.service.ts`

**Finding:** Email-domain and role restrictions are mostly enforced by React form logic.

**Why it matters:** A modified client can bypass form checks and call auth helpers directly.

**Suggestion:** Mirror these restrictions in Supabase Auth settings, hooks, database triggers, or profile creation policies.

### 9. Add security headers

**Where:** `next.config.ts`

**Finding:** The audit did not find configured security headers such as Content Security Policy, frame protection, or HSTS.

**Why it matters:** Security headers help browsers block common attack paths like clickjacking and some script injection patterns.

**Suggestion:** Add a conservative `headers()` configuration, then loosen it only where required by Supabase and external assets.

---

## Memory & Performance Efficiency

### 1. Points report fetches event rows and aggregates in the browser

**Where:** `src/features/dashboard/lib/api/pointsReport.ts`, `src/features/dashboard/hooks/usePointsReport.ts`

**Finding:** Category-filtered report totals fetch matching `point_events` rows and sum them client-side.

**Why it matters:** This is simple and works for small classes, but point history grows over time. A class with many students and months of events could download many rows just to show a single summary table.

**Suggestion:** Move category totals into a Supabase RPC or SQL view that groups by `student_id` and category server-side. That reduces network traffic and memory use.

### 2. Filtered points report can refetch often while open

**Where:** `src/features/dashboard/hooks/usePointsReport.ts`

**Finding:** The report refetches filtered totals when the `students` array changes, because the hook depends on the whole students array.

**Why it matters:** This keeps data fresh, but a points update or roster refresh can trigger a full report refetch. For a small prototype this is acceptable; for larger use it may feel sluggish.

**Suggestion:** Refetch based on a smaller key such as student IDs plus a points version/timestamp, or trigger report refresh from point-award completion events.

### 3. Large seating hook concentrates many responsibilities

**Where:** `src/features/seating/hooks/useSeatingChart.ts`

**Finding:** `useSeatingChart.ts` is large and handles fetching, layout state, group operations, randomizing, swapping, alerts, and event listeners.

**Why it matters:** Large hooks keep a lot of state and callbacks alive at once. They are also harder to reason about, which makes performance and bug fixes riskier.

**Suggestion:** Split it gradually into focused hooks: layout fetching, group CRUD, seat assignment, randomization, and editor events.

### 4. Random sorting with `Math.random() - 0.5` is inefficient and biased

**Where:** `src/features/seating/hooks/useSeatingChart.ts`

**Finding:** Random seating uses `.sort(() => Math.random() - 0.5)`.

**Why it matters:** This common shortcut does not produce a perfectly fair shuffle and can be less efficient than a proper shuffle.

**Suggestion:** Use a Fisher-Yates shuffle helper for seating randomization.

### 5. Some list counts load full rows instead of asking the database for counts

**Where:** `src/features/classes/lib/api/classes.ts`

**Finding:** `getStudentCountsByClassIds` selects `class_id` for all students and counts them in JavaScript.

**Why it matters:** For small classes this is fine. At scale, it downloads rows only to count them.

**Suggestion:** Use a database aggregate or RPC for counts when the data grows.

### 6. Student grid work can multiply during point updates

**Where:** `src/features/students/components/cards/StudentCard.tsx`, `src/features/students/StudentsCardsGrid.tsx`, `src/features/students/stores/dashboardStudentSelectors.ts`

**Finding:** A point update replaces the student list, the grid re-sorts students, and each card performs list/selection checks during render.

**Why it matters:** With typical class sizes this is manageable, but frequent awards or multi-select operations can cause many small recalculations at once.

**Suggestion:** Consider normalizing students by ID in the store, using `Set`-based selection checks, and memoizing sorted IDs so one student's point change does not make every card do avoidable work.

### 7. Cross-tab point sync updates students one at a time — **Resolved**

**Where:** `src/features/dashboard/hooks/sync/DashboardStudentSync.tsx`, `src/features/dashboard/stores/useDashboardStore.ts`

**Finding:** The store has a good batched `applyPointsDelta` pattern, but some sync paths update students in a loop.

**Resolution (Sep 2026):** Added `applyStudentPointsUpdates` (one store write for N absolute totals). Cross-tab broadcast applies the full `updates` array once; `postgres_changes` row updates are coalesced on a microtask before the same batch path. Seating assignment points sync remains a single batched call.

### 8. Student roster cache is unbounded

**Where:** `src/features/dashboard/hooks/sync/dashboardStudentRefresh.ts`

**Finding:** A module-level cache keeps class rosters for visited classes without an eviction policy.

**Why it matters:** Long sessions across many classes can slowly grow memory usage.

**Suggestion:** Add a small LRU limit, clear old class entries on class switch, or clear the cache on sign-out.

### 9. Point log downloads all history before paginating

**Where:** `src/features/dashboard/lib/api/points.ts`, `src/features/dashboard/hooks/useClassPointLog.ts`

**Finding:** The point log fetches all standard and custom point events for all class students, then paginates in the browser.

**Why it matters:** Older classes can accumulate a lot of point history. Downloading everything makes the first open slower and uses more memory.

**Suggestion:** Add server-side pagination, a date range, or a capped query with cursor/offset support.

### 10. Random picker keeps a separate roster copy

**Where:** `src/features/dashboard/hooks/useRandomStudentFlow.ts`, `src/features/dashboard/tools/Random.tsx`

**Finding:** Random picker fetches and stores its own students separately from the dashboard store/cache.

**Why it matters:** This keeps duplicate roster data in memory and can drift from the main roster if sync timing differs.

**Suggestion:** Reuse dashboard roster data when possible, and only fetch extra Random-specific fields such as `has_been_picked` when needed.

---

## Naming & Architecture Conventions

### 1. Legacy alias exports keep old names alive — **Resolved**

**Where:** `src/features/classes/lib/api/classes.ts`, `src/features/students/lib/api/students.ts`, `src/features/dashboard/lib/api/points.ts`

**Finding:** Several files exported newer function names and older aliases, such as `fetchStudentsByClassId`, `insertStudent`, and `awardPointsToStudents`.

**Resolution (Sep 2026):** Migrated all call sites to canonical names (`list*` / `get*` / `create*` / `update*`) and removed the alias export blocks.

### 2. `useSeatingLayoutManager` lives in global hooks but is seating-specific — **Resolved**

**Where:** was `src/hooks/useSeatingLayoutManager.ts`

**Finding:** The hook is tightly tied to seating layouts but lived in the shared `src/hooks` folder.

**Resolution (Sep 2026):** Moved to `src/features/seating/hooks/useSeatingLayoutManager.ts` with other seating orchestration hooks.

### 3. Orchestration hooks are split across two homes — **Resolved**

**Where:** `src/hooks/`, `src/features/*/hooks/`

**Finding:** Some orchestration hooks lived globally (`useClassPointLog`, `usePointsReport`, `useSeatingChart`), while many similar hooks lived under feature folders.

**Resolution (Sep 2026):** Clarified placement in `source-of-truth.md` §6. Rehomed seating hooks under `features/seating/hooks/` and point log/report under `features/dashboard/hooks/`. `src/hooks/` retains only cross-feature UI utilities (`useAnchoredDropdownPortal`, `useCloseDrawersOnClickOutside`).

### 4. Dashboard chrome sometimes performs orchestration

**Where:** `src/features/dashboard/components/frame/navbars/LeftNav.tsx`, `src/features/dashboard/components/frame/navbars/SeatingEditorLeftNav.tsx`, `src/features/dashboard/layouts/DashboardShell.tsx`

**Finding:** Some Tier 1 chrome changes global state directly or mounts modal orchestration directly.

**Why it matters:** Chrome is easiest to maintain when it mostly displays navigation and delegates behavior to sync hooks or Tier 2 hosts.

**Suggestion:** When touching these areas, move behavior toward the existing host/controller and sync-hook patterns.

### 5. Some Tier 3 UI still reads stores or imports hook helpers

**Where:** `src/features/classes/components/cards/ClassCard.tsx`, `src/features/dashboard/components/menus/LeftNavWebsitesMenu.tsx`, `src/features/dashboard/components/PointsLogDrawer.tsx`, `src/features/dashboard/components/points-report/PointsReportTable.tsx`

**Finding:** A few presentational components still read stores or import types/helpers from hook files.

**Why it matters:** It blurs the boundary between UI and orchestration, making components harder to reuse and test.

**Suggestion:** Treat these as cleanup targets when those files are next edited; pass data and formatter helpers down through props where practical.

### 6. Dashboard content has a few viewport-height exceptions

**Where:** `src/features/dashboard/DashboardView.tsx`, `src/features/dashboard/components/frame/navbars/LeftNav.tsx`

**Finding:** The audit found `h-screen` / `max-h-screen` usage inside dashboard content/chrome.

**Why it matters:** Dashboard internals are supposed to rely on the shell grid with `h-full` and `min-h-0`; viewport height classes can cause scroll or overflow quirks.

**Suggestion:** Replace inner viewport-height classes with grid-safe sizing when touching these files.

### 7. Naming style is mostly good, but API modules mix verbs

**Where:** `src/features/students/lib/api/students.ts`, `src/features/classes/lib/api/classes.ts`, `src/features/dashboard/lib/api/points.ts`

**Finding:** Function names previously mixed `list`, `fetch`, `insert`, `create`, and legacy aliases. Alias exports are gone (see § Naming #1). A few `fetch*` names remain (e.g. `fetchClassById`).

**Why it matters:** Mixed verbs make it harder for a new developer to guess the right function name.

**Suggestion:** Prefer a consistent vocabulary: `list*` for collections, `get*` for one value, `create*`, `update*`, `delete*`; rename remaining `fetch*` opportunistically.

### 8. Icon file names use mixed conventions — **Resolved**

**Where:** `src/components/ui/icons/`

**Finding:** Icon files used styles like `iconAddPlus.tsx`, `IconTimerClock`, `AddPlusIcon.tsx`, `CanvasPointsReportIcon.tsx`, and `EditorAddMultipleIcon.tsx`.

**Resolution (Sep 2026):** Standardized on `{Name}Icon.tsx` / `{Name}Icon` exports. Renamed all `icon*.tsx` files; deleted unused `iconAddPlus`, `iconAutoAssign`, `iconDocumentClock`, `iconPresentationBoard`. Kept distinct pencil glyphs as `EditPencilIcon` (toolbar asset) and `EditPencilOutlineIcon` (seating editor stroke).

### 9. Dependency versions should be aligned

**Where:** `package.json`

**Finding:** The app uses `next` `^16.0.7`, but `eslint-config-next` is `15.5.4`.

**Why it matters:** ESLint rules may not exactly match the installed Next.js version, which can cause confusing lint behavior.

**Suggestion:** Align `eslint-config-next` with the installed Next major version when the package ecosystem supports it.

### 10. Dev and production build engines differ — **Resolved**

**Where:** `package.json`

**Finding:** `dev` uses `next dev --webpack`, while `build` uses `next build --turbopack`.

**Resolution (Sep 2026):** Documented as an intentional split in [`tech-stack.md`](tech-stack.md) (Webpack for local HMR stability; Turbopack for production builds). Also noted in [`project-scope.md`](project-scope.md) §6 and the root `README.md`. Scripts left unchanged.

---

## Potential Bugs

### 1. Student numbers can race during simultaneous adds

**Where:** `src/features/students/lib/api/students.ts`

**Finding:** New student numbers are assigned by reading the current max number and adding one in client-driven code.

**Why it matters:** If two teachers add students at the same time, both can calculate the same next number before either insert finishes.

**Suggestion:** Move student-number assignment into a database transaction/RPC, or add a uniqueness constraint plus retry logic.

### 2. Class deletion may leave related records behind

**Where:** `src/features/classes/lib/api/classes.ts`

**Finding:** `deleteClassPermanently` deletes students and then the class. It does not visibly delete point events, custom point events, seating charts, groups, assignments, attendance events, or collaborators in this function.

**Why it matters:** If the database does not cascade all related tables, deleting a class can leave orphaned history or fail because child rows still exist.

**Suggestion:** Confirm foreign-key cascade rules in Supabase. If they are not comprehensive, use a database RPC for class deletion.

### 3. Points reset may not reset all history consistently

**Where:** `src/features/students/lib/api/students.ts`, `docs/db-schema.md`

**Finding:** `resetPointsByStudentIds` sets cached `students.points` to zero, and a separate helper deletes custom point events. Standard `point_events` are not deleted here.

**Why it matters:** The visible total can be zero while the point log/report history still contains old standard events. That may be intentional, but it can confuse teachers.

**Suggestion:** Decide and document the product rule: reset totals only, reset custom events only, or reset all history. Align reports with that rule.

### 4. Class creation silently returns if fallback lookup fails

**Where:** `src/features/classes/lib/api/classes.ts`

**Finding:** If `create_new_class` succeeds but does not return a class ID, the fallback lookup can fail and `createClass` simply returns without throwing.

**Why it matters:** The UI may think creation completed while the icon update did not happen, or the class does not appear as expected.

**Suggestion:** Throw an explicit error when the new class ID cannot be resolved.

### 5. Points report popover positioning may overflow on small screens

**Where:** `src/features/dashboard/components/points-report/CategoryFilterPopover.tsx`

**Finding:** The popover uses a fixed position from the button and only clamps the left edge.

**Why it matters:** On small screens or near the bottom of the viewport, the popup can go off-screen.

**Suggestion:** Reuse the existing anchored dropdown helper pattern used by toolbar menus, or clamp both horizontal and vertical edges.

---

## Dead Code & Inefficient Code

### 1. Unused drag-and-drop dependency

**Where:** `package.json`, `package-lock.json`

**Finding:** `@hello-pangea/dnd` is installed but no imports were found.

**Why it matters:** Unused dependencies increase install size, audit surface, and potentially bundle size if accidentally imported later.

**Suggestion:** Remove it unless drag-and-drop work is planned soon.

### 2. Debug logs remain in seating chart logic — **Resolved**

**Where:** `src/features/seating/hooks/useSeatingChart.ts`

**Finding:** There were `console.log` calls for swapping students and opening group edit modal.

**Resolution (Sep 2026):** Removed both debug `console.log` calls. Error-path `console.error` retained.

### 3. Many user-facing errors still use browser `alert`

**Where:** `src/features/seating/hooks/useSeatingChart.ts`, `src/features/classes/hooks/useClassManagement.ts`, `src/features/dashboard/hooks/useSubmitPointAward.ts`, and others

**Finding:** The app uses many `alert()` and one `confirm()` call for errors and confirmations.

**Why it matters:** Alerts block the browser, are hard to style, and can feel inconsistent with the rest of the app's modal system.

**Suggestion:** Gradually replace alerts with existing modal/toast patterns. This is a UX cleanup, not an urgent security issue.

### 4. Duplicate sorting logic exists in multiple places

**Where:** `src/features/students/stores/dashboardStudentSelectors.ts`, `src/features/students/hooks/useSortedStudents.ts`, `src/features/dashboard/hooks/usePointsReport.ts`

**Finding:** Student sorting rules are implemented in more than one place.

**Why it matters:** Duplicate sorting logic can drift, creating small differences between grid, reports, and nav behavior.

**Suggestion:** Move roster sorting into one shared utility and reuse it everywhere.

### 5. Duplicate or unused icons — **Resolved**

**Where:** was `src/components/ui/icons/iconAddPlus.tsx`, `EditPencilIcon.tsx`, `iconEditPencil.tsx` (plus unused `iconAutoAssign`, `iconDocumentClock`, `iconPresentationBoard`)

**Finding:** Several icons were unused, and pencil icons existed in two glyph variants.

**Resolution (Sep 2026):** Removed unused icons during the PascalCaseIcon naming cleanup. Kept both pencil glyphs under distinct names (`EditPencilIcon`, `EditPencilOutlineIcon`) because the SVGs differ.

### 6. Generated build output should stay out of git — **Resolved**

**Where:** `.gitignore`, `.next/`

**Finding:** `.gitignore` already ignored `/.next/`, but IDE/status snapshots sometimes listed many local `.next` files and made the tree look dirty.

**Resolution (Sep 2026):** Confirmed zero tracked `.next` files. Broadened ignore to `.next/` (and `out/`) in `.gitignore`. Documented the “never commit generated Next output; use `dev:clean` when clearing cache” policy in [`tech-stack.md`](tech-stack.md).

### 7. Some helper comments describe behavior that should be encoded in names/tests

**Where:** `src/features/seating/hooks/useSeatingChart.ts`, `src/lib/iconUtils.ts`, `src/features/dashboard/stores/useDashboardStore.ts`

**Finding:** A few comments explain important invariants, such as seat-index behavior and static icon counts.

**Why it matters:** Comments help, but important business rules are safer when backed by tests or small named helpers.

**Suggestion:** When tests are added, cover seat-index behavior, points reset behavior, and attendance filtering.

---

## Recommended Priority List

### High Priority

1. Move student-number assignment into a database-safe flow to avoid duplicate numbers.
2. Confirm class deletion cascades or replace it with a database RPC.
3. Remove unused `@hello-pangea/dnd` if drag-and-drop is not planned.
4. Version-control remaining RLS gaps (`profiles`, `attendance_events`, seating tables).

### Medium Priority

1. Move points-report and point-log aggregation/pagination server-side when point history grows.
2. Split `useSeatingChart.ts` into smaller hooks and reduce duplicate seating state.
3. Normalize student grid subscriptions and consolidate sorting utilities.
4. Replace `Math.random() - 0.5` shuffles with Fisher-Yates.
5. Add an eviction policy for roster caches.
6. Align `eslint-config-next` with the installed Next.js major version.

### Low Priority

1. Replace browser alerts with app-native modals/toasts.

---

## Final Notes

This codebase is in decent shape for a prototype: state is mostly centralized, Supabase access is mostly isolated, and the dashboard/app-folder boundaries are largely respected. The most important next step is hardening the data layer, because the browser app is only as secure as the database policies behind it.
