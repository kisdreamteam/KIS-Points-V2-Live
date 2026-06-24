'use client';

import Modal from '@/components/ui/modals/Modal';
import AddSkillModal from '@/features/dashboard/components/modals/AddSkillModal';
import EditSkillsModalHost from '@/features/dashboard/EditSkillsModalHost';
import SkillCard from '@/features/dashboard/components/cards/SkillCard';
import SkillActionCard from '@/features/dashboard/components/cards/SkillActionCard';
import AwardPointsTabBar from '@/features/dashboard/components/award-points/AwardPointsTabBar';
import AwardPointsWeightRow from '@/features/dashboard/components/award-points/AwardPointsWeightRow';
import type { AwardPointWeight, AwardPointsTab } from '@/features/dashboard/hooks/useAwardPointsModalState';
import { PointCategory, Student } from '@/lib/types';
import type { AddSkillFormSubmitValues } from '@/features/dashboard/components/forms/AddSkillForm';

export interface AwardPointsModalProps {
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
}

export type AwardPointsSkillRow = {
  id: string;
  name: string;
  icon?: string | null;
};

export interface AwardPointsModalViewProps extends AwardPointsModalProps {
  isMultiClassMode: boolean;
  isMultiStudentMode: boolean;
  isWholeClassMode: boolean;
  categories: PointCategory[];
  isLoading: boolean;
  activeTab: AwardPointsTab;
  setActiveTab: (tab: AwardPointsTab) => void;
  selectedWeight: AwardPointWeight;
  setSelectedWeight: (weight: AwardPointWeight) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string) => void;
  isCustomMode: boolean;
  enterCustomMode: () => void;
  exitCustomMode: () => void;
  customPoints: number;
  setCustomPoints: (value: number) => void;
  customMemo: string;
  setCustomMemo: (value: string) => void;
  isManageSkillsModalOpen: boolean;
  setManageSkillsModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  imageCacheKey: number;
  activeCategories: PointCategory[];
  positiveSkills: AwardPointsSkillRow[];
  negativeSkills: AwardPointsSkillRow[];
  refreshCategories: () => void;
  handleConfirmAward: () => Promise<void>;
  isSubmitting: boolean;
  addCacheBuster: (iconPath: string, cacheKey?: string | number) => string;
  handleSubmitAddSkill: (values: AddSkillFormSubmitValues) => Promise<void>;
  addSkillPositiveIcons: string[];
  addSkillNegativeIcons: string[];
  addSkillPositiveIconsDetecting: boolean;
}

export default function AwardPointsModal({
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
  positiveSkills,
  negativeSkills,
  refreshCategories,
  handleConfirmAward,
  isSubmitting,
  addCacheBuster,
  handleSubmitAddSkill,
  addSkillPositiveIcons,
  addSkillNegativeIcons,
  addSkillPositiveIconsDetecting,
}: AwardPointsModalViewProps) {
  const headerLabel = student
    ? `${student.first_name} ${student.last_name}`
    : isMultiClassMode && selectedClassIds
      ? `${selectedClassIds.length} Selected ${selectedClassIds.length === 1 ? 'Class' : 'Classes'}`
      : isMultiStudentMode && selectedStudentIds
        ? `${selectedStudentIds.length} Selected ${selectedStudentIds.length === 1 ? 'Student' : 'Students'}`
        : isWholeClassMode
          ? className || 'Whole Class'
          : '';

  const headerAvatar =
    isMultiClassMode || isWholeClassMode
      ? classIcon || '/images/dashboard/class-icons/icon-1.png'
      : student?.avatar || '/images/dashboard/student-avatars/avatar-01.png';

  const skillsForTab = activeTab === 'positive' ? positiveSkills : negativeSkills;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className={`max-w-4xl transition-all duration-200 ${isCustomMode ? 'max-w-4xl' : ''}`}
        fixedTop={true}
      >
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <img
                src={headerAvatar}
                alt={headerLabel}
                width={48}
                height={48}
                className="rounded-full"
                decoding="async"
              />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{headerLabel}</span>
            </div>

            <AwardPointsTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              disabled={isCustomMode}
            />

            {!isCustomMode ? (
              <AwardPointsWeightRow
                activeTab={activeTab}
                selectedWeight={selectedWeight}
                onWeightChange={setSelectedWeight}
              />
            ) : null}

            {!isCustomMode ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Choose achievement category
              </p>
            ) : null}
          </div>

          {!isCustomMode ? (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-gray-600">Loading categories...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2">
                  {skillsForTab.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      id={skill.id}
                      name={skill.name}
                      icon={skill.icon ?? undefined}
                      imageCacheKey={imageCacheKey}
                      isSelected={selectedCategoryId === skill.id}
                      size="compact"
                      onClick={() => setSelectedCategoryId(skill.id)}
                      addCacheBuster={addCacheBuster}
                    />
                  ))}
                  <SkillActionCard
                    title="Add skills"
                    size="compact"
                    onClick={() => setManageSkillsModalOpen(true)}
                    borderClassName="border-purple-500"
                    titleClassName="text-purple-600"
                    iconClassName="text-purple-500"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  />
                  <SkillActionCard
                    title="Edit Skills"
                    size="compact"
                    onClick={() => setEditModalOpen(true)}
                    borderClassName="border-gray-300"
                    titleClassName="text-gray-600"
                    iconClassName="text-gray-600"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4z" />
                      </svg>
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="mb-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Or add custom reason
                  </p>
                  <button
                    type="button"
                    onClick={exitCustomMode}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Back to skills
                  </button>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Custom Pts</label>
                    <input
                      type="number"
                      min={1}
                      value={customPoints === 0 ? '' : customPoints}
                      onChange={(e) => setCustomPoints(Math.abs(Number(e.target.value)) || 0)}
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-center font-semibold"
                      placeholder="0"
                    />
                    {activeTab === 'negative' ? (
                      <span className="mt-1 block text-center text-xs text-gray-500">awarded as negative</span>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={customMemo}
                      onChange={(e) => setCustomMemo(e.target.value)}
                      rows={3}
                      placeholder="e.g. helped peers clean whiteboards during recess"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-shrink-0 bg-white pt-4 border-t border-gray-200">
            {!isCustomMode ? (
              <div className="mb-4 text-center">
                <button
                  type="button"
                  onClick={enterCustomMode}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
                >
                  Award custom points
                </button>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmAward()}
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {isSubmitting ? 'Awarding...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <AddSkillModal
        isOpen={isManageSkillsModalOpen}
        onClose={() => setManageSkillsModalOpen(false)}
        classId={classId}
        onSubmit={handleSubmitAddSkill}
        skillType={activeTab === 'positive' ? 'positive' : 'negative'}
        positiveIcons={addSkillPositiveIcons}
        negativeIcons={addSkillNegativeIcons}
        isPositiveIconsDetecting={addSkillPositiveIconsDetecting}
      />
      <EditSkillsModalHost
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        classId={classId}
        categories={categories}
        isLoading={isLoading}
        refreshCategories={refreshCategories}
        skillType={activeTab === 'positive' ? 'positive' : 'negative'}
      />
    </>
  );
}
