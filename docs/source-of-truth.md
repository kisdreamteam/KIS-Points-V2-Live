# KIS-Points — Source of Truth

**Last updated:** May 2026  
**Prototype:** 1 (refactor / not live)  
**Canonical for:** folder policy, data flow, naming, mount points

Start here before reading other docs or making architectural changes.

---

## 1. Project identity

- **Product:** KIS-Points — classroom management for teachers (classes, rosters, points, seating, attendance, tools).
- **Repo:** KDT-Refactor-not-live — architecture refactor prototype; not production.
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Supabase (PostgreSQL).

---

## 2. Read order (active docs)

| Topic | Doc |
|-------|-----|
| In/out of scope, phases | [`project-scope.md`](project-scope.md) |
| User behavior & acceptance | [`product-spec.md`](product-spec.md) |
| Step-by-step teacher flows | [`teacher-workflows.md`](teacher-workflows.md) |
| Award Points modal UI upgrade | [`AwardPointsModal-UI-upgrade.md`](AwardPointsModal-UI-upgrade.md) |
| Visual tiers & data layers (deep) | [`architecture-plan.md`](architecture-plan.md) |
| File tree by visual tier | [`visual-layer-map.md`](visual-layer-map.md) |
| Database tables | [`db-schema.md`](db-schema.md) |
| Dashboard hooks naming | [`../src/features/dashboard/hooks/README.md`](../src/features/dashboard/hooks/README.md) |
| Seating seat math | [`seat-index-logic.md`](seat-index-logic.md) |
| Student display numbers | [`student-numbering-logic.md`](student-numbering-logic.md) |
| Tech stack detail | [`tech-stack.md`](tech-stack.md) |
| Execution backlog | [`to-do.md`](to-do.md) |
| AI coding rules | [`.cursorrules`](../.cursorrules) |
| Completed migration logs | [`archive/`](archive/) (historical only) |

---

## 3. Non-negotiable rules

1. **URL is source of truth** for `classId`, `view` (grid vs seating), and `mode` (edit).
2. **React Context is forbidden** for global application state — use Zustand only.
3. **`src/app/` is routing only** (~5–10 lines per file); no product logic, hooks, or Supabase.
4. **Tier 3 components** must not use stores, orchestration hooks, or runtime API calls.
5. **Supabase only in Layer 3** (`src/lib/api/`, `src/features/*/lib/api/`), orchestrated by Layer 1 hooks.
6. **Optimistic UI** for points and roster changes; roll back Layer 2 on API failure.
7. **Dashboard render split:** `app/dashboard/layout.tsx` → `DashboardShell`; `page.tsx` → `DashboardView` only.

---

## 4. Shells & routes

### Auth & landing

| URL | Shell | Entry |
|-----|-------|-------|
| `/` | Landing | `LandingView` |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth | `*View` in `features/auth/` |

No global Zustand on auth/landing. Session via `useAuthFlow` + `lib/api/auth.service.ts`.

### Dashboard

| URL | Purpose |
|-----|---------|
| `/dashboard` | Classes grid (no class selected) |
| `/dashboard/classes/[classId]` | Students grid or seating (`?view=`, `?mode=`) |

**Render tree:**

```
app/dashboard/layout.tsx → DashboardShell
app/dashboard/*/page.tsx → DashboardView
  → sync workers (student, seating, profile, filter, attendance)
  → DashboardStageContent → ClassesStage | StudentsStage
```

---

## 5. Folder map (dashboard)

| Tier / Layer | Location |
|--------------|----------|
| **T1** Frame | `src/features/dashboard/components/frame/`, `layouts/DashboardShell.tsx` |
| **T2** Stage | `src/features/{dashboard,classes,students,seating}/` (roots: `*View`, `*Workspace`, `*Host`) |
| **T3** UI | `src/features/*/components/`, `src/components/ui/` |
| **Layer 1** Orchestrators | `src/hooks/`, `src/features/*/hooks/`, `src/features/dashboard/hooks/` |
| **Layer 1b** Sync | `src/features/dashboard/hooks/sync/` |
| **Layer 2** Stores | `src/stores/`, `src/features/*/stores/` |
| **Layer 3** API | `src/lib/`, `src/features/*/lib/api/` |

Auth/landing: `src/features/{auth,landing}/` — not subject to dashboard tier split.

---

## 6. Where to put new hooks

| Location | Use when |
|----------|----------|
| `src/hooks/` | Cross-feature utilities used by 2+ domains (e.g. `useAnchoredDropdownPortal`, `useSeatingChart`, `useClassPointLog`) |
| `src/features/dashboard/hooks/` | Dashboard orchestration, modal controllers, award-points chain, workspace toolbar |
| `src/features/dashboard/hooks/sync/` | URL/store alignment: `*Refresh.ts` (imperative) or `*Sync.tsx` (mount component) |
| `src/features/{students,classes,auth}/hooks/` | Domain-specific orchestration (e.g. `useAttendanceActions`, `useClassManagement`) |

**Rule:** Prefer feature colocation. Promote to `src/hooks/` only when multiple features consume the hook.

---

## 7. Stores

| Store | Location | Owns |
|-------|----------|------|
| `useLayoutStore` | `src/stores/` | `activeView`, multi-select, tool overlays, edit mode, sidebar |
| `useModalStore` | `src/stores/` | Modal type, targets, open/close |
| `usePreferenceStore` | `src/stores/` | `sortBy`, `viewMode`, `viewPreference` (persisted) |
| `useUserStore` | `src/stores/` | Teacher profile |
| `useDashboardStore` | `features/dashboard/stores/` | Classes, students, `absentStudentIds`, loading, `applyPointsDelta` |
| `useSeatingStore` | `features/seating/stores/` | Layouts, groups, assignments, view settings |

---

## 8. Sync convention

| Pattern | Role | Examples |
|---------|------|----------|
| `*Refresh.ts` | Imperative fetch/cache; callable from mutations | `dashboardStudentRefresh`, `dashboardClassesRefresh`, `seatingChartRefresh` |
| `*Sync.tsx` | Mount-once `return null` workers | `DashboardStudentSync`, `DashboardClassesSync`, `SeatingChartDataSync` |
| `use*Sync.ts` | Hook-only sync (no separate refresh file) | `useDashboardRouteStateSync`, `useViewPreferenceSync`, `useAttendanceSync` |

**Mount points:**

- `DashboardClassesSync` — `DashboardShell`
- `DashboardStudentSync`, `SeatingChartDataSync`, `DashboardProfileSync`, `DashboardClassesFilterSync`, `AttendanceSync` — `DashboardView`
- `useDashboardRouteStateSync`, `useViewPreferenceSync` — `DashboardShell`

---

## 9. Award points chain

```
useAwardPointsModalController
  → useAwardPointsModalState
  → useSubmitPointAward
  → awardPointsTargets.ts
```

`useAwardConfirmationModal` — post-award confirmation only (`Random`, `DashboardClassModalsHost`).

See [`src/features/dashboard/hooks/README.md`](../src/features/dashboard/hooks/README.md).

---

## 10. Absent students & point awards

| Flow | Excludes absent? |
|------|------------------|
| Whole class (`wholeClass`) | Yes |
| Multi-class (`multiClass`) | Yes |
| Seating group batch | Yes |
| Select all (multi-select) | Yes |
| Single student / seat click | No (teacher override) |
| Manual multi-select award | No (teacher override) |

Resolved via `awardPointsTargets.ts` (`filterEligibleStudentIds`, `resolveAwardTargetStudentIds`). Early return with alert when zero eligible students remain.

---

## 11. Known gaps

- No automated test suite (Jest/Vitest/Playwright).
- No generated `database.types.ts` from Supabase (hand-maintained `src/lib/types.ts`).
- Vite + React Router migration planned (`to-do.md` Phase 1).
- Landing page lists “AI Teacher Assistance” — not implemented.
- Global user settings page not built (Phase 2 to-do).

---

## 12. Changelog

| Date | Decision |
|------|----------|
| May 2026 | Feature-first component migration complete |
| May 2026 | Dashboard hooks rename + sync split (`*Refresh.ts` / `*Sync.tsx`) |
| May 2026 | North-star docs added (`source-of-truth`, `project-scope`, `product-spec`) |
| June 2026 | Skill add/edit forms no longer collect points; award weight chosen in Award Points modal |

---

## 13. Maintenance rule

When making architectural or naming changes:

1. Update **this file** first (changelog + affected sections).
2. Update **`product-spec.md`** if user-visible behavior changes.
3. Update **`project-scope.md`** if in/out of scope changes.
4. Update **`architecture-plan.md`** for deep technical detail.
5. Do **not** edit files in `docs/archive/` for current paths — update active docs instead.
