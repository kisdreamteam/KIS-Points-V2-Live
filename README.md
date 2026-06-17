# KIS-Points

Classroom management prototype for teachers: classes, student rosters, skill-based points, seating charts, daily attendance, and classroom tools (timer, bells, random picker).

**Status:** Prototype 1 — architecture refactor (not production). See [docs/source-of-truth.md](docs/source-of-truth.md) for the canonical developer reference.

## Tech stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **State:** Zustand
- **Backend:** Supabase (PostgreSQL)

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/source-of-truth.md](docs/source-of-truth.md) | **Start here** — architecture rules, folder map, naming |
| [docs/project-scope.md](docs/project-scope.md) | In/out of scope, phased roadmap |
| [docs/product-spec.md](docs/product-spec.md) | User behavior and acceptance checklist |
| [docs/README.md](docs/README.md) | Full docs index |

Supabase migrations: see [supabase/README.md](supabase/README.md).
