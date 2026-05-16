# KIS-Points Architecture Plan

Prototype 1 uses a **dual-shell** layout model and a **dual-boundary** data model:

- **Visual 3-Tier:** where React components live and what they may render.
- **Data 3-Layer:** how state and Supabase interact.

**Status (May 2026):**

- Zustand migration is effectively complete; dashboard global state does not use React Context.
- **Dashboard visual boundaries:** Tier 1 frame and Tier 3 actors live under `src/components/dashboard/`; Tier 2 view containers live under `src/modules/{dashboard,classes,students,seating}/`. **Modal flows** that need Layer 1 wiring above a presentational modal use a **Tier 2 host in `modules/dashboard/` + controller hook in `src/hooks/`** (see §1.3 / §1.4).
- **Auth/landing:** self-contained under `src/modules/` (not subject to the dashboard `components/` vs `modules/` tier split).

Related docs: `docs/tech-stack.md`, `docs/zustand-migration-plan.md`, `docs/3-tier-3-layer-refactor-plan.md`.

---

## 0. Dual shells (identify the shell first)

### A. Auth & landing shell — self-contained under `modules/`

Auth is **not** subject to the dashboard `components/` vs `modules/` tier split. Keep auth-related files where they are.

| Concern | Location |
|---------|----------|
| Tier 1 layout | `src/modules/auth/AuthLayout.tsx` |
| Tier 2 views | `src/modules/auth/LoginView.tsx`, `SignUpView.tsx`, `ForgotPasswordView.tsx`, `ResetPasswordView.tsx` |
| Tier 2 landing | `src/modules/landing/LandingView.tsx` |
| Tier 3 UI | `src/components/ui/auth/*`, `src/components/ui/landing/*` |
| Layer 1 | `src/hooks/useAuthFlow.ts` |
| Layer 3 | `src/lib/api/auth.service.ts` |
| Routes | Thin `src/app/login|signup|.../page.tsx` → `@/modules/auth/*` or `@/modules/landing/*` |

### B. Dashboard shell — `components/` = T1 & T3, `modules/` = T2

| Concern | Location |
|---------|----------|
| Tier 1 | `src/components/dashboard/frame/` |
| Tier 2 | `src/modules/dashboard/`, `classes/`, `students/`, `seating/` |
| Tier 3 | `src/components/dashboard/{cards,modals,menus,forms,seating}/` + `src/components/ui/` |
| Layer 1 / 1b | `src/hooks/`, `src/hooks/sync/` |
| Layer 2 | `src/stores/` |
| Layer 3 | `src/lib/api/` |
| Routes | `src/app/dashboard/*` → `DashboardView` (components) + `DashboardViewSwitch` (modules) |

**Rule:** Do not apply dashboard grid/zone rules to auth/landing, or auth flex centering rules to the dashboard workspace.

---

## 1. Visual 3-Tier — dashboard folder policy

### 1.1 Folder ↔ tier (dashboard only)

| Tier | Role | Location |
|------|------|----------|
| **1** | Scaffolding, chrome, zones | `src/components/dashboard/frame/` |
| **2** | View containers, workspaces, orchestration | `src/modules/{dashboard,classes,students,seating}/` |
| **3** | Presentational UI | `src/components/dashboard/{cards,modals,menus,forms,seating}/`, `src/components/ui/` |

`src/modules/` is the permanent home for auth, landing, and dashboard Tier 2. Do not move `AuthLayout` or auth views into `components/` for folder-policy reasons.

### 1.2 Tier 1 — Scaffolding (`components/dashboard/frame/`)

**Responsibility:** Persistent chrome, routing bounds, zone assignment. Mounts Layer 1b sync workers; reads layout/UI slices for chrome only (no Supabase, no mutation orchestration).

| Path | Role |
|------|------|
| `frame/DashboardView.tsx` | Sync worker host + `DashboardLayout` |
| `frame/DashboardLayout.tsx` | 7-zone grid, nav slots, mounts modal host & tools |
| `frame/dashboardZoneConfig.ts` | Zone / toolbar definitions |
| `frame/navbars/*` | Left/top/bottom nav (`StudentsBottomNav`, `SeatingEditorLeftNav`, etc.) |

Navbars may use **narrow** store selectors (e.g. `LeftNav` → `activeClassId`, `viewMode`) because they are shell chrome, not workspace orchestration.

**Dashboard 7-zone grid (conceptual)**

| Zone | Role |
|------|------|
| 1 | Left nav (classes, seating layouts) |
| 2–3 | Header / top nav |
| 4–5 | Main canvas |
| 6–7 | Footer / bottom toolbars |

**Rules**

- Prefer `h-full` / `min-h-0` inside the dashboard; avoid `h-screen` in nested workspace content.
- URL-reflected UI (`activeView`, edit mode, active class) is mirrored from the route via `src/hooks/sync/*`, not ad hoc `useEffect` in Tier 1.
- Timer overlay: `src/components/dashboard/tools/Timer.tsx` (mounted from layout).

### 1.3 Tier 2 — Stage (`modules/`)

**Responsibility:** Choose which workspace is visible; wire Layer 1 hooks; subscribe to stores; pass props into Tier 3 children.

| Module path | Files |
|-------------|-------|
| `modules/dashboard/` | `DashboardViewSwitch.tsx`, `DashboardClassModalsHost.tsx`, `AwardPointsModalHost.tsx`, `EditSkillsModalHost.tsx`, `stage/DashboardCanvasToolbar.tsx`, `stage/canvasToolbarPresets.tsx`, `tools/Random.tsx` |
| `modules/classes/` | `ClassesView.tsx`, `ClassesWorkspace.tsx`, `ClassCardsGrid.tsx`, `EditClassModalRoot.tsx` |
| `modules/students/` | `StudentsView.tsx`, `StudentsWorkspace.tsx`, `StudentCardsGrid.tsx` |
| `modules/seating/` | `SeatingChartView.tsx`, `SeatingChartEditorView.tsx`, `SeatingChartWorkspace.tsx`, `SeatingChartEditorWorkspace.tsx`, `SeatingGroupsCanvas.tsx`, `SeatingEditorCanvasToolbar.tsx` |

**Award / edit-skills modal pattern (reuse for similar features):**

- **Tier 2 host** (`modules/dashboard/*Host.tsx`): thin component; calls `use*ModalController(...)`, renders Tier 3 modal with `{...viewProps}`.
- **Layer 1 controller** (`hooks/use*ModalController.ts`): composes existing hooks (`usePointAwarding`, `useSkillManagement`, `useAvailable*Icons`, etc.); returns a single **view-props object** typed next to the modal (e.g. `AwardPointsModalViewProps`).
- **Tier 3 modal** (`components/dashboard/modals/*`): no `@/hooks` for orchestration (except documented exceptions elsewhere); props in, callbacks out.
- **Nested composition:** a Tier 3 modal may render another **Tier 2 host** when a subtree has its own controller (e.g. `AwardPointsModal` renders `EditSkillsModalHost`; avoid duplicating that logic in `useAwardPointsModalController`).

**Rules**

- Tier 2 may import Layer 1 hooks and stores; it must not call Supabase clients directly for runtime mutations.
- Type-only imports from `@/lib/api/*` are acceptable.
- Prefer `dashboardStudentSelectors.ts` for roster ordering/aggregates.
- For new dashboard modal flows similar to award points / edit skills: add a **host** under `modules/dashboard/` + **controller hook** under `hooks/`, keep modal + child forms Tier 3 (no `@/stores`, no `@/hooks` inside presentational forms).

### 1.4 Tier 3 — Actors (`components/dashboard/` + `components/ui/`)

**Responsibility:** Presentation; props in, callbacks out.

```text
components/dashboard/
  cards/      modals/     menus/     forms/
  seating/    (presentational widgets only, e.g. LayoutManagerDrawer, SeatingCanvasDecor)
components/ui/            # shared atoms + auth/landing chrome
```

**Rules**

- Default: no stores, no **`@/hooks`** (orchestration), no API clients. Local UI state (`useState`, refs, DOM `useEffect` for focus/click-outside) is fine.
- **`forms/AddSkillForm.tsx`**, **`forms/EditSkillForm.tsx`**: strict Tier 3 — **no `@/hooks`**. Icon paths and detection flags (`useAvailablePositiveIcons` / static negative list) plus submit handlers (`addSkill`, `updateSkill` + refresh) are wired in **`useAwardPointsModalController`** and **`useEditSkillsModalController`**, then passed through modal shells (`AddSkillModal`, `EditSkillModal`, nested hosts as needed).
- **Documented exceptions (remain in `components/` by design):**
  - `cards/StudentCard.tsx` — `useShallow` store slice for grid performance.
  - `modals/EditSkillsModal.tsx` — presentational; orchestration in `hooks/useEditSkillsModalController.ts` + Tier 2 `modules/dashboard/EditSkillsModalHost.tsx`.
  - `modals/AwardPointsModal.tsx` — presentational; orchestration in `hooks/useAwardPointsModalController.ts` + Tier 2 `modules/dashboard/AwardPointsModalHost.tsx`.
  - `cards/ClassCard.tsx` — reads `viewPreference` only.
- `modals/EditClassModal.tsx` — thin façade re-exporting `modules/classes/EditClassModalRoot.tsx`.

### 1.5 Tier 3 presentation kept in dashboard `components/`

| File | Notes |
|------|-------|
| `PointsLogDrawer.tsx` | Props only; workspace owns data |

---

## 2. Data 3-Layer separation (the flow)

**React Context is forbidden for global application state** (see `docs/tech-stack.md`).

### Layer 1 — Orchestrators (`src/hooks/`)

**Responsibility:** Business flow, optimistic updates, error rollback, coordination across stores.

**Patterns**

1. UI event or sync worker triggers the hook.
2. Update Layer 2 immediately when the UX should feel instant.
3. Call Layer 3 to persist.
4. Revert or refetch Layer 2 on failure.

**Examples**

| Concern | Hook(s) |
|---------|---------|
| Point awards | `useAwardPointsService.ts`, `useAwardPointsFlow.ts`, `usePointAwarding.ts` |
| Class CRUD / archive | `useClassActions.ts`, `useClassManagement.ts`, `useClassesWorkspaceActions.ts` |
| Student modals / selection | `useStudentsModalsState.ts`, `useStudentsSelection.ts`, `useDashboardClassModalsActions.ts` |
| Random student tool | `useRandomStudentFlow.ts` |
| Seating editor canvas | `useSeatingChart.ts`, `useSeatingLayoutManager.ts`, `useSeatingEditBottomNav.ts` (toolbar; not a bottom nav) |
| Session / logout | `useDashboardSessionActions.ts` |
| Auth forms | `useAuthFlow.ts` |
| Canvas toolbar | `hooks/dashboard/useCanvasToolbarActions.ts` (preset actions via window events) |
| Seating editor toolbar state/actions | `useSeatingEditBottomNav.ts` (view settings, groups, auto-assign/randomize; consumed by `SeatingEditorCanvasToolbar`) |
| Award points modal (controller) | `useAwardPointsModalController.ts` (composes `usePointAwarding`, `useSkillManagement`, `useAvailable*` for add-skill UX) |
| Edit skills modal (controller) | `useEditSkillsModalController.ts` (list/delete/edit orchestration + icon picker data for `EditSkillForm`) |
| UI utilities | `useAnchoredDropdownPortal.ts` (portaled dropdown positioning), `useSortedStudents.ts`, `useClassPointLog.ts`, `useStudentsUrlState.ts`, `useStudentsToolbarEvents.ts`, `useDashboardToolbarInset.ts`, `useSkillManagement.ts`, `useAvailableIcons.ts` |

Pure helpers (no React): `src/lib/awardPointsService.ts`, `src/lib/seatingLogic.ts`, `src/lib/iconUtils.ts`.

### Layer 1b — Route & store sync (`src/hooks/sync/`)

| Worker | Role |
|--------|------|
| `useDashboardRouteStateSync.ts` | Path + query → `useLayoutStore.activeView` / `isEditMode` |
| `useDashboardStudentSync.ts` | URL class segment → `activeClassId`, roster fetch/cache |
| `useDashboardClassesSync.tsx` | Bootstrap + silent refresh of `allAccessibleClasses` |
| `useDashboardClassesFilterSync.tsx` | `viewMode` + full class list → filtered `classes` |
| `useDashboardProfileSync.tsx` | Teacher profile → `useUserStore` |
| `useSeatingChartDataSync.tsx` | Class/layout changes → `useSeatingStore` |
| `useViewPreferenceSync.ts` | Persist preferred grid vs seating view |

**Mounting**

- `DashboardClassesSync` — `src/app/dashboard/layout.tsx`
- `DashboardStudentSync`, `SeatingChartDataSync`, `DashboardProfileSync`, `DashboardClassesFilterSync` — `src/components/dashboard/frame/DashboardView.tsx`
- `useDashboardRouteStateSync`, `useViewPreferenceSync` — `src/components/dashboard/frame/DashboardLayout.tsx`

### Layer 2 — Desk (`src/stores/`)

| Store | Owns |
|-------|------|
| `useLayoutStore.ts` | `activeView`, sidebar, multi-select, timer/random overlays, edit mode flags |
| `useDashboardStore.ts` | `activeClassId`, classes, students, loading, `applyPointsDelta` |
| `useModalStore.ts` | Modal type, targets, open/close |
| `useSeatingStore.ts` | Layouts, groups, assignments, seating view settings |
| `usePreferenceStore.ts` | `sortBy`, `viewMode`, `viewPreference` |
| `useUserStore.ts` | `teacherProfile`, profile loading |

**Selectors:** `src/stores/dashboardStudentSelectors.ts`.

### Layer 3 — Vault (`src/lib/api/`)

| Module | Domain |
|--------|--------|
| `auth.service.ts` | Session, profile |
| `classes.ts` | Class records |
| `students.ts` | Roster CRUD |
| `points.ts` | Awards, logs |
| `skills.ts` | Skill definitions |
| `seating.ts` | Layouts, groups, assignments |

Shared types: `src/lib/types.ts`.

---

## 3. Cross-cutting integration

### URL as source of truth

- **Class context:** `/dashboard/classes/[classId]`
- **Student grid vs seating:** `?view=seating` (grid is default)
- **Seating editor:** `?mode=edit`

### Optimistic UI

- Point awards: `applyPointsDelta` before `lib/api/points`; rollback on failure.
- `DashboardClassModalsHost` may pass `skipRefreshAfterAward` when the store already reflects the change.

### Window event bus (legacy)

`src/lib/events/students.ts` coordinates toolbars, multi-select, and post-award cleanup. Prefer store setters + Layer 1 hooks for new features.

### Modals

- Global open state: `useModalStore`
- Mounted once: `DashboardClassModalsHost` in `DashboardLayout` (`src/modules/dashboard/`)
- Writers: selection hooks, seating view, `useDashboardClassModalsActions`

### Seating editor chrome (`?view=seating` + `?mode=edit`)

When `useLayoutStore.isEditMode` is true on the seating chart view, `DashboardLayout` swaps several zone mounts:

| Zone / area | View mode | Edit mode |
|-------------|-----------|-----------|
| Left nav | Default `LeftNav` | `SeatingEditorLeftNav` |
| Canvas toolbar column | `DashboardCanvasToolbar` (layout manager, teacher view, etc.) | `SeatingEditorCanvasToolbar` |
| Footer | `StudentsBottomNav` | `StudentsBottomNav` with `buttonsDisabled={true}` |
| Main stage (Tier 2) | `SeatingChartView` | `SeatingChartEditorView` (via `StudentsWorkspace`) |

**There is no `SeatingEditorBottomNav`.** Editor actions that previously lived in a dedicated bottom bar now live on the right-rail canvas toolbar. The standard students bottom nav remains visible but non-interactive until the user exits edit mode (toolbar Close / URL without `mode=edit`).

#### `SeatingEditorCanvasToolbar` (Tier 2 — `modules/seating/`)

Orchestrates the editor toolbar using:

- **Tier 3 shell:** `components/ui/CanvasToolbar.tsx` (`topSlot`, `bottomSlot`, `topActions`, `bottomActions`)
- **Layer 1:** `useSeatingEditBottomNav()` (settings toggles, group actions, emits `STUDENT_EVENTS` consumed by `useSeatingChart.ts`), `useCanvasToolbarActions()` (Close and other preset buttons from `canvasToolbarPresets.tsx`)
- **Tier 3 menus:** `SeatingViewSettingsMenu`, `SeatingSettingsMenu`, `SeatingEditorAddGroupsMenu` in `components/dashboard/menus/`

**Button layout (top → bottom on the rail):**

| Region | Controls |
|--------|----------|
| `topActions` | Close editor (X) |
| `topSlot` | View Settings, Auto Assign, Randomize |
| `bottomSlot` | Settings, Add Groups |
| `bottomActions` | Add group (single, `variant: 'danger'` / brand pink) |

Props from layout: `toolbarConfig`, `classId`, `onEditClass` (for Edit Class in Settings menu).

#### Portaled toolbar menus

Dropdowns are **not** absolutely positioned inside the toolbar pill (avoids clipping). `SeatingEditorCanvasToolbar` uses `createPortal` + `useAnchoredDropdownPortal`:

| Menu | Anchor region | Placement | Opens |
|------|---------------|-----------|-------|
| View Settings | `topSlot` | `leftOfAnchorDown` | Downward, into canvas |
| Settings, Add Groups | `bottomSlot` | `leftOfAnchorAbove` | Upward, into canvas |

Horizontal positioning for `leftOfAnchorDown` / `leftOfAnchorAbove`: menu right edge sits `gapPx` left of the button’s left edge (`left = rect.left - widthPx - gapPx`), so menus sit in the canvas area rather than hugging the viewport’s right edge.

**Tier 3 menu pattern for toolbar instances:** pass `isToolbarMenu`, `menuClassName` (e.g. `min-w-[220px]`), and portal `style`. Default `menuClassName` on each menu keeps `absolute bottom-full …` for any non-toolbar inline use.

#### Shared UI

- `components/ui/CanvasToolbar.tsx` — reusable vertical toolbar; also used by `DashboardCanvasToolbar`
- `modules/dashboard/stage/canvasToolbarPresets.tsx` — maps `ToolbarActionId` → icons + `STUDENT_EVENTS` dispatches

---

## 4. Directory map (as implemented)

```text
src/
  app/                              # Thin routes
    page.tsx                        # → modules/landing/LandingView
    login|signup|.../               # → modules/auth/*View
    dashboard/
      layout.tsx                    # DashboardClassesSync
      page.tsx                      # DashboardView + DashboardViewSwitch
      classes/[classId]/page.tsx

  modules/                          # Auth, landing, dashboard Tier 2
    auth/                           # AuthLayout + *View (permanent)
    landing/
    dashboard/                      # ViewSwitch, class modals host, award/skills modal hosts, stage/, tools/
    classes/
    students/
    seating/                        # + SeatingEditorCanvasToolbar.tsx

  components/
    ui/                             # Shared Tier 3 (+ auth/landing, CanvasToolbar)
    dashboard/
      frame/                        # Tier 1
      cards|modals|menus|forms|seating/
      tools/Timer.tsx               # Tier 3 (overlay UI)
      PointsLogDrawer.tsx           # Tier 3

  hooks/          stores/           lib/api/
```

**Path aliases:** `@/components/*`, `@/modules/*`, `@/hooks/*`, `@/stores/*`, `@/lib/*`.

---

## 5. Dashboard refactor checklist

| Status | Task |
|--------|------|
| done | Tier 1: `components/dashboard/frame/` |
| done | Tier 3: cards, modals, menus, forms, seating widgets |
| done | Tier 2: views/workspaces in `modules/{dashboard,classes,students,seating}` |
| done | Move Tier 2 stragglers out of `components/dashboard/` (modal host, edit-class root, Random, SeatingGroupsCanvas, stage toolbar) |
| done | Seating editor controls on `SeatingEditorCanvasToolbar`; removed `SeatingEditorBottomNav` / bridge; footer uses `StudentsBottomNav` + `buttonsDisabled` in edit mode |
| done | Award points: `useAwardPointsModalController` + `AwardPointsModalHost`; Tier 3 `AwardPointsModal` |
| done | Edit skills list: `useEditSkillsModalController` + `EditSkillsModalHost`; Tier 3 `EditSkillsModal` |
| done | Skill forms Tier 3: `AddSkillForm` / `EditSkillForm` have no `@/hooks`; controllers pass icons + handlers |
| done | **Do not** move `modules/auth/*` or `modules/landing/*` for tier-folder policy |

---

## 6. Quick reference

```text
Auth/Landing   →  modules/auth|landing (T1+T2) + components/ui (T3)
Dashboard T1   →  components/dashboard/frame/
Dashboard T2   →  modules/{dashboard,classes,students,seating}/  (+ *ModalHost.tsx for gated modal flows)
Dashboard T3   →  components/dashboard/* + components/ui/  (presentational modals/forms; compose Tier 2 hosts when needed)
Data layers    →  hooks/ · stores/ · lib/api/
Seating edit   →  SeatingEditorCanvasToolbar + portaled menus; StudentsBottomNav disabled
```
