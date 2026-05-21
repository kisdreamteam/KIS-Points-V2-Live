# KIS-Points Refactoring & Polish To-Do List

This document outlines the sequenced execution plan for migrating, expanding, and polishing the KIS-Points prototype. It is ordered to ensure foundational stability before applying visual updates.

## Phase 1: The Foundation (Structure & Typing)
*Our goal is to solidify the floor plan and swap the underlying engine without breaking the app.*

- [x] **1. Review Architecture & Structure:** Directory layout matches [`architecture-plan.md`](architecture-plan.md): dashboard Tier 1 under `components/dashboard/frame/`, dashboard Tier 2 under `src/modules/{dashboard,classes,students,seating}/`, dashboard Tier 3 under `components/dashboard/` + `components/ui/`; auth routes under `src/app/(auth)/` (route group; URLs unchanged) with shell in `src/app/(auth)/layout.tsx`; `modules/auth` = `*View` only; landing in `modules/landing` with UI in `components/ui`. Layer 1 `hooks/` (sync under `hooks/sync/`), Layer 2 `stores/`, Layer 3 `lib/api/`. Domain helpers under `lib/` (e.g. `awardPointsService`, `seatingLogic`). Keep `.cursorrules` aligned as the Vite migration proceeds.
- [ ] **2. Migrate to Vite:** Execute the "lift and shift" from Next.js to Vite. Strip out SSR logic, implement standard React Router, and ensure the client-side app runs smoothly.
- [ ] **3. Add Database Types:** Generate and integrate `database.types.ts` from Supabase to lock in strict TypeScript safety across our data layers.

## Phase 2: The Data & Logic (Core Features)
*With a solid Vite foundation, we will safely expand the schema and business logic.*

- [x] **4. Implement Student Soft-Delete:** Add `is_archived: true` logic. (Crucial: Thoroughly verify how this influences the seating chart physics and `seat-index` logic in the database to prevent grid collapse).
- [ ] **5. Add Settings Feature:** Implement settings for scalability. Update `db-schema.md` and run any necessary data migrations.
- [ ] **6. Additional Features (Optional):** Placeholder for any newly discovered functional or data-driven features before freezing the core logic.

## Phase 3: The UI & Polish (Paint & Decor)
*With the logic flawless, we focus entirely on the user experience and visual aesthetic.*

- [ ] **7. Atomic UI Iteration:** Do one final iteration on our atomic UI components (buttons, inputs, standard cards) to ensure absolute consistency.
- [ ] **8. Update Component Layouts:** Snap the polished atomic components into our larger dashboard and grid layouts.
- [ ] **9. Cosmetic Visual Changes:** Execute final visual layout tweaks (spacing, shadows, typography, and color consistency).
- [ ] **10. Asset Optimization (Icons):** Convert Supabase-hosted icons to WebP format and add them directly to the local `/assets` folder for ultimate client-side snappiness.
