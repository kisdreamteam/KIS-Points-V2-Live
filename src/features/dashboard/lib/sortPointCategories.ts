import type { PointCategory } from '@/lib/types';

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
  const sign = type === 'positive' ? 1 : -1;
  const active = categories.filter((category) => category.is_archived !== true);
  const slotZero = active.find(
    (category) =>
      isDefaultCategorySlot(category) &&
      (category.points ?? category.default_points ?? 0) * sign > 0
  );
  if (slotZero) return slotZero;
  return active.find((category) => (category.points ?? category.default_points ?? 0) * sign > 0);
}
