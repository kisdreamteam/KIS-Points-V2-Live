'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  EditSkillsModalProps,
  EditSkillsModalViewProps,
} from '@/components/dashboard/modals/EditSkillsModal';
import type { PointCategory } from '@/lib/types';
import type { EditSkillFormSubmitPayload } from '@/components/dashboard/forms/EditSkillForm';
import { useSkillManagement } from '@/hooks/useSkillManagement';
import { useAvailablePositiveIcons, useAvailableNegativeIcons } from '@/hooks/useAvailableIcons';

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

  const positiveSkills = useMemo(
    () =>
      categories.filter(
        (category) => category.is_archived !== true && (category.points ?? category.default_points ?? 0) > 0
      ),
    [categories]
  );

  const negativeSkills = useMemo(
    () =>
      categories.filter(
        (category) => category.is_archived !== true && (category.points ?? category.default_points ?? 0) < 0
      ),
    [categories]
  );

  const filteredSkills = useMemo(() => {
    if (skillType === 'positive') return positiveSkills;
    if (skillType === 'negative') return negativeSkills;
    return [...positiveSkills, ...negativeSkills];
  }, [skillType, positiveSkills, negativeSkills]);

  const handleConfirmDelete = useCallback(async () => {
    if (!skillToDelete) return;
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
      }
      alert(errorMessage);
      setSkillToDelete(null);
    }
  }, [skillToDelete, archiveSkill, classId, refreshCategories]);

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
    categories,
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
    editSkillPositiveIcons,
    editSkillNegativeIcons,
    editSkillPositiveIconsDetecting,
    handleEditSkillSubmit,
  };
}
