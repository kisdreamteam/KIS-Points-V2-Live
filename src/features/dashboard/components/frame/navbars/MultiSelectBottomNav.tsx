'use client';

import { useState, useEffect, useCallback } from 'react';
import TimerClockIcon from '@/components/ui/icons/TimerClockIcon';
import RandomArrowsIcon from '@/components/ui/icons/RandomArrowsIcon';
import CheckCircleIcon from '@/components/ui/icons/CheckCircleIcon';
import CircleXIcon from '@/components/ui/icons/CircleXIcon';
import NoCircleXIcon from '@/components/ui/icons/NoCircleXIcon';
import StarTrophyIcon from '@/components/ui/icons/StarTrophyIcon';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';
import { STUDENT_EVENTS } from '@/lib/events/students';

export default function MultiSelectBottomNav() {
  const [awardableStudentCount, setAwardableStudentCount] = useState(0);
  const [hasRecentlySelected, setHasRecentlySelected] = useState(false);

  const checkRecentlySelected = useCallback(() => {
    const lastSelectedClasses = localStorage.getItem('lastSelectedClasses');
    const lastSelectedStudents = localStorage.getItem('lastSelectedStudents');
    setHasRecentlySelected(!!(lastSelectedClasses || lastSelectedStudents));
  }, []);

  useEffect(() => {
    const handleSelectionCountChange = (
      event: CustomEvent<{
        studentCount?: number;
        groupCount?: number;
        awardableStudentCount?: number;
      }>
    ) => {
      setTimeout(() => {
        setAwardableStudentCount(event.detail.awardableStudentCount ?? 0);
      }, 0);
    };

    const handleStorageChange = () => {
      checkRecentlySelected();
    };

    checkRecentlySelected();

    window.addEventListener(STUDENT_EVENTS.SELECTION_COUNT_CHANGED, handleSelectionCountChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_CLEARED, handleStorageChange);
    window.addEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_UPDATED, handleStorageChange);

    return () => {
      window.removeEventListener(
        STUDENT_EVENTS.SELECTION_COUNT_CHANGED,
        handleSelectionCountChange as EventListener
      );
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_CLEARED, handleStorageChange);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_UPDATED, handleStorageChange);
    };
  }, [checkRecentlySelected]);

  const handleSelectAll = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_ALL));
  };

  const handleSelectNone = () => {
    if (awardableStudentCount > 0) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_NONE));
    }
  };

  const handleCancel = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.TOGGLE_MULTI_SELECT));
  };

  const handleAwardPoints = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.AWARD_POINTS));
  };

  const handleRecentlySelect = () => {
    if (hasRecentlySelected) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.RECENTLY_SELECT));
    }
  };

  const handleInverseSelect = () => {
    if (awardableStudentCount > 0) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.INVERSE_SELECT));
    }
  };

  const handleSelectAllBoys = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_ALL_BOYS));
  };

  const handleSelectAllGirls = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_ALL_GIRLS));
  };

  return (
    <BaseBottomNav className="overflow-visible">
      <div className="flex w-full min-w-0 items-center gap-1 overflow-x-auto overflow-y-visible sm:gap-2 md:gap-4">
        <BotNavGrayButton icon={<CheckCircleIcon />} label="Select All" onClick={handleSelectAll} />

        <BotNavGrayButton
          icon={<CircleXIcon />}
          label="Select None"
          onClick={handleSelectNone}
          enabled={awardableStudentCount > 0}
        />

        <BotNavGrayButton
          icon={<TimerClockIcon />}
          label="Recently Selected"
          onClick={handleRecentlySelect}
          enabled={hasRecentlySelected}
        />

        <BotNavGrayButton
          icon={<RandomArrowsIcon />}
          label="Inverse Select"
          onClick={handleInverseSelect}
          enabled={awardableStudentCount > 0}
        />

        <BotNavGrayButton
          icon={<CheckCircleIcon />}
          label="Boys Only"
          onClick={handleSelectAllBoys}
        />

        <BotNavGrayButton
          icon={<CheckCircleIcon />}
          label="Girls Only"
          onClick={handleSelectAllGirls}
        />

        <BotNavGrayButton
          variant="danger"
          icon={<NoCircleXIcon />}
          label="Cancel"
          onClick={handleCancel}
        />
        <BotNavGrayButton
          variant="primary"
          icon={<StarTrophyIcon />}
          label="Award Points"
          onClick={handleAwardPoints}
        />
      </div>
    </BaseBottomNav>
  );
}
