import { createClient } from '@/lib/client';
import type { PointCategory } from '@/lib/types';

export const GENERAL_CATEGORY_NAME = 'General';

const DEFAULT_POSITIVE_GENERAL_ICON =
  '/images/dashboard/award-points-icons/icons-positive/icon-pos-1.png';
const DEFAULT_NEGATIVE_GENERAL_ICON =
  '/images/dashboard/award-points-icons/icons-negative/icon-neg-1.png';

export function isGeneralCategory(category: Pick<PointCategory, 'name'>): boolean {
  return category.name.trim().toLowerCase() === GENERAL_CATEGORY_NAME.toLowerCase();
}

function resolveCategoryType(category: Pick<PointCategory, 'type' | 'points' | 'default_points'>): 'positive' | 'negative' {
  if (category.type === 'positive' || category.type === 'negative') {
    return category.type;
  }
  return (category.points ?? category.default_points ?? 0) >= 0 ? 'positive' : 'negative';
}

function getCategorySortOrder(category: Pick<PointCategory, 'sort_order'>): number {
  return category.sort_order ?? 0;
}

function findGeneralCategoryByName(
  categories: PointCategory[],
  type: 'positive' | 'negative'
): PointCategory | undefined {
  const sign = type === 'positive' ? 1 : -1;
  return categories.find(
    (category) =>
      category.is_archived !== true &&
      isGeneralCategory(category) &&
      resolveCategoryType(category) === type &&
      (category.points ?? category.default_points ?? 0) * sign > 0
  );
}

async function bumpSortOrdersForType(
  classId: string,
  type: 'positive' | 'negative'
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('point_categories')
    .select('id, type, points, sort_order')
    .eq('class_id', classId)
    .eq('is_archived', false);

  if (error) throw error;

  const rows = (data ?? []) as PointCategory[];
  const idsToBump = rows
    .filter((row) => resolveCategoryType(row) === type && getCategorySortOrder(row) >= 0)
    .map((row) => row.id);

  await Promise.all(
    idsToBump.map(async (id) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return;
      const { error: updateError } = await supabase
        .from('point_categories')
        .update({ sort_order: getCategorySortOrder(row) + 1 })
        .eq('id', id);
      if (updateError) throw updateError;
    })
  );
}

async function getNextSortOrder(classId: string, type: 'positive' | 'negative'): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('point_categories')
    .select('id, type, points, sort_order')
    .eq('class_id', classId)
    .eq('is_archived', false);

  if (error) throw error;

  const rows = ((data ?? []) as PointCategory[]).filter((row) => resolveCategoryType(row) === type);
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((row) => getCategorySortOrder(row))) + 1;
}

async function ensureGeneralAtSlotZero(
  classId: string,
  type: 'positive' | 'negative',
  existing: PointCategory | undefined,
  insertPayload: { name: string; points: number; type: 'positive' | 'negative'; icon: string }
): Promise<PointCategory> {
  const supabase = createClient();

  if (existing) {
    if (getCategorySortOrder(existing) !== 0) {
      await bumpSortOrdersForType(classId, type);
      const { data: updated, error: updateError } = await supabase
        .from('point_categories')
        .update({ sort_order: 0 })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (updateError) throw updateError;
      return updated as PointCategory;
    }
    return existing;
  }

  const occupantAtZero = await findOccupantAtSlotZero(classId, type);
  if (occupantAtZero) {
    await bumpSortOrdersForType(classId, type);
  }

  const { data: inserted, error: insertError } = await supabase
    .from('point_categories')
    .insert({
      ...insertPayload,
      class_id: classId,
      sort_order: 0,
    })
    .select('*')
    .single();
  if (insertError) throw insertError;
  return inserted as PointCategory;
}

async function findOccupantAtSlotZero(
  classId: string,
  type: 'positive' | 'negative'
): Promise<PointCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('point_categories')
    .select('*')
    .eq('class_id', classId)
    .eq('is_archived', false)
    .eq('sort_order', 0);

  if (error) throw error;

  const rows = (data ?? []) as PointCategory[];
  return rows.find((row) => resolveCategoryType(row) === type) ?? null;
}

export type DefaultGeneralCategoryIds = {
  positiveGeneralId: string;
  negativeGeneralId: string;
};

export async function ensureDefaultGeneralCategories(
  classId: string
): Promise<DefaultGeneralCategoryIds> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { data, error } = await supabase
    .from('point_categories')
    .select('*')
    .eq('class_id', classId)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  const categories = (data ?? []) as PointCategory[];
  const positiveGeneral = findGeneralCategoryByName(categories, 'positive');
  const negativeGeneral = findGeneralCategoryByName(categories, 'negative');

  const ensuredPositive = await ensureGeneralAtSlotZero(classId, 'positive', positiveGeneral, {
    name: GENERAL_CATEGORY_NAME,
    points: 1,
    type: 'positive',
    icon: DEFAULT_POSITIVE_GENERAL_ICON,
  });

  const ensuredNegative = await ensureGeneralAtSlotZero(classId, 'negative', negativeGeneral, {
    name: GENERAL_CATEGORY_NAME,
    points: -1,
    type: 'negative',
    icon: DEFAULT_NEGATIVE_GENERAL_ICON,
  });

  return {
    positiveGeneralId: ensuredPositive.id,
    negativeGeneralId: ensuredNegative.id,
  };
}

export async function createSkill(params: {
  classId: string;
  name: string;
  points: number;
  type: 'positive' | 'negative';
  icon: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const sortOrder = await getNextSortOrder(params.classId, params.type);

  const { error } = await supabase.from('point_categories').insert({
    name: params.name,
    points: params.points,
    type: params.type,
    class_id: params.classId,
    icon: params.icon,
    sort_order: sortOrder,
  });
  if (error) throw error;
}

export async function updateSkill(params: {
  skillId: string;
  name: string;
  points: number;
  icon: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { error } = await supabase
    .from('point_categories')
    .update({
      name: params.name,
      points: params.points,
      icon: params.icon,
    })
    .eq('id', params.skillId);
  if (error) throw error;
}

export async function archiveSkill(params: {
  skillId: string;
  classId: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { data: skillData, error: fetchError } = await supabase
    .from('point_categories')
    .select('class_id, name, sort_order')
    .eq('id', params.skillId)
    .single();
  if (fetchError || !skillData) {
    throw fetchError ?? new Error('Skill not found');
  }
  if (skillData.class_id !== params.classId) {
    throw new Error('SKILL_CLASS_MISMATCH');
  }
  if (skillData.sort_order === 0) {
    throw new Error('DEFAULT_CATEGORY_PROTECTED');
  }
  if (isGeneralCategory({ name: skillData.name })) {
    throw new Error('GENERAL_CATEGORY_PROTECTED');
  }

  const { error } = await supabase
    .from('point_categories')
    .update({ is_archived: true })
    .eq('id', params.skillId)
    .eq('class_id', params.classId);
  if (error) throw error;
}
