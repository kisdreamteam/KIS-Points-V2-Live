'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Student } from '@/lib/types';
import Image from 'next/image';
import AwardPointsModalHost from '@/features/dashboard/AwardPointsModalHost';
import PointsAwardedConfirmationModal from '@/features/dashboard/components/modals/PointsAwardedConfirmationModal';
import { normalizeAvatarPath } from '@/lib/iconUtils';
import { emitSeatingStudentPointsDelta } from '@/lib/events/students';
import { useAwardConfirmationModal } from '@/features/dashboard/hooks/useAwardConfirmationModal';
import { useRandomStudentFlow } from '@/features/dashboard/hooks/useRandomStudentFlow';
import { refreshDashboardStudents } from '@/features/dashboard/hooks/sync/dashboardStudentRefresh';
import { refreshSeatingGroupsForLayout } from '@/features/dashboard/hooks/sync/seatingChartRefresh';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import IconNoCircleX from '@/components/ui/icons/iconNoCircleX';

type RandomProps = {
  classId: string;
  onClose: () => void;
  registerCloseHandler?: (handler: (() => void) | null) => void;
};

export default function Random({ classId, onClose, registerCloseHandler }: RandomProps) {
  const UI_SCALE = 0.9;
  const scalePx = (n: number) => Math.round(n * UI_SCALE);

  const itemHeight = scalePx(250);
  const slotWindowHeight = scalePx(750);
  const slotWindowWidth = scalePx(375);
  // Slot window padding ??center of the *visible reel* is half of inner height, not half of outer window.
  const slotPaddingPx = scalePx(20);
  const pointsListWidth = scalePx(320);
  const fadeOverlayHeight = scalePx(100);
  const reelAvatarSize = scalePx(150);
  const selectedAvatarSize = scalePx(75);
  const listAvatarSize = scalePx(48);
  const viewportInnerHeight = slotWindowHeight - 2 * slotPaddingPx;
  const middleOfWindow = viewportInnerHeight / 2;
  const itemCenterOffset = itemHeight / 2;
  const baseRotations = 3;
  const maxExtraRotations = 2;
  const reelCopies = baseRotations + maxExtraRotations + 2;
  const {
    students,
    isLoading,
    isResetting,
    fetchStudents,
    markSelectedStudentAsPicked,
    handleResetPickedStudents,
  } = useRandomStudentFlow();
  const absentStudentIds = useDashboardStore((s) => s.absentStudentIds);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isAwardPointsModalOpen, setIsAwardPointsModalOpen] = useState(false);
  const [isListAwardPointsModalOpen, setIsListAwardPointsModalOpen] = useState(false);
  const [pointsListStudents, setPointsListStudents] = useState<Student[]>([]);
  const {
    awardInfo,
    isConfirmationModalOpen,
    openAwardConfirmation,
    closeAwardConfirmation,
  } = useAwardConfirmationModal();
  const lastCardIndexRef = useRef<number>(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const totalStudents = students.length;
  const reelStudents = students;
  const availableStudents = students.filter(
    (student) => !student.has_been_picked && !absentStudentIds.includes(student.id)
  );
  const presentStudents = students.filter((student) => !absentStudentIds.includes(student.id));
  const pickedStudentsCount = presentStudents.filter((student) => student.has_been_picked).length;
  const allPresentPicked =
    presentStudents.length > 0 && presentStudents.every((student) => student.has_been_picked);
  const allPresentAbsent = totalStudents > 0 && presentStudents.length === 0;
  const pointsListStudentIds = pointsListStudents.map((student) => student.id);
  const [lastAwardedStudentIds, setLastAwardedStudentIds] = useState<string[]>([]);

  const refreshRandomAndDashboardStudents = useCallback(async () => {
    await Promise.allSettled([
      fetchStudents(classId, { silent: true }),
      refreshDashboardStudents(true),
    ]);
  }, [classId, fetchStudents]);

  const handleClose = useCallback(async () => {
    await refreshRandomAndDashboardStudents();
    const selectedLayoutId = useSeatingStore.getState().selectedLayoutId;
    await refreshSeatingGroupsForLayout(selectedLayoutId);
    onClose();
  }, [onClose, refreshRandomAndDashboardStudents]);

  useEffect(() => {
    registerCloseHandler?.(() => void handleClose());
    return () => registerCloseHandler?.(null);
  }, [handleClose, registerCloseHandler]);

  // Fetch students when component mounts
  useEffect(() => {
    if (classId) {
      void fetchStudents(classId);
    }
  }, [classId, fetchStudents]);

  // Cleanup animation frame and audio context on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  // Function to play a tick sound for each card passing through
  const playTickSound = useCallback(async (volume: number = 0.2) => {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      // Create or reuse audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const audioContext = audioContextRef.current;

      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create a mechanical slot machine tick sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Lower frequency for a more mechanical, slot machine-like sound
      // Real slot machines typically have lower-pitched mechanical clicks
      oscillator.frequency.value = 250; // Lower pitch (was 800)
      oscillator.type = 'sawtooth'; // Sawtooth gives a more mechanical, gritty sound

      // Create a short mechanical click envelope
      const now = audioContext.currentTime;
      const duration = 0.08; // Slightly longer for more presence

      // Quick attack and decay for a mechanical click sound
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.005); // Very quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Quick decay

      // Add slight frequency variation for more mechanical character
      oscillator.frequency.setValueAtTime(250, now);
      oscillator.frequency.linearRampToValueAtTime(230, now + duration); // Slight downward sweep

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      // Silently fail if audio cannot be played
      console.log('Could not play tick sound:', error);
    }
  }, []);

  const handleSpin = () => {
    if (availableStudents.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedStudent(null);

    // Reset card tracking and scroll position to top for consistent animation
    lastCardIndexRef.current = -1;
    if (reelRef.current) reelRef.current.style.transform = `translateY(-${0}px)`; // Reset to top immediately

    // Choose winner first, then calculate exact stop point from it.
    const winnerIndex = Math.floor(Math.random() * availableStudents.length);
    const selected = availableStudents[winnerIndex];
    const winnerIndexInReel = reelStudents.findIndex((student) => student.id === selected.id);
    if (winnerIndexInReel < 0) {
      setIsSpinning(false);
      return;
    }

    const extraRotations = Math.floor(Math.random() * (maxExtraRotations + 1)); // 0..maxExtraRotations
    const totalItems = reelStudents.length;
    const globalStopIndex = (baseRotations + extraRotations) * totalItems + winnerIndexInReel;
    const finalTarget = globalStopIndex * itemHeight + itemCenterOffset - middleOfWindow;

    // Always start from top (0) for consistent animation
    const startPosition = 0;
    const distance = finalTarget - startPosition;

    // Consistent animation duration (3.5 seconds)
    const duration = 3500; // Always 3.5 seconds
    const startTime = performance.now();

    // Easing function for smooth deceleration
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing
      const easedProgress = easeOutCubic(progress);

      // Calculate current position
      const currentPosition = startPosition + distance * easedProgress;
      if (reelRef.current) reelRef.current.style.transform = `translateY(-${currentPosition}px)`;

      // Calculate which card is currently in the middle slot
      // The middle of the visible viewport is at middleOfWindow (inner height / 2)
      // With scrollPosition, the card at position (scrollPosition + middleOfWindow) is centered
      // Calculate which item index this corresponds to
      const currentCenterPosition = currentPosition + middleOfWindow;
      const currentCardIndex = Math.floor((currentCenterPosition - itemCenterOffset) / itemHeight);

      // Play sound when a new card passes through the middle
      // The timing will naturally be faster at the start (due to higher scroll speed) 
      // and slower at the end (due to easing), which is exactly what we want
      if (currentCardIndex !== lastCardIndexRef.current && currentCardIndex >= 0) {
        lastCardIndexRef.current = currentCardIndex;

        // Volume decreases as we approach the end (softer sounds near the end)
        // This creates a nice effect where sounds are more prominent at the start
        const volume = 0.3 - (progress * 0.2); // Start at 0.3, end at 0.1
        playTickSound(volume);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (reelRef.current) reelRef.current.style.transform = `translateY(-${finalTarget}px)`;
        setIsSpinning(false);
        setSelectedStudent(selected);
        lastCardIndexRef.current = -1; // Reset for next spin
        void markSelectedStudentAsPicked(selected.id);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleAddStudentToPointsList = useCallback(() => {
    if (!selectedStudent) return;
    setPointsListStudents((prev) => [...prev, selectedStudent]);
  }, [selectedStudent]);

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

  const handlePointsAwarded = useCallback((info: {
    studentAvatar: string;
    studentFirstName: string;
    pointsDelta: number;
    categoryName: string;
    categoryIcon?: string;
  }) => {
    if (classId && lastAwardedStudentIds.length > 0 && Number.isFinite(info.pointsDelta)) {
      // Patch seating store directly because seating listeners can be unmounted while Random is open.
      useSeatingStore.getState().patchGroupAssignmentsForPointsDelta(lastAwardedStudentIds, info.pointsDelta);
      emitSeatingStudentPointsDelta({
        classId,
        studentIds: lastAwardedStudentIds,
        delta: info.pointsDelta,
      });
    }
    openAwardConfirmation(info);
  }, [classId, lastAwardedStudentIds, openAwardConfirmation]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isSpinning && availableStudents.length > 0) {
        handleSpin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableStudents.length, isSpinning]);

  return (
    <div className="h-full w-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 flex flex-row items-center justify-center px-9 gap-9 overflow-hidden">
        {/* Left Side - Controls and Selected Student */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-5">Random Student Selector</h1>
            <p className="text-white/80 text-lg mb-7">
              {isLoading
                ? 'Loading students...'
                : totalStudents === 0
                  ? 'No students found'
                  : allPresentAbsent
                    ? 'All students are marked absent today. No one can be chosen until they are marked present.'
                    : availableStudents.length === 0
                      ? allPresentPicked
                        ? 'All present students have been picked. Reset to start again.'
                        : 'No present students available to choose.'
                      : `Click the button to randomly select from ${availableStudents.length} students`}
            </p>
            {!isLoading && totalStudents > 0 && (
              <div className="mb-5 flex items-center justify-center gap-4">
                <p className="text-white/90 text-base font-semibold">
                  {pickedStudentsCount} of {presentStudents.length} present students picked
                </p>
                <button
                  onClick={() => void handleResetPickedStudents(classId, () => setSelectedStudent(null))}
                  disabled={isResetting}
                  className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-white/60 text-white px-5 py-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  {isResetting ? 'Resetting...' : 'Reset'}
                </button>
              </div>
            )}

            {!isLoading && availableStudents.length > 0 && (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 text-white px-9 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg disabled:cursor-not-allowed"
              >
                {isSpinning ? 'Spinning...' : 'Choose Random Student'}
              </button>
            )}

            {/* Selected Student Display */}
            <div className="mt-8 p-7 bg-white/20 rounded-2xl backdrop-blur-sm">
              {selectedStudent ? (
                <>
                  <p className="text-white text-2xl font-semibold mb-3">Selected:</p>
                  <div className="flex items-center gap-4 justify-center mb-5">
                    <Image
                      src={normalizeAvatarPath(selectedStudent.avatar)}
                      alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                      width={selectedAvatarSize}
                      height={selectedAvatarSize}
                      className="rounded-full bg-[#FDF2F0] border-4 border-white"
                    />
                    <p className="text-white text-4xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  </div>
                </>
              ) : (
                <p className="text-white text-xl font-semibold mb-5 text-center">No student selected</p>
              )}
              <button
                onClick={() => {
                  if (selectedStudent) {
                    setLastAwardedStudentIds([selectedStudent.id]);
                  }
                  setIsAwardPointsModalOpen(true);
                }}
                disabled={!selectedStudent}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                Award Points to student
              </button>
              <button
                onClick={handleAddStudentToPointsList}
                disabled={!selectedStudent}
                className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                Add student to the points list
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Slot Machine */}
        <div className="flex-1 flex items-center justify-center gap-7 min-w-0">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-[72px] w-[72px] border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/80 text-lg">Loading students...</p>
            </div>
          ) : totalStudents === 0 ? (
            <div className="text-center">
              <p className="text-white/80 text-xl">
                No students available
              </p>
            </div>
          ) : (
            <div className="relative shrink-0">
              {/* Slot Machine Frame */}
              <div className="bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-7 shadow-2xl border-4 border-yellow-700">
                {/* Slot Window */}
                <div
                  className="relative bg-gray-500 rounded-lg p-4 overflow-hidden"
                  style={{ width: slotWindowWidth, height: slotWindowHeight }}
                >
                  {/* Top and bottom gradient overlays for fade effect */}
                  <div
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"
                    style={{ height: fadeOverlayHeight }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"
                    style={{ height: fadeOverlayHeight }}
                  ></div>

                  {/* Selection indicator lines */}
                  <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-20 pointer-events-none">
                    <div className="border-t-4 border-b-4 border-yellow-400" style={{ height: itemHeight }}></div>
                  </div>

                  {/* Reel Container */}
                  <div
                    ref={reelRef}
                    className="relative transition-none"
                    style={{
                      transform: 'translateY(0px)',
                      transition: 'none',
                    }}
                  >
                    {/* Duplicate students multiple times for seamless scrolling */}
                    {[...Array(reelCopies)].map((_, rotation) =>
                      reelStudents.map((student, index) => {
                        return (
                          <div
                            key={`${student.id}-${rotation}-${index}`}
                            className="flex flex-col items-center justify-center py-8"
                            style={{ height: `${itemHeight}px` }}
                          >
                            <div className="mb-4">
                              <Image
                                src={normalizeAvatarPath(student.avatar)}
                                alt={`${student.first_name} ${student.last_name}`}
                                width={reelAvatarSize}
                                height={reelAvatarSize}
                                className="rounded-full bg-[#FDF2F0] border-4 border-white shadow-lg"
                              />
                            </div>
                            <h3 className="text-white text-xl font-bold text-center px-4">
                              {student.first_name} {student.last_name}
                            </h3>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && totalStudents > 0 && (
            <div
              className="bg-white/20 rounded-3xl p-4 backdrop-blur-sm flex flex-col shrink-0"
              style={{ width: pointsListWidth, height: slotWindowHeight }}
            >
              <div className="mb-3">
                <h3 className="text-white text-xl font-bold">Points List</h3>
                <p className="text-white/80 text-sm">{pointsListStudents.length} students selected</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {pointsListStudents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-white/70 text-sm">No students in the list yet</p>
                  </div>
                ) : (
                  pointsListStudents.map((student, index) => (
                    <div key={`${student.id}-${index}`} className="bg-white/20 rounded-xl p-3 flex items-center gap-3">
                      <Image
                        src={normalizeAvatarPath(student.avatar)}
                        alt={`${student.first_name} ${student.last_name}`}
                        width={listAvatarSize}
                        height={listAvatarSize}
                        className="rounded-xl border-2 border-white shrink-0"
                      />
                      <p className="text-white font-semibold text-sm flex-1 min-w-0 truncate">
                        {student.first_name} {student.last_name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudentFromPointsList(index)}
                        className="shrink-0 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                        aria-label={`Remove ${student.first_name} ${student.last_name} from list`}
                        title="Remove from list"
                      >
                        <IconNoCircleX className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  setLastAwardedStudentIds(pointsListStudentIds);
                  handleOpenListAwardModal();
                }}
                disabled={pointsListStudents.length === 0}
                className="mt-3 w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg"
              >
                Award points to students on the list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Award Points Modal */}
      {selectedStudent && (
        <AwardPointsModalHost
          isOpen={isAwardPointsModalOpen}
          onClose={() => setIsAwardPointsModalOpen(false)}
          student={selectedStudent}
          classId={classId}
          onRefresh={() => void refreshRandomAndDashboardStudents()}
          onPointsAwarded={handlePointsAwarded}
        />
      )}

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

      {/* Points Awarded Confirmation Modal */}
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

