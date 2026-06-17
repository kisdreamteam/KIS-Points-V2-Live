# KIS-Points Prototype 1 - Tech Stack

**Start here:** [`source-of-truth.md`](source-of-truth.md)

## Core Technologies
* **Framework:** Next.js v16.0.7
* **Language:** TypeScript (Strict typing enforced via `/src/lib/types.ts`)

## State Management (The Layer 2 Desk)
* **Global State:** Zustand
  * *Architectural Note:* Zustand is the **mandatory** solution for all global client-side state, including UI view switching, modal toggling, and core data caching. It provides granular, selector-based subscriptions to eliminate render cascades.
  * 🚫 **React Context is explicitly forbidden** for global application state to prevent performance bottlenecks.
* **Local State:** React `useState` / `useRef` 
  * *Architectural Note:* Strictly limited to isolated, temporary component states (e.g., controlling a local text input value or a dropdown animation before submission).

## Backend & Database (The Layer 3 Vault)
* **BaaS (Backend as a Service):** Supabase
* **Database:** PostgreSQL
* **Data Fetching:** Supabase JS Client
  * *Architectural Note:* Supabase clients and queries must only be invoked within Layer 3 API functions and orchestrated by Layer 1 custom hooks. Tier 2 and Tier 3 UI components must never interact with Supabase directly.

## Styling & UI Design
* **CSS Framework:** Tailwind CSS (Utility-first styling)
* **Icons:** Lucide-React (or standard SVG libraries)
* **Design Pattern:** Custom Tier 3 components optimized for fast rendering and optimistic UI updates.

## Development & Tooling
* **AI Assistant:** Cursor IDE (Governed by strict `.cursorrules`)
* **Linting & Formatting:** ESLint + Prettier
* **Package Manager:** npm