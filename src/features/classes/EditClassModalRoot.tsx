'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modals/Modal';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import SuccessNotificationModal from '@/components/ui/modals/SuccessNotificationModal';
import AddStudentsModal from '@/features/students/components/modals/AddStudentsModal';
import EditClassForm from '@/features/classes/components/forms/EditClassForm';
import EditClassResetPointsDialog from '@/features/classes/components/forms/edit-class/EditClassResetPointsDialog';
import { useClassManagement } from '@/features/classes/hooks/useClassManagement';

export interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onRefresh: () => void;
}

export default function EditClassModalRoot({ isOpen, onClose, classId, onRefresh }: EditClassModalProps) {
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const mgmt = useClassManagement({ isOpen, classId, onRefresh, onClose });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
        <div className="p-6">
          <h2 className="text-2xl font-extrabold text-brand-purple mb-4">Edit Class</h2>

          <EditClassForm
            mgmt={mgmt}
            onClose={onClose}
            onAddStudent={() => setIsAddStudentModalOpen(true)}
          />
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
