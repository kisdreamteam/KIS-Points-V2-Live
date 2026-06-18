# KIS-Points — Product Spec (Prototype 1)

**Scope boundaries:** [`project-scope.md`](project-scope.md)  
**Technical rules:** [`source-of-truth.md`](source-of-truth.md)  
**Step-by-step flows:** [`teacher-workflows.md`](teacher-workflows.md)

---

## 1. Overview

KIS-Points helps teachers manage classes, track student points, arrange seating, mark daily attendance, and run simple classroom tools from a single dashboard.

**Primary persona:** Classroom teacher (homeroom / subject class; grade field on class record).

---

## 2. User journeys

### 2.1 Onboarding

1. Land on `/` → navigate to signup or login
2. Sign up with email/password → confirm email (Supabase flow)
3. Arrive at `/dashboard` (classes grid)

### 2.2 Daily classroom flow

1. Open a class from classes grid or left nav → `/dashboard/classes/[classId]`
2. View students in grid or switch to seating via **View** menu (bottom nav)
3. Award points via student card menu, multi-select footer, whole-class macros, seating group header, or random picker
4. Mark absences via **Attendance** bottom-nav sheet
5. Optionally open **Timer**, **Bells**, **Happy Meter**, or **Random** from bottom nav

### 2.3 Class setup

1. Create class (name, grade, icon, school year)
2. Add students (single form or bulk name paste)
3. Define skills / point categories (positive and negative)
4. Create seating layout(s), add groups, assign students to seats

---

## 3. Feature specifications

### 3.1 Classes grid (`/dashboard`)

- Shows accessible classes filtered by **active** vs **archived** view mode
- Actions per class: edit, archive, delete (with confirmation)
- Create class via modal
- Empty state when no classes
- Student count displayed on class cards
- **View** and **Sort** bottom-nav controls disabled (no class context)

### 3.2 Students grid

- Sortable roster (sort preference persisted)
- Student card: avatar, name, points total, actions menu
- **Multi-select mode:** footer nav enables batch point award
- **Select all** excludes absent students; individual card tap may include absent students

### 3.3 Point awards

**Skill award:** predefined category with icon and point value  
**Custom award:** ad-hoc points with optional memo

| Context | Target students | Absent excluded? |
|---------|-----------------|------------------|
| Single student (card/seat) | That student | No |
| Multi-select (explicit IDs) | Selected students | No |
| Whole class | All non-archived roster | Yes |
| Seating group header | Students in group | Yes |
| Random picker | Spun student | N/A (single) |

**After award:** confirmation modal with summary; points update optimistically on cards and seating view.

**Edit skills:** manage point categories (add, edit, delete, icons) via modal from award flow or dedicated entry.

### 3.4 Attendance

- One absence record per student per calendar day (`attendance_events`)
- Attendance sheet: checkbox checked = **absent**
- Absences cleared and re-fetched when switching classes
- Macro point awards respect absences; manual single/multi awards allow teacher override

### 3.5 Seating

**View mode** (`?view=seating`): read-only chart with active layout  
**Edit mode** (`?view=seating&mode=edit`):

- Manage layouts: create, rename, delete, set active
- Add/edit/delete groups; configure rows and columns
- Drag students to seats; auto-assign and randomize
- Editor toolbar in right rail; some bottom-nav buttons disabled while editing
- Exit edit via toolbar **Close** → returns to view mode; bottom nav re-enabled

### 3.6 Tools

| Tool | Entry | Behavior |
|------|-------|----------|
| Timer | Bottom nav | Movable panel; countdown/stopwatch; S/L size toggle (expands up-left, bottom-right anchored); end sound (`/sounds/timer-end-1.mp3`) |
| Bells | Bottom nav | Movable panel; bell sounds |
| Happy Meter | Bottom nav | Movable panel; teacher mood gauge (+/−); S/L size toggle (same anchored resize as Timer) |
| Random | Bottom nav | Large modal; slot animation; picks unpicked students; reset picked list; award after spin |

**Movable panel sizes (px):** Timer and Happy Meter share **large height 660**; small panels use **height 280** (Timer/Bells width 403, Happy Meter width 420). Timer large width 540; Happy Meter large width 640.

### 3.7 Edit class modal

Tabs:

- **Info** — name, grade, icon, school year
- **Students** — inline roster management for class
- **Teachers** — add/remove collaborators by email
- **Settings** — class-level preferences
- **Reset points** — destructive reset with confirmation

### 3.8 Student modals (dashboard)

- **Add students** — single or bulk paste
- **Edit student** — name, avatar, gender, student number
- **Award points** — skill grid, custom points, nested edit-skills flow

---

## 4. Navigation & layout

| Chrome | Role |
|--------|------|
| **Left nav** | Class list, websites menu, sidebar collapse; seating editor replaces with layout list |
| **Top nav** | Class title, logo |
| **Bottom nav** | View, Sort, Multi-select, Attendance, Random, Timer, Bells, Happy Meter, Settings |
| **Right rail** | Workspace toolbar (context-specific: classes grid, students grid, seating view, seating editor) |

Main stage uses `StageTwoColumnSplit`: content + fixed-width toolbar column. Workspace toolbar stays visible on narrow browser width; stage content shrinks.

---

## 5. Data & persistence rules

- **Soft delete:** classes and students use `is_archived`; archived entities hidden from active views
- **Point events:** append-only ledgers (`point_events`, `custom_point_events`)
- **Student `points` field:** cached total on student row (updated optimistically)
- **Archive student:** removes `student_seat_assignments` without renumbering remaining `seat_index` values
- **URL drives navigation:** `classId` from path; `view` and `mode` from query params

---

## 6. Error & edge cases

| Situation | Expected behavior |
|-----------|-------------------|
| Unauthenticated session | Redirect to `/login` |
| Students/seating view without `classId` | Redirect to `/dashboard` |
| Award with zero eligible students | Alert; no API call |
| API failure after optimistic update | Roll back points/roster in store |
| Seating edit with no layouts | Prompt to create layout |

---

## 7. Not in spec (Prototype 1)

- AI teacher assistance
- Account-level settings page
- Email notifications to parents
- Offline mode
- Parent/student login

---

## 8. Smoke acceptance checklist

Manual QA before release:

- [ ] Login and logout
- [ ] Create class and add students (form + bulk paste)
- [ ] Award skill points (single student + whole class)
- [ ] Award custom points
- [ ] Toggle attendance; verify whole-class award skips absent students
- [ ] Manual multi-select award still includes absent student (override)
- [ ] Switch grid ↔ seating view via bottom nav
- [ ] Enter seating edit mode; create layout, add group, assign student
- [ ] Exit seating edit mode via toolbar close
- [ ] Random picker: spin, award, reset picked
- [ ] Edit skills: add, edit, delete category
- [ ] Archive student; verify seating behavior
- [ ] Archive class; switch active/archived view mode
- [ ] Timer, bells, and happy meter open and close from bottom nav
