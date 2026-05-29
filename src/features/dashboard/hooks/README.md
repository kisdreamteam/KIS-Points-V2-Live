# Dashboard hooks

## Naming conventions

- **`sync/*Refresh.ts`** — Imperative fetch/cache helpers callable from mutations and other hooks (e.g. `refreshDashboardStudents`, `invalidateStudentsCacheForClass`).
- **`sync/*Sync.tsx`** — Mount-once `return null` components wired in layout shells (e.g. `DashboardStudentSync`, `DashboardClassesSync`).
- **`use*ModalController`** — Maps modal props to view props for presentational components.
- **Award points** — `useAwardPointsModalState` (form state), `useSubmitPointAward` (API submit), `useAwardConfirmationModal` (post-award confirmation UI).

## Award points flow

`useAwardPointsModalController` → `useAwardPointsModalState` → `useSubmitPointAward` → `lib/awardPointsTargets.ts`

`useAwardConfirmationModal` is used separately for the confirmation modal after awards (Random, `DashboardClassModalsHost`).
