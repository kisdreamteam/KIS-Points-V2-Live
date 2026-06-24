import type { PointCategory } from '@/lib/types';
import { resolveCategoryType } from '@/features/dashboard/lib/api/skills';

export function getCategorySortOrder(category: PointCategory): number {
  return category.sort_order ?? 0;
}

export function isDefaultCategorySlot(category: Pick<PointCategory, 'sort_order'>): boolean {
  return getCategorySortOrder(category as PointCategory) === 0;
}

export function sortPointCategoriesForDisplay(categories: PointCategory[]): PointCategory[] {
  return [...categories].sort((a, b) => {
    const orderDiff = getCategorySortOrder(a) - getCategorySortOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return a.id.localeCompare(b.id);
  });
}

export function getDefaultCategoryForType(
  categories: PointCategory[],
  type: 'positive' | 'negative'
): PointCategory | undefined {
  const active = categories.filter((category) => category.is_archived !== true);
  const slotZero = active.find(
    (category) => isDefaultCategorySlot(category) && resolveCategoryType(category) === type
  );
  if (slotZero) return slotZero;
  return active.find((category) => resolveCategoryType(category) === type);
}
