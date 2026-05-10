# 3-Tier / 3-Layer Refactor Plan

This plan implements the architecture rules from `.cursorrules` and `docs/architecture-plan.md` using an incremental, low-risk sequence.

## Goals

- Enforce **Visual 3-Tier** boundaries:
  - Tier 1: scaffolding/layout only
  - Tier 2: view containers/selectors
  - Tier 3: UI actors
- Enforce **Data 3-Layer** flow:
  - Layer 1 hooks orchestrate business/data flow
  - Layer 2 stores keep state + simple setters
  - Layer 3 API modules perform Supabase/database interactions
- Reduce regression risk by migrating in small vertical slices.

---

## Current Inconsistencies (to fix)

- Tier 2/Tier 3 components directly import `@/lib/api/*` (bypassing Layer 1 hooks).
- Tier 1-ish layout/workspace components contain too much business orchestration.
- Some store logic is heavier than "state + basic setters."
- Route-layer thinness is inconsistent in parts of `src/app`.

---

## Refactor Principles

- No behavioral rewrites unless required; prioritize extraction/move.
- Keep public component props stable during first pass.
- Move logic first, optimize second.
- Ship each step with focused verification.

---

## Migration Sequence (Incremental, low-risk)

## Step 1: `ClassesWorkspace` extraction (small blast radius)

Status: Finished

**File:** `src/components/dashboard/ClassesWorkspace.tsx`  
**Issue:** Tier 2 calls Layer 3 directly.

### Create

- `src/hooks/useClassesWorkspaceActions.ts`

### Move into hook

- `fetchStudentCounts`
- `handleCreateClassSubmit`
- create-class loading/error states

### Keep in component

- modal visibility state
- dropdown state
- rendering (`ClassCardsGrid`, `CreateClassModal`, etc.)

### Expected outcome

- Component becomes UI-first container.
- Data/business flow centralized in Layer 1.

### Verify

- Create class still works
- Student count badges still render
- Loading/empty states unchanged

---

## Step 2: `DashboardClassModalsHost` extraction

Status: Finished

**File:** `src/components/dashboard/DashboardClassModalsHost.tsx`  
**Issue:** modal host directly calls student APIs.

### Create

- `src/hooks/useDashboardClassModalsActions.ts`

### Move into hook

- add/edit student submit handlers
- next-student-number loading logic
- add-students loading/error state
- refresh orchestration after submit

### Keep in component

- modal visibility and composition
- modal prop wiring

### Expected outcome

- Modal host delegates all business/data behavior to Layer 1.

### Verify

- Add single student
- Add bulk students
- Edit student
- Modals close/refresh exactly as before

---

## Step 3: `Random` tool extraction

Status: Finished

**File:** `src/components/dashboard/tools/Random.tsx`  
**Issue:** UI tool directly performs API operations.

### Create

- `src/hooks/useRandomStudentFlow.ts`

### Move into hook

- fetch students for class
- mark selected student as picked
- reset picked students
- loading/resetting flags

### Keep in component

- slot machine animation and rendering
- keyboard shortcuts
- modal toggles

### Expected outcome

- Visual behavior isolated from persistence behavior.

### Verify

- Random selection still spins and lands correctly
- Picked state persists
- Reset restores all students

---

## Step 4: `DashboardWorkspace` side-effect split

Status: Finished

**File:** `src/components/dashboard/stage/DashboardWorkspace.tsx`  
**Issue:** scaffolding-level component performs auth/view preference persistence logic.

### Create

- `src/hooks/useDashboardSessionActions.ts` (logout)
- `src/hooks/sync/useViewPreferenceSync.ts` (view URL + preference persistence)

### Move into hooks

- sign-out flow
- preferred view persistence and fallback session-id resolution

### Keep in component

- nav/toolbar assembly
- event dispatch for UI actions

### Expected outcome

- Tier 1-ish workspace returns to layout/composition responsibility.

### Verify

- Logout still redirects to `/login`
- Grid/seating switch still syncs URL + preference
- No UX regressions in toolbar behavior

---

## Step 5: `DashboardLayout` route-state sync extraction

Status: Finished

**File:** `src/components/dashboard/shell/DashboardLayout.tsx`  
**Issue:** layout shell contains route-state business orchestration.

### Create

- `src/hooks/sync/useDashboardRouteStateSync.ts`

### Move into hook

- active view derivation from route/query
- edit mode route sync
- default query param injection behavior

### Keep in component

- shell rendering
- layout composition
- suspense/fallback boundaries

### Expected outcome

- Tier 1 layout is thin and predictable.

### Verify

- `/dashboard` and `/dashboard/classes/[id]` routing behavior unchanged
- `view`/`mode` query handling remains stable
- Sidebar/tooling state unaffected

---

## Step 6: `useSeatingStore` slimming (optional after stability)

Status: Finished

**File:** `src/stores/useSeatingStore.ts`  
**Issue:** heavier transformation logic in Layer 2 store.

### Move out (if safe)

- transformation-heavy logic (e.g., groups fetch shaping) into:
  - `src/hooks/sync/useSeatingChartDataSync.tsx`, and/or
  - `src/lib/seatingLogic.ts`

### Keep in store

- state fields
- basic setters
- minimal patch operations

### Expected outcome

- Store aligns with "Desk" role (state storage, lightweight updates).

### Verify

- Seating groups render/position correctly
- points delta patching still updates UI
- no performance regressions

---

## Step 7: `src/app` route-layer boundary cleanup

Status: Finished

**Files:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/dashboard/classes/[classId]/page.tsx`  
**Issue:** Auth route pages contained Layer 1 orchestration directly, and dynamic class route did not explicitly use route params.

### Create

- `src/components/auth/pages/LoginPageModule.tsx`
- `src/components/auth/pages/SignupPageModule.tsx`
- `src/components/auth/pages/ForgotPasswordPageModule.tsx`
- `src/components/auth/pages/ResetPasswordPageModule.tsx`

### Move into modules

- auth `useAuthFlow` orchestration
- auth form state/handler prop wiring

### Keep in route files

- thin route-level composition only
- explicit dynamic route param handling (`classId`) at route boundary

### Expected outcome

- `src/app` auth pages are thin route shells.
- Dynamic class route segment explicitly participates in routing intent.

### Verify

- Login/signup/forgot/reset flows unchanged
- Dynamic class route renders the same dashboard view behavior
- No direct Layer 3 API calls introduced into route files

---

## Route Layer Follow-up (after core migration)

### `src/app` thin route shells

- Keep `page.tsx` and `layout.tsx` minimal.
- Ensure dynamic route pages actually use route params (`classId`) where expected.
- Move heavy orchestration from route files into module/container hooks/components.

---

## Architecture Guardrails

- Tier 2/Tier 3 components should not directly import `@/lib/api/*` for runtime calls.
- Layer 1 hooks are the only orchestration point for async business operations.
- Zustand usage should keep strict selectors:
  - prefer `useStore((s) => s.slice)` over broad subscriptions.
- Stores must not import Supabase client or call DB APIs.
- Keep TypeScript strict and avoid `any`.

---

## Suggested Hook Interfaces (starter contracts)

## `useClassesWorkspaceActions`

- `studentCounts: Record<string, number>`
- `isCreatingClass: boolean`
- `createClassError: string | null`
- `fetchStudentCounts(classes: ClassRecord[]): Promise<void>`
- `handleCreateClassSubmit(values: CreateClassFormValues): Promise<void>`

## `useDashboardClassModalsActions`

- `isAddingStudents: boolean`
- `addStudentsError: string | null`
- `nextStudentNumber: number | null`
- `loadNextStudentNumber(classId: string): Promise<void>`
- `handleAddStudentsSubmit(values, classId): Promise<void>`
- `handleSubmitEditStudent(values): Promise<void>`

## `useRandomStudentFlow`

- `students: Student[]`
- `isLoading: boolean`
- `isResetting: boolean`
- `fetchStudents(classId, options?): Promise<void>`
- `markSelectedStudentAsPicked(studentId): Promise<void>`
- `handleResetPickedStudents(classId): Promise<void>`

## `useDashboardSessionActions`

- `onLogoutStudentsNav(): Promise<void>`

## `useViewPreferenceSync`

- `handleViewChange(view: 'grid' | 'seating'): Promise<void>`

## `useDashboardRouteStateSync`

- Hook with internal effects for pathname/query synchronization.
- Optional return for diagnostics/derived flags if needed.

---

## Testing Strategy

For each step:

- Run targeted smoke checks on the affected feature only.
- Confirm no route breakage (`/dashboard`, `/dashboard/classes/[id]`).
- Confirm modal and async state behavior matches pre-refactor UX.
- Confirm no new direct `@/lib/api/*` imports in Tier 2/Tier 3 targets.

### Optional grep checks

- Search for component-level API leakage:
  - `src/components/**` imports from `@/lib/api/`
- Search for store DB leakage:
  - `src/stores/**` `createClient` / `.from(`

---

## Rollback Plan

- Keep each migration in separate commit(s).
- If regressions appear, revert only the current step.
- Do not combine multiple steps into one PR.

---

## Done Criteria

- Tier 2/Tier 3 target files no longer perform runtime API calls directly.
- Tier 1 layout/workspace files focus on composition/scaffolding.
- Stores remain free of DB access and avoid heavy orchestration logic.
- No behavior regressions in class management, student modals, random tool, and dashboard view switching.
