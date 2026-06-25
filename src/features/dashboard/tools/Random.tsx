'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student } from '@/lib/types';
import AwardPointsModalHost from '@/features/dashboard/AwardPointsModalHost';
import PointsAwardedConfirmationModal from '@/features/dashboard/components/modals/PointsAwardedConfirmationModal';
import RandomPoolToggle from '@/features/dashboard/components/random/RandomPoolToggle';
import RandomPickCountSlider from '@/features/dashboard/components/random/RandomPickCountSlider';
import RandomPointsList from '@/features/dashboard/components/random/RandomPointsList';
import RandomFlipCardsGrid from '@/features/dashboard/components/random/RandomFlipCardsGrid';
import { emitSeatingStudentPointsDelta } from '@/lib/events/students';
import { useAwardConfirmationModal } from '@/features/dashboard/hooks/useAwardConfirmationModal';
import { useRandomStudentFlow } from '@/features/dashboard/hooks/useRandomStudentFlow';
import { useRandomFlipCardAnimation } from '@/features/dashboard/hooks/useRandomFlipCardAnimation';
import { useRandomPicker } from '@/features/dashboard/hooks/useRandomPicker';
import { refreshDashboardStudents } from '@/features/dashboard/hooks/sync/dashboardStudentRefresh';
import { refreshSeatingGroupsForLayout } from '@/features/dashboard/hooks/sync/seatingChartRefresh';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

type RandomProps = {
  classId: string;
  onClose: () => void;
  registerCloseHandler?: (handler: (() => void) | null) => void;
};

const UI_SCALE = 0.9;
const scalePx = (n: number) => Math.round(n * UI_SCALE);
const listAvatarSize = scalePx(48);

export default function Random({ classId, onClose, registerCloseHandler }: RandomProps) {
  const {
    students,
    isLoading,
    isResetting,
    fetchStudents,
    markSelectedStudentAsPicked,
    handleResetPickedStudents,
  } = useRandomStudentFlow();
  const absentStudentIds = useDashboardStore((s) => s.absentStudentIds);
  const {
    displayedStudents,
    isFlipping,
    isBouncing,
    flipStepKey,
    syncSlots,
    animateToWinners,
  } = useRandomFlipCardAnimation();

  const animatePickRound = useCallback(
    async (winners: Student[], pool: Student[]) => {
      await animateToWinners(winners, pool);
    },
    [animateToWinners]
  );

  const {
    pickerPool,
    setPickerPool,
    pickCount,
    setPickCount,
    pickedThisRound,
    isPicking,
    presentStudents,
    poolPickStats,
    poolPickedLabel,
    poolCounts,
    remainingInPool,
    allPoolPicked,
    clearRoundSelection,
    runPickRound,
  } = useRandomPicker({
    students,
    absentStudentIds,
    animatePickRound,
    markSelectedStudentAsPicked,
  });

  const flipSlotCount = pickedThisRound.length > 0 ? pickedThisRound.length : pickCount;

  useEffect(() => {
    if (pickedThisRound.length > 0) {
      syncSlots(pickedThisRound.length, pickedThisRound);
    } else {
      syncSlots(pickCount);
    }
  }, [pickCount, pickedThisRound, syncSlots]);

  const [isListAwardPointsModalOpen, setIsListAwardPointsModalOpen] = useState(false);
  const [pointsListStudents, setPointsListStudents] = useState<Student[]>([]);
  const {
    awardInfo,
    isConfirmationModalOpen,
    openAwardConfirmation,
    closeAwardConfirmation,
  } = useAwardConfirmationModal();
  const [lastAwardedStudentIds, setLastAwardedStudentIds] = useState<string[]>([]);

  const totalStudents = students.length;
  const allPresentAbsent = totalStudents > 0 && presentStudents.length === 0;
  const pointsListStudentIds = pointsListStudents.map((student) => student.id);
  const isAnimating = isFlipping;
  const controlsDisabled = isPicking || isLoading || isFlipping;

  const refreshRandomAndDashboardStudents = useCallback(async () => {
    await Promise.allSettled([
      fetchStudents(classId, { silent: true }),
      refreshDashboardStudents(true),
    ]);
  }, [classId, fetchStudents]);

  const handleClose = useCallback(async () => {
    if (isPicking) return;
    await refreshRandomAndDashboardStudents();
    const selectedLayoutId = useSeatingStore.getState().selectedLayoutId;
    await refreshSeatingGroupsForLayout(selectedLayoutId);
    onClose();
  }, [isPicking, onClose, refreshRandomAndDashboardStudents]);

  useEffect(() => {
    registerCloseHandler?.(() => void handleClose());
    return () => registerCloseHandler?.(null);
  }, [handleClose, registerCloseHandler]);

  useEffect(() => {
    if (classId) {
      void fetchStudents(classId);
    }
  }, [classId, fetchStudents]);

  useEffect(() => {
    if (pickedThisRound.length === 0) return;
    setPointsListStudents((prev) => {
      const existingIds = new Set(prev.map((student) => student.id));
      const toAdd = pickedThisRound.filter((student) => !existingIds.has(student.id));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [pickedThisRound]);

  const handleRemoveStudentFromPointsList = useCallback((index: number) => {
    setPointsListStudents((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleOpenListAwardModal = useCallback(() => {
    if (pointsListStudentIds.length === 0) return;
    setIsListAwardPointsModalOpen(true);
  }, [pointsListStudentIds.length]);

  const handleListAwardComplete = useCallback((_selectedIds: string[], type: 'classes' | 'students') => {
    if (type === 'students') {
      setPointsListStudents([]);
    }
  }, []);

  const handlePointsAwarded = useCallback(
    (info: {
      studentAvatar: string;
      studentFirstName: string;
      pointsDelta: number;
      categoryName: string;
      categoryIcon?: string;
    }) => {
      if (classId && lastAwardedStudentIds.length > 0 && Number.isFinite(info.pointsDelta)) {
        useSeatingStore.getState().patchGroupAssignmentsForPointsDelta(lastAwardedStudentIds, info.pointsDelta);
        emitSeatingStudentPointsDelta({
          classId,
          studentIds: lastAwardedStudentIds,
          delta: info.pointsDelta,
        });
      }
      openAwardConfirmation(info);
    },
    [classId, lastAwardedStudentIds, openAwardConfirmation]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter' &&
        !isPicking &&
        !isAnimating &&
        remainingInPool > 0
      ) {
        void runPickRound();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPicking, isAnimating, remainingInPool, runPickRound]);

  const poolLabel =
    pickerPool === 'boys' ? 'boys' : pickerPool === 'girls' ? 'girls' : 'students';

  const helperText = isLoading
    ? 'Loading students...'
    : totalStudents === 0
      ? 'No students found'
      : allPresentAbsent
        ? 'All students are marked absent today. No one can be chosen until they are marked present.'
        : remainingInPool === 0
          ? allPoolPicked
            ? `All ${poolLabel} have been picked. Reset to start again.`
            : `No unpicked ${poolLabel} available in this pool. Try another pool or reset.`
          : `${remainingInPool} unpicked ${poolLabel} remaining in this pool`;

  const spinButtonLabel = isPicking
    ? isAnimating
      ? 'Flipping...'
      : 'Picking...'
    : pickCount === 1
      ? 'Choose Random Student'
      : `Choose ${pickCount} Students`;

  return (
    <div className="h-full w-full flex flex-col min-h-0 ">
      <div className="flex-1 min-h-0 flex flex-row items-stretch gap-4 px-6 overflow-hidden">
        <div className="flex-shrink-0 w-full max-w-lg min-h-0 overflow-y-auto py-4">
          <div className="text-center w-full">
            <h1 className="text-5xl font-bold text-white mb-5 font-spartan">Random Picker</h1>
            {/* <p className="text-white/80 text-lg mb-5">{helperText}</p> */}


            {!isLoading && totalStudents > 0 && !allPresentAbsent && (
              <>
                <RandomPoolToggle
                  value={pickerPool}
                  onChange={setPickerPool}
                  poolCounts={poolCounts}
                  disabled={controlsDisabled}
                />
                <RandomPickCountSlider
                  value={pickCount}
                  onChange={setPickCount}
                  eligiblePoolSize={remainingInPool}
                  disabled={controlsDisabled || remainingInPool === 0}
                />
              </>
            )}

            {!isLoading && totalStudents > 0 && (
              <div className="mb-5 flex items-center justify-center gap-4">
                <p className="text-white/90 text-base font-semibold">
                  {poolPickStats.picked} of {poolPickStats.total} {poolPickedLabel} picked
                </p>
                <button
                  onClick={() =>
                    void handleResetPickedStudents(classId, pickerPool, () => clearRoundSelection())
                  }
                  disabled={isResetting || isPicking}
                  className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/60 text-white px-5 py-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  {isResetting ? 'Resetting...' : 'Reset'}
                </button>
              </div>
            )}


            {!isLoading && remainingInPool > 0 && (
              <button
                onClick={() => void runPickRound()}
                disabled={isPicking}
                className="bg-brand-pink hover:bg-brand-pink disabled:bg-gray-500 text-white px-9 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg disabled:cursor-not-allowed"
              >
                {spinButtonLabel}
              </button>
            )}

          </div>
        </div>

        <div className="flex flex-1 min-h-0 min-w-0 flex-row gap-3 bg-brand-cream">
          <div className="flex-1 min-h-0 min-w-0">
            <RandomFlipCardsGrid
              slotCount={flipSlotCount}
              displayedStudents={displayedStudents}
              isFlipping={isFlipping}
              isBouncing={isBouncing}
              flipStepKey={flipStepKey}
              isLoading={isLoading}
              hasStudents={totalStudents > 0}
            />
          </div>

          {!isLoading && pointsListStudents.length > 0 ? (
            <div className="flex w-full max-w-xs shrink-0 min-h-0 flex-col overflow-hidden pl-3 ">
              <RandomPointsList
                students={pointsListStudents}
                avatarSize={listAvatarSize}
                onRemove={handleRemoveStudentFromPointsList}
                onAward={() => {
                  setLastAwardedStudentIds(pointsListStudentIds);
                  handleOpenListAwardModal();
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <AwardPointsModalHost
        isOpen={isListAwardPointsModalOpen}
        onClose={() => setIsListAwardPointsModalOpen(false)}
        student={null}
        classId={classId}
        selectedStudentIds={pointsListStudentIds}
        onAwardComplete={handleListAwardComplete}
        onRefresh={() => void refreshRandomAndDashboardStudents()}
        onPointsAwarded={handlePointsAwarded}
      />

      {awardInfo && (
        <PointsAwardedConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeAwardConfirmation}
          studentAvatar={awardInfo.studentAvatar}
          studentFirstName={awardInfo.studentFirstName}
          pointsDelta={awardInfo.pointsDelta}
          categoryName={awardInfo.categoryName}
          categoryIcon={awardInfo.categoryIcon}
        />
      )}
    </div>
  );
}
