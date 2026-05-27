'use client';

import { useState, useEffect, useCallback } from 'react';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconCheckCircle from '@/components/ui/icons/iconCheckCircle';
import IconCircleX from '@/components/ui/icons/iconCircleX';
import IconNoCircleX from '@/components/ui/icons/iconNoCircleX';
import IconStarTrophy from '@/components/ui/icons/iconStarTrophy';
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

  return (
    <BaseBottomNav className="overflow-visible">
      <div className="flex w-full min-w-0 items-center gap-4 overflow-visible">
        <BotNavGrayButton icon={<IconCheckCircle />} label="Select All" onClick={handleSelectAll} />

        <BotNavGrayButton
          icon={<IconCircleX />}
          label="Select None"
          onClick={handleSelectNone}
          enabled={awardableStudentCount > 0}
        />

        <BotNavGrayButton
          icon={<IconTimerClock />}
          label="Recently Selected"
          onClick={handleRecentlySelect}
          enabled={hasRecentlySelected}
        />

        <BotNavGrayButton
          icon={<IconRandomArrows />}
          label="Inverse Select"
          onClick={handleInverseSelect}
          enabled={awardableStudentCount > 0}
        />

        <BotNavGrayButton
          variant="danger"
          icon={<IconNoCircleX />}
          label="Cancel"
          onClick={handleCancel}
        />
        <BotNavGrayButton
          variant="primary"
          icon={<IconStarTrophy />}
          label="Award Points"
          onClick={handleAwardPoints}
        />
      </div>
    </BaseBottomNav>
  );
}
