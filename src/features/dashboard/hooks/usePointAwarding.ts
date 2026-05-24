'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PointCategory, Student } from '@/lib/types';
import { fetchPointCategoriesByClassIds } from '@/lib/api/points';
import { useAwardPointsService } from '@/features/dashboard/hooks/useAwardPointsService';

const skillsByScopeCache = new Map<string, PointCategory[]>();

const addCacheBuster = (iconPath: string, cacheKey?: string | number): string => {
  if (!iconPath) return iconPath;
  const separator = iconPath.includes('?') ? '&' : '?';
  const version = cacheKey || Date.now();
  return `${iconPath}${separator}v=${version}`;
};

function toSkillScopeKey(classIds: string[]): string {
  return [...classIds].sort().join(',');
}

function normalizeCategoryIcons(data: PointCategory[]): PointCategory[] {
  return data.map((category) => ({
    ...category,
    icon: category.icon?.includes('/images/classes/icons/icon-pos-')
      ? category.icon.replace('/images/classes/icons/icon-pos-', '/images/dashboard/award-points-icons/icons-positive/icon-pos-')
      : category.icon?.includes('/images/classes/icons/icon-neg-')
      ? category.icon.replace('/images/classes/icons/icon-neg-', '/images/dashboard/award-points-icons/icons-negative/icon-neg-')
      : category.icon,
  }));
}

type UsePointAwardingParams = {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classId: string;
  className?: string;
  classIcon?: string;
  onRefresh?: () => void;
  onPointsAwarded?: (awardInfo: {
    studentAvatar: string;
    studentFirstName: string;
    points: number;
    categoryName: string;
    categoryIcon?: string;
  }) => void;
  selectedClassIds?: string[];
  selectedStudentIds?: string[];
  onAwardComplete?: (selectedIds: string[], type: 'classes' | 'students') => void;
  skipRefreshAfterAward?: boolean;
};

export function usePointAwarding({
  isOpen,
  onClose,
  student,
  classId,
  className,
  classIcon,
  onRefresh,
  onPointsAwarded,
  selectedClassIds,
  selectedStudentIds,
  onAwardComplete,
  skipRefreshAfterAward = false,
}: UsePointAwardingParams) {
  const [categories, setCategories] = useState<PointCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positive' | 'negative' | 'custom'>('positive');
  const [customPoints, setCustomPoints] = useState<number>(0);
  const [customMemo, setCustomMemo] = useState<string>('');
  const [isManageSkillsModalOpen, setManageSkillsModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [imageCacheKey, setImageCacheKey] = useState<number>(Date.now());

  const { awardSkill, awardCustom } = useAwardPointsService({
    context: {
      studentId: student?.id ?? null,
      classId,
      selectedClassIds,
      selectedStudentIds,
    },
    student,
    className,
    classIcon,
    onRefresh,
    onPointsAwarded,
    onAwardComplete,
    onClose,
    skipRefreshAfterAward,
  });

  const fetchCategories = useCallback(async (force = false) => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const classIdsToFetch = selectedClassIds && selectedClassIds.length > 0 ? selectedClassIds : [classId];
      const cacheKey = toSkillScopeKey(classIdsToFetch);
      const cached = skillsByScopeCache.get(cacheKey);
      if (!force && cached) {
        setCategories(cached);
        return;
      }

      const data = await fetchPointCategoriesByClassIds(classIdsToFetch);
      const normalizedData = normalizeCategoryIcons(data || []);
      skillsByScopeCache.set(cacheKey, normalizedData);
      setCategories(normalizedData);
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, selectedClassIds, classId]);

  const refreshCategories = useCallback(() => {
    void fetchCategories(true);
  }, [fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      setImageCacheKey(Date.now());
      void fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_archived !== true),
    [categories]
  );

  const positiveSkills = useMemo(
    () =>
      activeCategories
        .filter((category) => (category.points ?? category.default_points ?? 0) > 0)
        .map((category) => ({
          id: category.id,
          name: category.name,
          points: category.points ?? category.default_points ?? 0,
          icon: category.icon,
        })),
    [activeCategories]
  );

  const negativeSkills = useMemo(
    () =>
      activeCategories
        .filter((category) => (category.points ?? category.default_points ?? 0) < 0)
        .map((category) => ({
          id: category.id,
          name: category.name,
          points: category.points ?? category.default_points ?? 0,
          icon: category.icon,
        })),
    [activeCategories]
  );

  const handleCustomAward = useCallback(async () => {
    const didSucceed = await awardCustom(customPoints, customMemo);
    if (didSucceed) {
      setCustomPoints(0);
      setCustomMemo('');
    }
  }, [awardCustom, customPoints, customMemo]);

  return {
    categories,
    isLoading,
    activeTab,
    setActiveTab,
    customPoints,
    setCustomPoints,
    customMemo,
    setCustomMemo,
    isManageSkillsModalOpen,
    setManageSkillsModalOpen,
    isEditModalOpen,
    setEditModalOpen,
    imageCacheKey,
    activeCategories,
    positiveSkills,
    negativeSkills,
    refreshCategories,
    awardSkill,
    handleCustomAward,
    addCacheBuster,
  };
}
