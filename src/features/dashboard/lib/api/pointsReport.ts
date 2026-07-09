import { createClient } from '@/lib/client';
import type { PointCategory } from '@/lib/types';
import { throwApiError } from '@/lib/api/errors';

export type ConsolidatedCategoryOption = {
  nameKey: string;
  displayName: string;
  categoryIds: string[];
};

export function buildConsolidatedCategoryCatalog(
  categories: PointCategory[]
): ConsolidatedCategoryOption[] {
  const byKey = new Map<string, ConsolidatedCategoryOption>();

  for (const category of categories) {
    const nameKey = category.name.trim().toLowerCase();
    if (!nameKey) continue;

    const existing = byKey.get(nameKey);
    if (existing) {
      existing.categoryIds.push(category.id);
      continue;
    }

    byKey.set(nameKey, {
      nameKey,
      displayName: category.name.trim(),
      categoryIds: [category.id],
    });
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
}

export function resolveCategoryIdsForNameKeys(
  catalog: ConsolidatedCategoryOption[],
  nameKeys: string[]
): string[] {
  const keySet = new Set(nameKeys);
  const ids = new Set<string>();

  for (const option of catalog) {
    if (!keySet.has(option.nameKey)) continue;
    for (const id of option.categoryIds) {
      ids.add(id);
    }
  }

  return Array.from(ids);
}

export async function listStudentCategoryPointTotals(params: {
  studentIds: string[];
  categoryIds: string[];
}): Promise<Map<string, number>> {
  const { studentIds, categoryIds } = params;
  const totals = new Map<string, number>();

  if (studentIds.length === 0 || categoryIds.length === 0) {
    return totals;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('point_events')
    .select('student_id, points')
    .in('student_id', studentIds)
    .in('category_id', categoryIds);

  if (error) throwApiError(error, 'listStudentCategoryPointTotals');

  for (const row of (data ?? []) as Array<{ student_id: string; points: number | null }>) {
    const studentId = row.student_id;
    const delta = Number(row.points ?? 0);
    totals.set(studentId, (totals.get(studentId) ?? 0) + delta);
  }

  return totals;
}
