# KIS-Points — Project Scope (Prototype 1)

**Current truth:** [`source-of-truth.md`](source-of-truth.md)  
**User behavior:** [`product-spec.md`](product-spec.md)

---

## 1. Mission

Deliver a refactor-quality classroom dashboard that proves the dual-shell architecture, Zustand data desk, and feature-first layout **before** a planned Vite migration and production hardening.

This prototype validates structure and core teacher workflows — not production readiness.

---

## 2. In scope (Prototype 1 — current)

### Users

- Single teacher account (collaborator support exists in schema/migrations)
- Desktop-first dashboard workspace

### Features (implemented end-to-end)

- [x] Auth: login, signup, forgot password, reset password
- [x] Class CRUD, archive, active vs archived views
- [x] Student roster CRUD, soft archive (`is_archived`)
- [x] Skill-based and custom point awards
- [x] Students grid + seating view
- [x] Seating chart editor (layouts, groups, seat assignments)
- [x] Daily attendance marking (`attendance_events`)
- [x] Classroom tools: timer, bells, random student picker
- [x] Points log, edit skills, multi-select awards
- [x] Class collaborators (Edit Class → Teachers tab; requires Supabase migration)

### Technical deliverables

- [x] 3-tier visual / 3-layer data architecture enforced
- [x] Feature-first component layout under `src/features/`
- [x] Zustand migration (no React Context for global state)
- [x] Supabase-backed persistence
- [ ] Generated `database.types.ts` from Supabase
- [ ] Vite + React Router migration

---

## 3. Out of scope (Prototype 1)

### Product

- AI teacher assistance (landing copy only; not built)
- Global user settings page
- Parent or student portals
- Mobile-native apps
- Real-time multi-teacher collaboration UI beyond collaborators table
- Reporting / analytics beyond points log drawer
- Full localization (`preferred_language` in schema; UI is English)

### Engineering

- Automated test suite
- CI/CD pipeline documentation
- Production deployment / SLA guarantees
- SSR/SEO optimization (client-heavy app acceptable for prototype)

---

## 4. Phased roadmap

From [`to-do.md`](to-do.md):

### Phase 1 — Foundation

- [x] Architecture review
- [ ] Migrate Next.js → Vite + React Router
- [ ] Supabase generated types (`database.types.ts`)

### Phase 2 — Data & logic

- [x] Student soft-delete + seating `seat_index` behavior
- [ ] Settings feature + schema updates
- [ ] Optional new features TBD

### Phase 3 — UI polish

- [ ] Atomic UI consistency pass
- [ ] Layout polish (spacing, shadows, typography)
- [ ] Icon asset optimization (WebP in local `/assets`)

---

## 5. Success criteria (prototype)

A teacher can:

1. Log in → land on classes grid
2. Create a class → add students (form or bulk paste)
3. Award points (single, multi-select, whole class, seating group, random)
4. Switch grid ↔ seating view; edit seating layout and assign students
5. Mark daily attendance; verify macro awards skip absent students
6. Use timer, bells, and random picker

Technical bar:

- `npm run build` passes
- No Supabase calls from Tier 3 components
- Architecture matches `.cursorrules` and `source-of-truth.md`

---

## 6. Environments

| Environment | Detail |
|-------------|--------|
| Local dev | `npm run dev` (Next.js webpack) |
| Backend | Supabase project; migrations in `supabase/migrations/` |
| Deployment | TBD (Vercel mentioned in README; not finalized) |

---

## 7. Open decisions

| Decision | Status |
|----------|--------|
| Vite migration timeline | Planned, not started |
| Settings feature shape | Not designed |
| Production host | Undecided |
| Test strategy | Undecided |

---

## 8. Constraints

- Preserve public URLs during Next → Vite migration
- `src/app/` frozen unless route work is explicitly scoped
- Refactor PRs should be rename/move only when possible (no behavior changes)
