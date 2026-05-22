'use client';

import Modal from '@/components/ui/modals/Modal';

type EditClassResetPointsDialogProps = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onResetKeepEvents: () => void;
  onResetDeleteEvents: () => void;
};

export default function EditClassResetPointsDialog({
  isOpen,
  isLoading,
  onClose,
  onResetKeepEvents,
  onResetDeleteEvents,
}: EditClassResetPointsDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-2xl font-extrabold text-brand-purple mb-2 text-center">Reset Points</h3>
        <p className="text-gray-600 text-center mb-6">
          Choose how you want to reset points for all students in this class:
        </p>
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={onResetKeepEvents}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="font-medium text-gray-900">Reset points only</span>
            <p className="text-sm text-gray-500 mt-1">Keep point event history</p>
          </button>
          <button
            type="button"
            onClick={onResetDeleteEvents}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-red-300 rounded-lg text-left hover:bg-red-50 disabled:opacity-50"
          >
            <span className="font-medium text-red-700">Reset points and delete events</span>
            <p className="text-sm text-gray-500 mt-1">Remove all custom point events</p>
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
