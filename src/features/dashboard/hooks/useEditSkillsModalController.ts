'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  EditSkillsModalProps,
  EditSkillsModalViewProps,
} from '@/features/dashboard/components/modals/EditSkillsModal';
import type { PointCategory } from '@/lib/types';
import type { EditSkillFormSubmitPayload } from '@/features/dashboard/components/forms/EditSkillForm';
import { isDefaultCategorySlot, sortPointCategoriesForDisplay } from '@/features/dashboard/lib/sortPointCategories';
import { useSkillManagement } from '@/features/dashboard/hooks/useSkillManagement';
import { useAvailablePositiveIcons } from '@/features/dashboard/hooks/useAvailablePositiveIcons';
import { useAvailableNegativeIcons } from '@/features/dashboard/hooks/useAvailableNegativeIcons';

export function useEditSkillsModalController(props: EditSkillsModalProps): EditSkillsModalViewProps {
  const { isOpen, onClose, classId, categories, isLoading, refreshCategories, skillType } = props;

  const { archiveSkill, deletingSkillId, updateSkill } = useSkillManagement();

  const {
    availableIcons: editSkillPositiveIcons,
    isDetecting: editSkillPositiveIconsDetecting,
  } = useAvailablePositiveIcons();
  const editSkillNegativeIcons = useAvailableNegativeIcons();
  const [editingSkill, setEditingSkill] = useState<PointCategory | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<PointCategory | null>(null);

  const sortedCategories = useMemo(
    () => sortPointCategoriesForDisplay(categories),
    [categories]
  );

  const positiveSkills = useMemo(
    () =>
      sortedCategories.filter(
        (category) => category.is_archived !== true && (category.points ?? category.default_points ?? 0) > 0
      ),
    [sortedCategories]
  );

  const negativeSkills = useMemo(
    () =>
      sortedCategories.filter(
        (category) => category.is_archived !== true && (category.points ?? category.default_points ?? 0) < 0
      ),
    [sortedCategories]
  );

  const filteredSkills = useMemo(() => {
    if (skillType === 'positive') return positiveSkills;
    if (skillType === 'negative') return negativeSkills;
    return [...positiveSkills, ...negativeSkills];
  }, [skillType, positiveSkills, negativeSkills]);

  const handleConfirmDelete = useCallback(async () => {
    if (!skillToDelete) return;
    if (isDefaultCategorySlot(skillToDelete)) {
      alert('The default category cannot be deleted. You can rename it or change its icon.');
      setSkillToDelete(null);
      return;
    }
    try {
      await archiveSkill(skillToDelete.id, classId);
      refreshCategories();
      setSkillToDelete(null);
    } catch (error) {
      console.error('Unexpected error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        if (error.message === 'AUTH_REQUIRED') errorMessage = 'You must be logged in to delete skills.';
        else if (error.message === 'SKILL_CLASS_MISMATCH')
          errorMessage = 'This skill does not belong to the current class.';
        else if (error.message === 'DEFAULT_CATEGORY_PROTECTED' || error.message === 'GENERAL_CATEGORY_PROTECTED')
          errorMessage = 'The default category cannot be deleted.';
      }
      alert(errorMessage);
      setSkillToDelete(null);
    }
  }, [skillToDelete, archiveSkill, classId, refreshCategories]);

  const handleRequestDelete = useCallback((category: PointCategory) => {
    if (isDefaultCategorySlot(category)) {
      alert('The default category cannot be deleted. You can rename it or change its icon.');
      return;
    }
    setSkillToDelete(category);
  }, []);

  const handleEditSkillSubmit = useCallback(
    async (values: EditSkillFormSubmitPayload) => {
      await updateSkill({
        skillId: values.skillId,
        name: values.name,
        points: values.points,
        icon: values.icon,
      });
      refreshCategories();
    },
    [updateSkill, refreshCategories]
  );

  return {
    isOpen,
    onClose,
    classId,
    categories: sortedCategories,
    isLoading,
    refreshCategories,
    skillType,
    filteredSkills,
    editingSkill,
    setEditingSkill,
    hoveredSkillId,
    setHoveredSkillId,
    skillToDelete,
    setSkillToDelete,
    deletingSkillId,
    handleConfirmDelete,
    handleRequestDelete,
    editSkillPositiveIcons,
    editSkillNegativeIcons,
    editSkillPositiveIconsDetecting,
    handleEditSkillSubmit,
  };
}
