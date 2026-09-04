# Supabase migrations

## Collaborators (`class_collaborators`)

If you see **404** errors for `lookup_teacher_by_email`, `list_class_collaborators`, or `class_collaborators` in the browser console, the migration has not been applied to your remote project yet.

### Apply the migration

1. Open the Supabase Dashboard for your project.
2. Go to **SQL Editor** → **New query**.
3. Paste and run [`migrations/20250406000000_class_collaborators_and_rpcs.sql`](./migrations/20250406000000_class_collaborators_and_rpcs.sql) (creates table, RLS including hardened INSERT, and RPCs).

If you **already** applied an older version of that file **without** `collaborator_id <> auth.uid()` on INSERT, also run [`migrations/20250406100000_class_collaborators_insert_owner_harden.sql`](./migrations/20250406100000_class_collaborators_insert_owner_harden.sql) to replace the INSERT policy.

Alternatively, if you use the Supabase CLI with a linked project:

```bash
supabase db push
```

(from a repo root that includes `supabase/config.toml` and is linked to your project)

### Verify objects exist

Run in **SQL Editor**:

```sql
-- Table
SELECT to_regclass('public.class_collaborators') IS NOT NULL AS class_collaborators_exists;

-- RPCs (should return 2 rows)
SELECT proname
FROM pg_proc
JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('lookup_teacher_by_email', 'list_class_collaborators');
```

### Manual retest (EditClassModal → Teachers)

1. Open **Edit Class** → **Teachers** tab (as the class owner).
2. Add a valid `@kshcm.net` email for an existing teacher → confirm dialog → row appears in list → success modal.
3. Try an email with no account → “Teacher not found” modal.
4. Remove a collaborator → row disappears.
5. Non-owners should not be able to insert/delete collaborator rows (RLS).

---

## Point event ledgers (`point_events`, `custom_point_events`)

Browser clients SELECT both ledgers, INSERT into `custom_point_events`, and DELETE `custom_point_events` on points reset. Standard awards often go through RPC `award_points_to_student`, but SELECT/INSERT policies still close the direct-table path.

### Apply the migration

1. Open the Supabase Dashboard for your project.
2. Go to **SQL Editor** → **New query**.
3. Paste and run [`migrations/20250904120000_point_events_owner_collaborator_policies.sql`](./migrations/20250904120000_point_events_owner_collaborator_policies.sql).

Requires prior helpers `is_class_owner` / `is_collaborator_for_class` (from the collaborators RLS migrations).

Alternatively, if you use the Supabase CLI with a linked project:

```bash
supabase db push
```

### Verify RLS is enabled and policies exist

Run in **SQL Editor**:

```sql
SELECT relname, relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND relname IN ('point_events', 'custom_point_events');

SELECT polname, tablename
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('point_events', 'custom_point_events')
ORDER BY tablename, polname;
```

Expect `relrowsecurity = true` for both tables, and policies for SELECT/INSERT on both plus DELETE on `custom_point_events` only.

---

## Class soft-delete only

Classes are archived via `is_archived` (no permanent delete in the app). If you previously applied a draft `delete_class_permanently` RPC, remove it:

```sql
DROP FUNCTION IF EXISTS public.delete_class_permanently(uuid);
```
