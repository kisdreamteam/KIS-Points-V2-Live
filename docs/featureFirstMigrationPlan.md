# Feature-first folder migration plan

**Status:** Complete (phases 0–8, May 2026)  
**Last updated:** May 2026  
**Goal:** Move presentational UI from `src/components/` into `src/features/{feature}/components/{group}/` without changing behavior, JSX, or public URLs.

**Note:** This doc is a historical migration log. Paths and component names below may reference pre-rename filenames (e.g. `CanvasToolbar` → `WorkspaceToolbar`). For the current visual layout, see [`docs/visual-layer-map.md`](visual-layer-map.md) and [`architecture-plan.md`](architecture-plan.md).

**Non-goals (this migration):**

- No new files (no barrel `index.ts`, no re-export shims at old paths).
- No logic, styling, or prop API changes.
- No moving `hooks/`, `stores/`, or `lib/api/` into features (optional later refactor).
- No colocating route files under features (keep `src/app/` as-is).

**Canonical references to update after each phase:** [`architecture-plan.md`](architecture-plan.md), [`.cursorrules`](../.cursorrules), and this doc’s phase checklist.

---

## 1. Target structure

```text
src/
  app/                          # routes only (unchanged)
  features/
    {feature}/
      components/               # Tier 3 UI owned by this feature
        cards/
        modals/
        menus/
        forms/
        frame/                  # dashboard shell only
        seating/                # seating presentational widgets
        tools/
      layouts/                  # segment shells (dashboard: DashboardShell)
      *View.tsx                 # Tier 2 orchestration (feature root for now)
      *Workspace.tsx
      *Host.tsx
      stage/                    # Tier 2 toolbar orchestration (dashboard/seating)
  components/
    ui/                         # shared primitives only (icons, inputs, WorkspaceToolbar, generic modals)
```

**Import convention after each move:**

```ts
// Before
import StudentCard from '@/components/dashboard/cards/StudentCard';

// After
import StudentCard from '@/features/students/components/cards/StudentCard';
```

Keep `@/components/ui/*` for shared atoms until **auth** / **landing** phases (or keep `ui/` permanently for global primitives).

---

## 2. Principles (safe moves)

| Rule | Detail |
|------|--------|
| **One phase = one PR** | Easier rollback and bisect. |
| **`git mv` only** | Preserves history; avoid copy/delete. |
| **Same PR: paths + imports** | No temporary broken main; no shim files. |
| **Grep before merge** | `rg "@/components/dashboard/<group>" src` for the moved group should return **0**. |
| **Build gate** | `npm run build` every phase; delete `.next` if stale route/type cache errors appear. |
| **Smoke gate** | Short manual pass per phase (see §8). |
| **Cross-feature imports** | Allowed when documented in §7; update importers in the **same** phase when possible. |

---

## 3. What stays in `src/components/ui/` (for now)

Until late phases, keep **cross-feature primitives** here:

- `BaseCard`, `TextInput`, `Modal`, `EmptyState`, `LoadingState`, `WorkspaceToolbar`, `CardsGrid`, etc.
- `components/ui/icons/*` (used by dashboard, seating, auth)
- `components/ui/menu/*`, `components/ui/modals/ConfirmationModal`, etc.

**Do not** move icons in early dashboard phases unless willing to update 50+ import paths in one go.

---

## 4. Current baseline (already done)

| Item | Location |
|------|----------|
| Tier 2 rename | `src/modules/` → `src/features/` |
| Auth segment shell | `src/app/(auth)/layout.tsx` |
| Dashboard segment shell | `src/features/dashboard/layouts/DashboardShell.tsx` + `src/app/dashboard/layout.tsx` |
| Tier 2 hosts / tools | `features/dashboard/*Host`, `stage/`, `tools/Random`, etc. |

**`src/components/dashboard/` removed** (Phase 8). Shared UI remains in `src/components/ui/` only.

---

## 5. Phase order

| Phase | Feature | Why this order |
|-------|---------|----------------|
| **0** | Prep | Conventions, grep baselines, branch |
| **1** | **Dashboard** (shell) | Frame, navbars, zone config, `DashboardView`, Timer, PointsLogDrawer — what `DashboardShell` imports |
| **2** | **Classes** | Class cards/modals/forms; `ClassesWorkspaceContent` / `EditClassModalRoot` |
| **3** | **Students** | Student cards, modals/menus/forms; `StudentsStageContent` |
| **4** | **Seating** | Seating menus, layout modals, canvas decor |
| **5** | **Dashboard** (shared modals) | Award points, skills, confirmations — many cross-feature importers |
| **6** | **Auth** | `components/ui/auth/*` → `features/auth/components/` |
| **7** | **Landing** | `components/ui/landing/*` → `features/landing/components/` |
| **8** | **Cleanup** | Remove empty `components/dashboard/`; update architecture docs |

Phases **5** can merge into **1** for fewer PRs (larger blast radius).

---

## 6. Phase details

### Phase 0 — Prep

- [x] Create branch `refactor/feature-first-components`.
- [x] Run `npm run build` (green baseline).
- [x] Snapshot: `@/components/dashboard/` importers and `components/dashboard` file count (see baselines below).
- [x] Agree group names: `cards | modals | menus | forms | frame | seating | tools`.
- [x] Decide: keep `features/dashboard/layouts/` as sibling to `components/` (not under `components/layouts/`) — matches existing `DashboardShell`.

#### Phase 0 baselines (recorded)

| Recorded | Value |
|----------|------:|
| Date | 2026-05-21 |
| Branch | `refactor/feature-first-components` |
| `src/components/dashboard` files (unique on disk) | 53 |
| `@/components/dashboard/` importers in `src/` | 36 |
| `src/features/dashboard` Tier 2 files (existing) | 8 |
| Build (`npm run build`) | pass |

**Conventions locked for phases 1–8:**

- Target path: `src/features/{feature}/components/{group}/File.tsx`
- Import path: `@/features/{feature}/components/{group}/File`
- `features/dashboard/layouts/` remains the segment shell (`DashboardShell`); Phase 1 moves presentational shell pieces into `features/dashboard/components/frame|tools|menus/`.
- `src/components/ui/` unchanged until phases 6–8.

---

### Phase 1 — Dashboard (shell / frame) — done (2026-05-21)

**Owns:** 7-zone chrome, navbars, sync host wrapper, global dashboard chrome.

| From (`src/components/dashboard/`) | To (`src/features/dashboard/components/`) |
|-----------------------------------|-------------------------------------------|
| `frame/DashboardView.tsx` | `frame/DashboardView.tsx` |
| `frame/dashboardZoneConfig.ts` | `frame/dashboardZoneConfig.ts` |
| `frame/navbars/*` | `frame/navbars/*` |
| `tools/Timer.tsx` | `tools/Timer.tsx` |
| `PointsLogDrawer.tsx` | `PointsLogDrawer.tsx` |
| `LeftNavWebsitesMenu.tsx` | `menus/LeftNavWebsitesMenu.tsx` |

**Already in features (do not duplicate):** `layouts/DashboardShell.tsx`, `stage/*`, `tools/Random.tsx`, `*Host.tsx`.

**Primary importers to update:**

- `src/app/dashboard/page.tsx`, `src/app/dashboard/classes/[classId]/page.tsx`
- `src/features/dashboard/layouts/DashboardShell.tsx`
- Any `@/components/dashboard/frame/*` or `tools/Timer` import

**Leave for later phases:** `cards/`, `modals/`, `menus/` (except above), `forms/`, `seating/`.

**Verify:** `/dashboard`, `/dashboard/classes/:id`, seating edit nav/toolbars.

---

### Phase 2 — Classes — done (2026-05-21)

**Owns:** class list / class CRUD UI.

| From | To |
|------|-----|
| `cards/ClassCard.tsx`, `AddClassCard.tsx` | `features/classes/components/cards/` |
| `modals/CreateClassModal.tsx` | `features/classes/components/modals/` |
| `modals/EditClassModal.tsx` | `features/classes/components/modals/` |
| `forms/CreateClassForm.tsx` | `features/classes/components/forms/` |
| `forms/edit-class/**` | `features/classes/components/forms/edit-class/` |
| `menus/ClassCardActionsMenu.tsx` | `features/classes/components/menus/` |

**Primary importers:**

- `src/features/classes/ClassesWorkspaceContent.tsx`, `ClassCardsGrid.tsx`, `EditClassModalRoot.tsx`
- `src/hooks/useClassesWorkspaceActions.ts`, `useClassManagement.ts`

**Verify:** class list, create class, edit class modal tabs.

---

### Phase 3 — Students — done (2026-05-21)

**Owns:** roster grid, student modals, attendance sheet, student menus.

| From | To |
|------|-----|
| `cards/StudentCard.tsx`, `AddStudentCard.tsx`, `WholeClassCard.tsx` | `features/students/components/cards/` |
| `modals/EditStudentModal.tsx`, `AddStudentsModal.tsx` | `features/students/components/modals/` |
| `forms/EditStudentForm.tsx`, `AddStudentsForm.tsx` | `features/students/components/forms/` |
| `menus/StudentsViewMenu.tsx`, `StudentsSettingsMenu.tsx`, `StudentsSortingMenu.tsx`, `StudentCardActionsMenu.tsx`, `AttendanceMenuBody.tsx` | `features/students/components/menus/` |

**Cross-feature:** `StudentCard` is used by **seating** — update seating imports in this PR or document for Phase 4.

**Primary importers:**

- `src/features/students/StudentsStageContent.tsx`, `StudentsCardsGrid.tsx`
- `src/features/dashboard/DashboardClassModalsHost.tsx`
- `src/features/dashboard/layouts/DashboardShell.tsx` → `BottomNav` (`features/dashboard/components/frame/navbars/BottomNav.tsx`)

**Verify:** student grid, multi-select, attendance menu, add/edit student modals.

---

### Phase 4 — Seating — done (2026-05-21)

**Owns:** seating chart presentational pieces and seating menus/modals.

| From | To |
|------|-----|
| `seating/LayoutManagerDrawer.tsx`, `SeatingCanvasDecor.tsx` | `features/seating/components/seating/` |
| `modals/CreateLayoutModal.tsx`, `EditLayoutModal.tsx`, `EditGroupModal.tsx` | `features/seating/components/modals/` |
| `menus/SeatingViewSettingsMenu.tsx`, `SeatingSettingsMenu.tsx`, `SeatingEditorAddGroupsMenu.tsx`, `SeatingEditorGroupSettingsMenu.tsx` | `features/seating/components/menus/` |

**Primary importers:**

- `src/features/seating/*Workspace.tsx`, `SeatingEditorWorkspaceToolbar.tsx`, `SeatingGroupsCanvas.tsx`
- `src/features/dashboard/layouts/DashboardShell.tsx`

**Verify:** seating view, edit mode, layout manager, group modals, portaled menus.

---

### Phase 5 — Dashboard (shared modals & skills UI) — done (2026-05-21)

**Owns:** point awards and skill editing UI used across flows.

| From | To |
|------|-----|
| `modals/AwardPointsModal.tsx`, `PointsAwardedConfirmationModal.tsx` | `features/dashboard/components/modals/` |
| `modals/EditSkillsModal.tsx`, `AddSkillModal.tsx`, `EditSkillModal.tsx` | `features/dashboard/components/modals/` |
| `forms/AddSkillForm.tsx`, `EditSkillForm.tsx` | `features/dashboard/components/forms/` |
| `cards/SkillCard.tsx`, `EditSkillCard.tsx`, `SkillActionCard.tsx` | `features/dashboard/components/cards/` |

**Primary importers:**

- `src/features/dashboard/AwardPointsModalHost.tsx`, `EditSkillsModalHost.tsx`, `DashboardClassModalsHost.tsx`, `tools/Random.tsx`
- `src/hooks/useAwardPointsModalController.ts`, `useEditSkillsModalController.ts`, `useSkillManagement.ts`

**Verify:** award points, edit skills nested modal, skill forms.

---

### Phase 6 — Auth — done (2026-05-21)

| From | To |
|------|-----|
| `components/ui/auth/**` | `features/auth/components/` (e.g. `forms/` for form components) |

**Primary importers:** `src/features/auth/*View.tsx`

**Verify:** `/login`, `/signup`, `/forgot-password`, `/reset-password`.

---

### Phase 7 — Landing — done (2026-05-21)

| From | To |
|------|-----|
| `components/ui/landing/**` | `features/landing/components/` |

**Primary importers:** `src/features/landing/LandingView.tsx`, `src/app/(landing)/page.tsx`

**Verify:** `/` and nav links to auth routes.

---

### Phase 8 — Cleanup & documentation — done (2026-05-21)

- [x] Delete empty `src/components/dashboard/` tree.
- [x] Update [`architecture-plan.md`](architecture-plan.md) §1.2–1.4 and directory map.
- [x] Update [`.cursorrules`](../.cursorrules) Tier 3 paths.
- [x] `src/components/ui/` retains shared primitives, icons, menus, modals (global design system).

---

## 7. Cross-feature import matrix

| Component (owner) | Also used by | Update in phase |
|-------------------|--------------|-----------------|
| `StudentCard` (students) | seating, dashboard hosts | 3 (or 4) |
| `ClassCard` (classes) | classes grid | 2 |
| `AwardPointsModal` (dashboard) | hosts, Random, hooks | 5 |
| `EditClassModal` facade (classes) | DashboardShell | 2 |
| `WorkspaceToolbar` (ui) | dashboard + seating toolbars | keep in `ui/` |
| `ConfirmationModal` (ui) | many features | keep in `ui/` |

**Rule:** Owning feature holds the file; consumers import `@/features/{owner}/components/...`.

---

## 8. Per-phase verification checklist

**Build:**

```bash
npm run build
```

**Grep (example after Phase 3):**

```bash
rg "@/components/dashboard/cards/Student" src
rg "components/dashboard/cards/Student" src
```

**Manual smoke (dashboard-heavy phases):**

- [ ] `/dashboard` — classes view
- [ ] `/dashboard/classes/{id}` — students + seating
- [ ] Seating edit mode — toolbar + bottom nav disabled state
- [ ] Award points + edit skills modals
- [ ] Logout → `/login`

---

## 9. Import update cheat sheet

| Area | Pattern |
|------|---------|
| Feature views | `@/features/{f}/components/{group}/{File}` |
| Hooks | Update when they import moved modals/forms |
| Tier 2 hosts | Update in same phase as modal move |
| App routes | Usually `DashboardView` / `*View` — touched in Phase 1 |

---

## 10. Architecture doc alignment (after Phase 8)

| Tier | Old | New |
|------|-----|-----|
| Dashboard T3 | `components/dashboard/{cards,modals,...}` | `features/{dashboard,classes,students,seating}/components/{group}/` |
| Auth T3 | `components/ui/auth/*` | `features/auth/components/*` |
| Landing T3 | `components/ui/landing/*` | `features/landing/components/*` |
| Shared | `components/ui/*` | Primitives/icons shared across features |

Tier 2 stays at `features/{feature}/*.tsx` unless a later refactor adds `features/{feature}/views/`.

---

## 11. Risk register

| Risk | Mitigation |
|------|------------|
| Missed relative import | Grep `components/dashboard` and `../components` after each phase |
| Cross-feature broken edge | Matrix §7; same-PR import updates |
| Large Phase 1 PR | Split 1a frame/navbars, 1b Timer/Drawer |
| Cursor generates old paths | Update `.cursorrules` at end of each phase |
| Vite migration | Mirror `@/features/*/components` aliases when migrating |

---

## 12. Phase progress tracker

| Phase | Status | PR | Notes |
|-------|--------|-----|-------|
| 0 Prep | done | | Branch + baselines 2026-05-21; build pass |
| 1 Dashboard shell | done | | 2026-05-21: `components/frame`, `tools/Timer`, `PointsLogDrawer`, `menus/LeftNavWebsitesMenu` → `features/dashboard/components/`; build pass |
| 2 Classes | done | | 2026-05-21: cards, modals, forms, edit-class, ClassCardActionsMenu → `features/classes/components/`; build pass |
| 3 Students | done | | 2026-05-21: cards, modals, forms, menus → `features/students/components/`; build pass |
| 4 Seating | done | | 2026-05-21: seating widgets, layout modals, menus → `features/seating/components/`; build pass |
| 5 Dashboard modals | done | | 2026-05-21: award/skills modals, forms, cards → `features/dashboard/components/` |
| 6 Auth | done | | 2026-05-21: `ui/auth` → `features/auth/components/` |
| 7 Landing | done | | 2026-05-21: `ui/landing` → `features/landing/components/` |
| 8 Cleanup | done | | 2026-05-21: removed empty `components/dashboard/`; docs + `.cursorrules` updated |
