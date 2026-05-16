'use client';

import Modal from '@/components/ui/modals/Modal';
import EditSkillModal from '@/components/dashboard/modals/EditSkillModal';
import EditSkillCard from '@/components/dashboard/cards/EditSkillCard';
import type { PointCategory } from '@/lib/types';
import type { EditSkillFormSubmitPayload } from '@/components/dashboard/forms/EditSkillForm';

export interface EditSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  categories: PointCategory[];
  isLoading: boolean;
  refreshCategories: () => void;
  skillType?: 'positive' | 'negative';
}

export interface EditSkillsModalViewProps extends EditSkillsModalProps {
  filteredSkills: PointCategory[];
  editingSkill: PointCategory | null;
  setEditingSkill: (skill: PointCategory | null) => void;
  hoveredSkillId: string | null;
  setHoveredSkillId: (id: string | null) => void;
  skillToDelete: PointCategory | null;
  setSkillToDelete: (skill: PointCategory | null) => void;
  deletingSkillId: string | null;
  handleConfirmDelete: () => Promise<void>;
  editSkillPositiveIcons: string[];
  editSkillNegativeIcons: string[];
  editSkillPositiveIconsDetecting: boolean;
  handleEditSkillSubmit: (values: EditSkillFormSubmitPayload) => Promise<void>;
}

export default function EditSkillsModal(props: EditSkillsModalViewProps) {
  const {
    isOpen,
    onClose,
    isLoading: isLoadingCategories,
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
  } = props;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
        <div className="relative">
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit or Remove {skillType === 'positive' ? 'Positive' : skillType === 'negative' ? 'Negative' : ''} Skills
            </h2>
          </div>
          <div className="min-h-[300px]">
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading skills...</p>
                </div>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p>No {skillType === 'positive' ? 'positive' : skillType === 'negative' ? 'negative' : ''} skills found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filteredSkills.map((category) => (
                  <EditSkillCard
                    key={category.id}
                    category={category}
                    pointsValue={category.points ?? category.default_points ?? 0}
                    isHovered={hoveredSkillId === category.id}
                    isDeleting={deletingSkillId === category.id}
                    isLoading={isLoadingCategories}
                    onEdit={() => setEditingSkill(category)}
                    onHoverStart={() => setHoveredSkillId(category.id)}
                    onHoverEnd={() => setHoveredSkillId(null)}
                    onDelete={() => setSkillToDelete(category)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <EditSkillModal
        isOpen={editingSkill !== null}
        onClose={() => setEditingSkill(null)}
        skill={editingSkill}
        positiveIcons={editSkillPositiveIcons}
        negativeIcons={editSkillNegativeIcons}
        isPositiveIconsDetecting={editSkillPositiveIconsDetecting}
        onEditSkillSubmit={handleEditSkillSubmit}
      />

      {skillToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSkillToDelete(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full mx-4 max-w-md">
            <button
              type="button"
              onClick={() => setSkillToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6 text-center py-6">
              {deletingSkillId && deletingSkillId === skillToDelete.id ? (
                <div>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                  <p className="text-gray-600">Deleting skill...</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Skill?</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this skill?
                    <span className="block mt-2 font-medium text-gray-900">&quot;{skillToDelete.name}&quot;</span>
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setSkillToDelete(null)}
                      disabled={deletingSkillId !== null}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirmDelete()}
                      disabled={deletingSkillId !== null}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Yes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
