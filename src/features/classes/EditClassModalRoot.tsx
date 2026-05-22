'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modals/Modal';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import SuccessNotificationModal from '@/components/ui/modals/SuccessNotificationModal';
import AddStudentsModal from '@/features/students/components/modals/AddStudentsModal';
import EditClassModalTabs, { type EditClassTab } from '@/features/classes/components/forms/edit-class/EditClassModalTabs';
import EditClassInfoTab from '@/features/classes/components/forms/edit-class/EditClassInfoTab';
import EditClassStudentsTab from '@/features/classes/components/forms/edit-class/EditClassStudentsTab';
import EditClassTeachersTab from '@/features/classes/components/forms/edit-class/EditClassTeachersTab';
import EditClassSettingsTab from '@/features/classes/components/forms/edit-class/EditClassSettingsTab';
import EditClassResetPointsDialog from '@/features/classes/components/forms/edit-class/EditClassResetPointsDialog';
import { useClassManagement } from '@/hooks/useClassManagement';

export interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onRefresh: () => void;
}

export default function EditClassModalRoot({ isOpen, onClose, classId, onRefresh }: EditClassModalProps) {
  const [activeTab, setActiveTab] = useState<EditClassTab>('info');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const mgmt = useClassManagement({ isOpen, classId, onRefresh, onClose });

  const handleInfoCancel = () => onClose();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
        <div className="p-6">
          <h2 className="text-2xl font-extrabold text-brand-purple mb-4">Edit Class</h2>

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
                  onCancel={handleInfoCancel}
                />
              )}

              {activeTab === 'students' && (
                <EditClassStudentsTab
                  students={mgmt.students}
                  hasUnsavedChanges={mgmt.hasUnsavedChanges}
                  isLoading={mgmt.isLoading}
                  onAddStudent={() => setIsAddStudentModalOpen(true)}
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
        </div>
      </Modal>

      <AddStudentsModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSubmit={mgmt.submitAddStudents}
        isLoading={mgmt.isAddingStudents}
        error={mgmt.addStudentsError}
        nextStudentNumber={mgmt.nextStudentNumber}
        onStudentAdded={async () => setIsAddStudentModalOpen(false)}
      />

      <EditClassResetPointsDialog
        isOpen={mgmt.showResetPointsPopup}
        isLoading={mgmt.isResettingPoints}
        onClose={() => mgmt.setShowResetPointsPopup(false)}
        onResetKeepEvents={() => void mgmt.handleResetPoints(false)}
        onResetDeleteEvents={() => void mgmt.handleResetPoints(true)}
      />

      <ConfirmationModal
        isOpen={mgmt.showConfirmAddCollaborator}
        onClose={() => {
          mgmt.setShowConfirmAddCollaborator(false);
          mgmt.setPendingCollaborator(null);
        }}
        onConfirm={() => {
          if (mgmt.pendingCollaborator) {
            void mgmt.handleConfirmAddCollaborator(mgmt.pendingCollaborator);
          }
        }}
        title="Add Collaborator"
        message={
          mgmt.pendingCollaborator
            ? `Add ${mgmt.pendingCollaborator.name?.trim() || mgmt.pendingCollaborator.email} as a collaborating teacher on this class?`
            : ''
        }
        confirmText="Add"
        cancelText="Cancel"
        confirmButtonColor="green"
      />

      <ConfirmationModal
        isOpen={mgmt.showNotFoundCollaborator}
        onClose={() => mgmt.setShowNotFoundCollaborator(false)}
        onConfirm={() => mgmt.setShowNotFoundCollaborator(false)}
        title="Teacher Not Found"
        message="No teacher account was found with that email address. They must sign up first."
        confirmText="OK"
        cancelText="Close"
        confirmButtonColor="blue"
      />

      <SuccessNotificationModal
        isOpen={mgmt.showCollaboratorSuccess}
        onClose={() => mgmt.setShowCollaboratorSuccess(false)}
        title="Collaborator Added"
        message={`${mgmt.collaboratorSuccessName} has been added to this class.`}
      />

      <SuccessNotificationModal
        isOpen={mgmt.showSaveConfirmation}
        onClose={() => mgmt.setShowSaveConfirmation(false)}
        title="Changes Saved"
        message="Student information has been saved successfully."
        autoCloseDelay={3000}
      />

      <ConfirmationModal
        isOpen={mgmt.showValidationWarning}
        onClose={() => mgmt.setShowValidationWarning(false)}
        onConfirm={() => mgmt.setShowValidationWarning(false)}
        title="Missing First Names"
        message={`${mgmt.studentsWithoutFirstName.length} student(s) are missing a first name. Please fill in all first names before saving.`}
        confirmText="OK"
        cancelText="Close"
        confirmButtonColor="orange"
      />
    </>
  );
}
