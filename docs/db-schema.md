# KIS-Points: Database Schema (Supabase)

## Core Architectural Rules
1. **Optimistic UI Context:** This schema represents the "Library" (Database). Data is fetched by Layer 3 APIs and stored in the "Desk" (Zustand/React Context) for zero-latency UI updates.
2. **Soft Deletes:** Key entities use `is_archived` to preserve historical point ledgers without hard-deleting records.
3. **Immutability:** Event logs (`point_events`, `custom_point_events`, `attendance_events`) are append-only.

---

### 1. Users & Profiles
**Table: `profiles`**
Stores extended user information and application preferences.
* `id` (uuid, PK)
* `name` (text)
* `title` (text, nullable)
* `role` (text)
* `preferred_language` (text, nullable)
* `preferred_view` (text)

**Table: `class_collaborators`**
Allows multiple teachers/staff to manage a single class.
* `id` (uuid, PK)
* `class_id` (uuid, FK to classes)
* `collaborator_id` (uuid, FK to profiles)
* `primary_user` (boolean, nullable)

---

### 2. Core Roster
**Table: `classes`**
* `id` (uuid, PK)
* `name` (text)
* `grade` (text)
* `teacher_id` (uuid, FK to profiles)
* `school_year` (text)
* `is_archived` (boolean)
* `created_at` (timestamptz)
* `icon` (text)

**Table: `students`** 
Note: Students are mapped directly to classes (1:N).
* `id` (uuid, PK)
* `first_name` (text)
* `last_name` (text, nullable)
* `points` (int4) - *Current cached total*
* `avatar` (text)
* `student_number` (int4, nullable) - *Front-end display number*
* `class_id` (uuid, FK to classes)
* `gender` (text, nullable)
* `has_been_picked` (boolean) - *State for random student picker*
* `is_archived` (boolean, nullable) - *Soft-delete; archiving removes `student_seat_assignments` rows without renumbering remaining `seat_index` values*

---

### 3. Points Engine 
**Table: `point_categories`**
The predefined criteria for earning/losing points.
* `id` (uuid, PK)
* `name` (text)
* `points` (int4) - *Sign marker (±1) for positive/negative bucketing; not the award amount*
* `type` (text) - *e.g., positive, negative*
* `class_id` (uuid, FK to classes)
* `icon` (text, nullable)
* `is_archived` (boolean, nullable)
* `sort_order` (int4) - *Display order within class+type; `0` = default slot (General)*

**Table: `point_events`**
Ledger for points awarded using predefined categories.
* `id` (uuid, PK)
* `teacher_id` (uuid, FK to profiles)
* `points` (int4) - *Awarded amount (weight selected in modal)*
* `memo` (text, nullable)
* `category_id` (uuid, FK to point_categories)
* `created_at` (timestamptz)
* `student_id` (uuid, FK to students)

**Table: `custom_point_events`**
Ledger for ad-hoc points awarded without a predefined category.
* `id` (uuid, PK)
* `created_at` (timestamptz)
* `teacher_id` (uuid, FK to profiles)
* `student_id` (uuid, FK to students)
* `points` (int4)
* `memo` (text, nullable)

---

### 4. Advanced Seating Physics Engine
*This structure handles the complex 1-column, 2-column, and 3-column classroom layouts.*

**Table: `seating_charts`**
The master configuration for a room's layout.
* `id` (uuid, PK)
* `name` (text)
* `class_id` (uuid, FK to classes)
* `created_at` (timestamptz)
* `is_active` (boolean)
* `show_grid` (boolean)
* `show_objects` (boolean)
* `layout_orientation` (text)

**Table: `seating_groups`**
Defines a specific cluster of desks (e.g., a "table" or "row").
* `id` (uuid, PK)
* `name` (text)
* `sort_order` (int4)
* `group_columns` (int4) - *Handles the 1/2/3 column logic*
* `group_rows` (int4)
* `position_x` (numeric) - *Coordinate layout physics*
* `position_y` (numeric) - *Coordinate layout physics*
* `seating_chart_id` (uuid, FK to seating_charts)

**Table: `student_seat_assignments`**
Maps a specific student to a specific seat index within a seating group.
* `id` (uuid, PK)
* `created_at` (timestamptz)
* `student_id` (uuid, FK to students)
* `seating_group_id` (uuid, FK to seating_groups)
* `seat_index` (int4, nullable) - *Determines exact desk inside the group grid*

---

### 5. Student Attendance
**Table: `attendance_events`**
Append-only daily absence log (one row per student per calendar day).
* `id` (uuid, PK, default: gen_random_uuid())
* `student_id` (uuid, FK to students, ON DELETE CASCADE, NOT NULL)
* `class_id` (uuid, FK to classes, ON DELETE CASCADE, NOT NULL)
* `teacher_id` (uuid, FK to profiles, ON DELETE RESTRICT, NOT NULL)
* `date` (date, default: CURRENT_DATE, NOT NULL)
* `created_at` (timestamptz, default: NOW(), NOT NULL)

**Constraints:**
* `UNIQUE(student_id, date)` — constraint name: `unique_student_absence_per_day`