'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PointCategory, Student } from '@/lib/types';
import { fetchPointCategoriesByClassIds } from '@/features/dashboard/lib/api/points';
import { ensureDefaultGeneralCategories, resolveCategoryType } from '@/features/dashboard/lib/api/skills';
import {
  getDefaultCategoryForType,
  sortPointCategoriesForDisplay,
} from '@/features/dashboard/lib/sortPointCategories';
import { useSubmitPointAward } from '@/features/dashboard/hooks/useSubmitPointAward';

export type AwardPointsTab = 'positive' | 'negative';
export type AwardPointWeight = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const skillsByScopeCache = new Map<string, PointCategory[]>();

export function invalidateAwardPointsSkillsCache(classIds?: string[]): void {
  if (!classIds || classIds.length === 0) {
    skillsByScopeCache.clear();
    return;
  }
  const key = [...classIds].sort().join(',');
  skillsByScopeCache.delete(key);
}

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

type UseAwardPointsModalStateParams = {
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
    pointsDelta: number;
    categoryName: string;
    categoryIcon?: string;
  }) => void;
  selectedClassIds?: string[];
  selectedStudentIds?: string[];
  onAwardComplete?: (selectedIds: string[], type: 'classes' | 'students') => void;
  skipRefreshAfterAward?: boolean;
};

export function useAwardPointsModalState({
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
}: UseAwardPointsModalStateParams) {
  const [categories, setCategories] = useState<PointCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTabState] = useState<AwardPointsTab>('positive');
  const [selectedWeight, setSelectedWeight] = useState<AwardPointWeight>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPoints, setCustomPoints] = useState<number>(0);
  const [customMemo, setCustomMemo] = useState<string>('');
  const [isManageSkillsModalOpen, setManageSkillsModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [imageCacheKey, setImageCacheKey] = useState<number>(Date.now());
  const [generalCategoryIds, setGeneralCategoryIds] = useState<{
    positiveGeneralId: string;
    negativeGeneralId: string;
  } | null>(null);

  const { awardSkill, awardCustom, isSubmitting } = useSubmitPointAward({
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

  const resetSelectionState = useCallback(() => {
    setActiveTabState('positive');
    setSelectedWeight(1);
    setIsCustomMode(false);
    setCustomPoints(0);
    setCustomMemo('');
  }, []);

  const fetchCategories = useCallback(async (force = false) => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const classIdsToFetch = selectedClassIds && selectedClassIds.length > 0 ? selectedClassIds : [classId];
      const cacheKey = toSkillScopeKey(classIdsToFetch);

      if (force) {
        invalidateAwardPointsSkillsCache(classIdsToFetch);
      }

      let generalIds: { positiveGeneralId: string; negativeGeneralId: string } | null = null;
      if (!selectedClassIds || selectedClassIds.length === 0) {
        generalIds = await ensureDefaultGeneralCategories(classId);
        setGeneralCategoryIds(generalIds);
        invalidateAwardPointsSkillsCache(classIdsToFetch);
      }

      const cached = skillsByScopeCache.get(cacheKey);
      if (!force && cached) {
        setCategories(cached);
        if (generalIds) {
          setSelectedCategoryId(generalIds.positiveGeneralId);
        }
        return;
      }

      const data = await fetchPointCategoriesByClassIds(classIdsToFetch);
      const normalizedData = sortPointCategoriesForDisplay(normalizeCategoryIcons(data || []));
      skillsByScopeCache.set(cacheKey, normalizedData);
      setCategories(normalizedData);

      if (generalIds) {
        setSelectedCategoryId(generalIds.positiveGeneralId);
      } else {
        const defaultPositive = getDefaultCategoryForType(normalizedData, 'positive');
        setSelectedCategoryId(defaultPositive?.id ?? null);
      }
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setCategories([]);
      setSelectedCategoryId(null);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, selectedClassIds, classId]);

  const refreshCategories = useCallback(() => {
    void fetchCategories(true);
  }, [fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      resetSelectionState();
      setImageCacheKey(Date.now());
      void fetchCategories(true);
    }
  }, [isOpen, fetchCategories, resetSelectionState]);

  const setActiveTab = useCallback(
    (tab: AwardPointsTab) => {
      setActiveTabState(tab);
      setSelectedWeight(1);
      setIsCustomMode(false);
      if (generalCategoryIds) {
        setSelectedCategoryId(
          tab === 'positive' ? generalCategoryIds.positiveGeneralId : generalCategoryIds.negativeGeneralId
        );
        return;
      }
      const defaultCategory = getDefaultCategoryForType(categories, tab);
      setSelectedCategoryId(defaultCategory?.id ?? null);
    },
    [generalCategoryIds, categories]
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_archived !== true),
    [categories]
  );

  const positiveSkills = useMemo(
    () =>
      activeCategories
        .filter((category) => resolveCategoryType(category) === 'positive')
        .map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
        })),
    [activeCategories]
  );

  const negativeSkills = useMemo(
    () =>
      activeCategories
        .filter((category) => resolveCategoryType(category) === 'negative')
        .map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
        })),
    [activeCategories]
  );

  const handleConfirmAward = useCallback(async () => {
    if (isCustomMode) {
      const magnitude = Math.abs(customPoints);
      if (magnitude === 0 || Number.isNaN(magnitude)) {
        alert('Please enter a valid point value (not zero).');
        return;
      }
      const signedPoints = activeTab === 'positive' ? magnitude : -magnitude;
      const didSucceed = await awardCustom(signedPoints, customMemo);
      if (didSucceed) {
        setCustomPoints(0);
        setCustomMemo('');
      }
      return;
    }

    if (!selectedCategoryId) {
      alert('Please select a category to award points.');
      return;
    }

    const category = activeCategories.find((c) => c.id === selectedCategoryId);
    if (!category) {
      alert('Selected category is no longer available. Please choose another.');
      return;
    }

    const signedWeight = activeTab === 'positive' ? selectedWeight : -selectedWeight;
    await awardSkill(category, signedWeight);
  }, [
    isCustomMode,
    customPoints,
    customMemo,
    activeTab,
    awardCustom,
    selectedCategoryId,
    activeCategories,
    selectedWeight,
    awardSkill,
  ]);

  const enterCustomMode = useCallback(() => {
    setIsCustomMode(true);
    setCustomPoints(0);
    setCustomMemo('');
  }, []);

  const exitCustomMode = useCallback(() => {
    setIsCustomMode(false);
    setCustomPoints(0);
    setCustomMemo('');
  }, []);

  return {
    categories,
    isLoading,
    activeTab,
    setActiveTab,
    selectedWeight,
    setSelectedWeight,
    selectedCategoryId,
    setSelectedCategoryId,
    isCustomMode,
    enterCustomMode,
    exitCustomMode,
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
    handleConfirmAward,
    isSubmitting,
    addCacheBuster,
  };
}
