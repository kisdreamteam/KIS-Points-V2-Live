# KIS-Points Refactor Checklist

**Goal:** Migrate the codebase to the 3-Tier/3-Layer blueprint defined in [`architecture-plan.md`](architecture-plan.md) (see **§3 Directory Structure Map** for the canonical folder layout) without changing existing behavior.

**Rules of Engagement:**
1. **One Task = One PR/Session.** Do not mix structural moves with feature additions or cosmetic cleanups.
2. **Verify Before Checking.** Only mark a task `[x]` after verifying the behavior still works in the browser.
3. **Bottom-Up Data Extraction:** Always extract the `supabase` calls to [`/src/lib/api/`](../src/lib/api/) before changing the React component's UI structure.

---

## Phase 1: Baseline & Smoke Test
*Goal: Ensure we know exactly what is broken before we fix it.*

- [ ] Run a manual smoke test (Log in, view dashboard, award a point, view seating chart). Note any existing bugs so we don't blame the refactor later.
- [ ] Ensure `.cursorrules` is in the root directory and [`architecture-plan.md`](architecture-plan.md) is in `/docs/`.

---

## Phase 2: The Plumbing (Data Layer 3)
*Goal: Remove ALL direct `createClient` and `supabase` imports from React UI components and Contexts. Move them strictly to [`/src/lib/api/`](../src/lib/api/) (Layer 3 in [architecture-plan.md](architecture-plan.md) §2).*

**Auth & Users**
- [x] Move [`LoginForm.tsx`](../src/components/ui/auth/LoginForm.tsx) supabase calls to [`auth.ts`](../src/lib/api/auth.ts)
- [x] Move [`SignupForm.tsx`](../src/components/ui/auth/SignupForm.tsx) supabase calls to [`auth.ts`](../src/lib/api/auth.ts)
- [x] Move [`ForgotPasswordForm.tsx`](../src/components/ui/auth/ForgotPasswordForm.tsx) & [`ResetPasswordForm.tsx`](../src/components/ui/auth/ResetPasswordForm.tsx) calls to [`auth.ts`](../src/lib/api/auth.ts)

**Core Dashboard Data**
- [x] Move former dashboard context class/roster fetching into [`students.ts`](../src/lib/api/students.ts) and [`classes.ts`](../src/lib/api/classes.ts) (legacy `DashboardContext.tsx` removed; see [`zustand-migration-plan.md`](zustand-migration-plan.md))
- [x] Move [`CreateClassForm.tsx`](../src/components/ui/forms/CreateClassForm.tsx) calls to [`classes.ts`](../src/lib/api/classes.ts)
- [x] Move [`StudentsView.tsx`](../src/components/dashboard/StudentsView.tsx) calls to [`students.ts`](../src/lib/api/students.ts) (Layer 3 verified: no `createClient` in view/modals/grid; points via [`awardPointsService`](../src/lib/awardPointsService.ts) → [`points.ts`](../src/lib/api/points.ts); students via context + API modals)
- [x] Move [`ClassesView.tsx`](../src/components/dashboard/ClassesView.tsx) calls to [`classes.ts`](../src/lib/api/classes.ts) (classes grid view)
- [x] Classes UI sub-components ([`EditClassModalRoot.tsx`](../src/components/ui/modals/EditClassModalRoot.tsx) via [`EditClassModal` façade](../src/components/ui/modals/EditClassModal.tsx), [`CreateClassModal.tsx`](../src/components/ui/modals/CreateClassModal.tsx), [`ClassCardsGrid.tsx`](../src/components/dashboard/ClassCardsGrid.tsx)): Layer 3 verified — no direct Supabase; `@/lib/api/*` only
- [x] Extract Supabase from [`SeatingChartView.tsx`](../src/components/dashboard/SeatingChartView.tsx) and [`SeatingChartEditorView.tsx`](../src/components/dashboard/SeatingChartEditorView.tsx)

**Features**
- [x] Align [`points.ts`](../src/lib/api/points.ts) with standard API formatting
- [x] Move [`SeatingChartView.tsx`](../src/components/dashboard/SeatingChartView.tsx) and [`SeatingChartEditorView.tsx`](../src/components/dashboard/SeatingChartEditorView.tsx) calls to [`seating.ts`](../src/lib/api/seating.ts)
- [x] Move Student/Skill modal flows to respective API files ([`students.ts`](../src/lib/api/students.ts), [`skills.ts`](../src/lib/api/skills.ts), etc.)
- [x] Layer 3 seating chart extraction with real-time cross-tab sync ([`seating.ts`](../src/lib/api/seating.ts) + editor/view listeners)

---

## Phase 3: The Bridge & State Management
*Goal: Connect the UI to the new [`/src/lib/api/`](../src/lib/api/) layer using optimized, modular custom hooks and Contexts.*

- [x] **Auth:** Auth state managed cleanly via standard layout/context orchestrators.
- [x] **Points:** Implemented [`useAwardPointsService.ts`](../src/hooks/useAwardPointsService.ts) (integration) + [`awardPointsService.ts`](../src/lib/awardPointsService.ts) (domain), and [`useAwardPointsFlow.ts`](../src/hooks/useAwardPointsFlow.ts) for confirmation/modal glue.
- [x] **Seating:** Editor “desk” state, DnD, and real-time sync live in [`useSeatingChartEditor`](../src/hooks/useSeatingChart.ts) with [`useSeatingStore`](../src/features/seating/stores/useSeatingStore.ts) (legacy `SeatingChartContext.tsx` removed; see [`zustand-migration-plan.md`](zustand-migration-plan.md)).
- [x] **Students:** Implemented modular hooks under [`/src/hooks/`](../src/hooks/) (`useStudentsSelection.ts`, `useStudentsModalsState.ts`, `useStudentsToolbarEvents.ts`, …).
- [x] **Performance Optimization:** Wrapped provider values in `useMemo` and orchestrators in `useCallback` where contexts existed; dashboard/seating chrome now use Zustand strict selectors (see [`zustand-migration-plan.md`](zustand-migration-plan.md)).

---

## Phase 4: The Final Polish (Sweeping the Dust)
*Goal: Remove tech debt, orphaned files, and unused imports left over from rapid prototyping without breaking the new 3-Layer architecture.*

- [x] **Unused Imports:** Run a workspace-wide audit and safely remove unused React hooks, components, and Supabase imports.
- [x] **Dead Variables:** Clean up declared but unread parameters in hooks/components (e.g., renaming unused props to `_studentId` for TS compliance).
- [x] **Orphaned Files:** Safely delete disconnected components and outdated documentation (e.g., `AddGroupModal.tsx`, legacy `README.md` files).
- [x] **Guardrails:** Verify that no Layer 3 API files under [`/src/lib/api/`](../src/lib/api/) were altered during the sweep; dashboard/seating UI state is in Zustand stores, not React Context.
- [x] **Seating editor hook:** Extracted complex state from [`SeatingChartEditorView.tsx`](../src/components/dashboard/SeatingChartEditorView.tsx) into [`useSeatingChart.ts`](../src/hooks/useSeatingChart.ts) (**named export:** `useSeatingChartEditor`; not the context hook `useSeatingChart`). The hook holds the “Desk” and coordinates with [`@/lib/api/seating`](../src/lib/api/seating.ts) for batch saves.

---

## Phase 5: The Furniture (Visual Tier 3)
*Goal: Make UI components "dumb" and agnostic.*

- [x] **Navbars:** Decouple [`StudentsBottomNav`](../src/components/dashboard/shell/StudentsBottomNav.tsx) / [`SeatingEditorBottomNav`](../src/components/dashboard/shell/SeatingEditorBottomNav.tsx) from persistence; shell + [`SeatingEditorBottomNavBridge`](../src/components/dashboard/shell/SeatingEditorBottomNavBridge.tsx) + [`useSeatingEditorToolbarActions`](../src/hooks/useSeatingEditorToolbarActions.ts) (renamed from `useSeatingEditBottomNav`).
- [x] **Modals:** Presentational modals with `onSubmit` / parents wiring API (e.g. [`EditStudentModal`](../src/components/ui/modals/EditStudentModal.tsx), [`AddSkillForm`](../src/components/ui/forms/AddSkillForm.tsx)); class edit lives in [`EditClassModalRoot`](../src/components/ui/modals/EditClassModalRoot.tsx) with a thin [`EditClassModal`](../src/components/ui/modals/EditClassModal.tsx) façade.
- [x] **Atoms:** Keep shared UI under [`/src/components/ui/`](../src/components/ui/) free of `@/lib/api` / Supabase; compose only via props and callbacks (see [architecture-plan.md](architecture-plan.md) §2 Tier 3).
