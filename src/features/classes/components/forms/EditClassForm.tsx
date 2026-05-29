'use client';

import { useState } from 'react';
import EditClassModalTabs, { type EditClassTab } from '@/features/classes/components/forms/edit-class/EditClassModalTabs';
import EditClassInfoTab from '@/features/classes/components/forms/edit-class/EditClassInfoTab';
import EditClassStudentsTab from '@/features/classes/components/forms/edit-class/EditClassStudentsTab';
import EditClassTeachersTab from '@/features/classes/components/forms/edit-class/EditClassTeachersTab';
import EditClassSettingsTab from '@/features/classes/components/forms/edit-class/EditClassSettingsTab';
import { useClassManagement } from '@/features/classes/hooks/useClassManagement';

export type { EditClassTab };

type EditClassFormProps = {
  mgmt: ReturnType<typeof useClassManagement>;
  onClose: () => void;
  onAddStudent: () => void;
};

export default function EditClassForm({ mgmt, onClose, onAddStudent }: EditClassFormProps) {
  const [activeTab, setActiveTab] = useState<EditClassTab>('info');

  return (
    <>
      <EditClassModalTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {mgmt.isLoadingData ? (
        <div className="py-16 text-center text-gray-500">Loading class data...</div>
      ) : (
        <>
          {activeTab === 'info' && (
            <EditClassInfoTab
              className={mgmt.className}
              grade={mgmt.grade}
              selectedIcon={mgmt.selectedIcon}
              onClassNameChange={mgmt.setClassName}
              onGradeChange={mgmt.setGrade}
              onIconChange={mgmt.setSelectedIcon}
              isClassOwner={mgmt.isClassOwner}
              isLoading={mgmt.isLoading}
              onSave={() => void mgmt.handleSaveInfo()}
              onCancel={onClose}
            />
          )}

          {activeTab === 'students' && (
            <EditClassStudentsTab
              students={mgmt.students}
              hasUnsavedChanges={mgmt.hasUnsavedChanges}
              isLoading={mgmt.isLoading}
              onAddStudent={onAddStudent}
              onSwitchNames={mgmt.handleSwitchFirstAndLastNames}
              onCancel={mgmt.handleCancelChanges}
              onSave={() => void mgmt.handleSaveAllChanges()}
              onFieldChange={mgmt.updateStudentField}
              onGenderToggle={mgmt.handleGenderToggle}
            />
          )}

          {activeTab === 'teachers' && (
            <EditClassTeachersTab
              newTeacherEmail={mgmt.newTeacherEmail}
              onEmailChange={mgmt.setNewTeacherEmail}
              teachers={mgmt.teachers}
              isClassOwner={mgmt.isClassOwner}
              isLoading={mgmt.isLoading}
              onAdd={() => void mgmt.handleAddTeacher()}
              onRemove={(rowId, label) => void mgmt.handleRemoveTeacher(rowId, label)}
            />
          )}

          {activeTab === 'settings' && (
            <EditClassSettingsTab
              isClassOwner={mgmt.isClassOwner}
              isResettingPoints={mgmt.isResettingPoints}
              onResetPointsClick={() => mgmt.setShowResetPointsPopup(true)}
            />
          )}
        </>
      )}
    </>
  );
}
