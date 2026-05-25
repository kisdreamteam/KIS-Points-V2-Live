# KIS-Points: Student Numbering & Soft-Delete Logic

## Core Philosophy
In KIS-Points, a student's **Display Number** (1, 2, 3...) is a permanent identifier for the duration of the school year. It is strictly tied to the order of enrollment and is never dynamically recalculated based on active student counts.

## 1. Initial Assignment (Chronological)
When students are first added to a class, their display numbers are assigned sequentially based strictly on the order they are added (e.g., student 1 = #1, student 2 = #2). No automatic alphabetical sorting is applied to the numbering.

## 2. The "Archive Gap" (Static Gaps)
To preserve historical records and prevent teacher confusion, **numbers never shift when a student leaves**.
* If Student #5 is soft-deleted (`is_archived: true`), they disappear from the active UI.
* The gap remains permanently. Student #6 remains #6. 

## 3. Mid-Year Additions (The Max + 1 Rule)
When a new student joins a class mid-semester, they do not fill empty gaps left by archived students, nor do they recalculate based on the current active headcount.
* **The Rule:** A new student is always assigned `MAX(student_number) + 1`.
* **Example:** If a class had 10 students, and #5 leaves, there are 9 active students. If two new students arrive, they become #11 and #12. 
* **Implementation Note:** The database query to determine the next number must evaluate ALL students in the class, including archived ones, to find the true maximum number.
* The app implements this via `getNextStartingStudentNumber` in `src/features/students/lib/api/students.ts` (MAX query over non-null `student_number`, no `is_archived` filter).

## 4. Manual Overrides
Teachers retain the ability to manually override and edit a student's number in the UI. If a teacher assigns a number that is already in use, the system should swap the two numbers to prevent duplicates.

