'use client';

import { useCallback, useState } from 'react';
import { archiveSkill as archiveSkillApi, createSkill as createSkillApi, updateSkill as updateSkillApi } from '@/features/dashboard/lib/api/skills';
import type { AddSkillFormSubmitValues } from '@/features/dashboard/components/forms/AddSkillForm';

type UpdateSkillValues = {
  skillId: string;
  name: string;
  icon: string;
};

export function useSkillManagement() {
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);

  const addSkill = useCallback(async (values: AddSkillFormSubmitValues) => {
    setIsSaving(true);
    try {
      await createSkillApi({
        classId: values.classId,
        name: values.name,
        type: values.type,
        icon: values.icon,
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateSkill = useCallback(async (values: UpdateSkillValues) => {
    setIsSaving(true);
    try {
      await updateSkillApi(values);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const archiveSkill = useCallback(async (skillId: string, classId: string) => {
    setDeletingSkillId(skillId);
    try {
      await archiveSkillApi({ skillId, classId });
    } finally {
      setDeletingSkillId(null);
    }
  }, []);

  return {
    isSaving,
    deletingSkillId,
    addSkill,
    updateSkill,
    archiveSkill,
  };
}
