'use client';

import { useCallback } from 'react';
import type {
  AwardPointsModalProps,
  AwardPointsModalViewProps,
} from '@/features/dashboard/components/modals/AwardPointsModal';
import type { AddSkillFormSubmitValues } from '@/features/dashboard/components/forms/AddSkillForm';
import { useAwardPointsModalState } from '@/features/dashboard/hooks/useAwardPointsModalState';
import { useSkillManagement } from '@/features/dashboard/hooks/useSkillManagement';
import { useAvailablePositiveIcons } from '@/features/dashboard/hooks/useAvailablePositiveIcons';
import { useAvailableNegativeIcons } from '@/features/dashboard/hooks/useAvailableNegativeIcons';

export function useAwardPointsModalController(props: AwardPointsModalProps): AwardPointsModalViewProps {
  const {
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
  } = props;

  const isMultiClassMode = Boolean(selectedClassIds && selectedClassIds.length > 0);
  const isMultiStudentMode = Boolean(selectedStudentIds && selectedStudentIds.length > 0);
  const isWholeClassMode = student === null && !isMultiClassMode && !isMultiStudentMode;

  const {
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
  } = useAwardPointsModalState({
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
    skipRefreshAfterAward,
  });

  const {
    availableIcons: addSkillPositiveIcons,
    isDetecting: addSkillPositiveIconsDetecting,
  } = useAvailablePositiveIcons();
  const addSkillNegativeIcons = useAvailableNegativeIcons();

  const { addSkill } = useSkillManagement();
  const handleSubmitAddSkill = useCallback(
    async (values: AddSkillFormSubmitValues) => {
      await addSkill(values);
      refreshCategories();
    },
    [addSkill, refreshCategories]
  );

  return {
    isOpen,
    onClose,
    student,
    classId,
    className,
    classIcon,
    selectedClassIds,
    selectedStudentIds,
    isMultiClassMode,
    isMultiStudentMode,
    isWholeClassMode,
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
    handleSubmitAddSkill,
    addSkillPositiveIcons,
    addSkillNegativeIcons,
    addSkillPositiveIconsDetecting,
  };
}
