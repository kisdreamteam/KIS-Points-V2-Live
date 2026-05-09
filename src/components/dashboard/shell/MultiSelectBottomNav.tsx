'use client';

import { useState, useEffect } from 'react';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconCheckCircle from '@/components/ui/icons/iconCheckCircle';
import IconCircleX from '@/components/ui/icons/iconCircleX';
import IconNoCircleX from '@/components/ui/icons/iconNoCircleX';
import IconStarTrophy from '@/components/ui/icons/iconStarTrophy';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';
import DashboardBottomNavGrid from '@/components/dashboard/shell/DashboardBottomNavGrid';
import BottomNavRandomTimerCenter from '@/components/dashboard/shell/BottomNavRandomTimerCenter';
import { STUDENT_EVENTS } from '@/lib/events/students';

export default function MultiSelectBottomNav() {
  const [selectedCount, setSelectedCount] = useState(0);
  const [hasRecentlySelected, setHasRecentlySelected] = useState(false);

  const checkRecentlySelected = () => {
    const lastSelectedClasses = localStorage.getItem('lastSelectedClasses');
    const lastSelectedStudents = localStorage.getItem('lastSelectedStudents');
    const hasData = !!(lastSelectedClasses || lastSelectedStudents);
    setHasRecentlySelected(hasData);
  };

  useEffect(() => {
    const handleSelectionCountChange = (event: CustomEvent) => {
      setTimeout(() => {
        setSelectedCount(event.detail.count || 0);
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
      window.removeEventListener(STUDENT_EVENTS.SELECTION_COUNT_CHANGED, handleSelectionCountChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_CLEARED, handleStorageChange);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECTED_UPDATED, handleStorageChange);
    };
  }, []);

  const handleSelectAll = () => {
    window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECT_ALL));
  };

  const handleSelectNone = () => {
    if (selectedCount > 0) {
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
    if (selectedCount > 0) {
      window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.INVERSE_SELECT));
    }
  };

  return (
    <BaseBottomNav className="overflow-visible">
      <DashboardBottomNavGrid
        zone5={
          <>
            <BotNavGrayButton icon={<IconCheckCircle />} label="Select All" onClick={handleSelectAll} />

            <BotNavGrayButton
              icon={<IconCircleX />}
              label="Select None"
              onClick={handleSelectNone}
              enabled={selectedCount > 0}
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
              enabled={selectedCount > 0}
            />
          </>
        }
        zone6={
          <BottomNavRandomTimerCenter interactive={false} onRandomClick={() => {}} onTimerClick={() => {}} />
        }
        zone7={
          <>
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
          </>
        }
      />
    </BaseBottomNav>
  );
}
