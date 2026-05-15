'use client';

import { useState, useEffect, useRef } from 'react';
import type { SortOption } from '@/stores/usePreferenceStore';
import StudentsViewMenu from '@/components/dashboard/menus/StudentsViewMenu';
import StudentsSortingMenu from '@/components/dashboard/menus/StudentsSortingMenu';
import StudentsSettingsMenu from '@/components/dashboard/menus/StudentsSettingsMenu';
import IconViewDots from '@/components/ui/icons/iconViewDots';
import IconSortingArrows from '@/components/ui/icons/iconSortingArrows';
import IconCheckBox from '@/components/ui/icons/iconCheckBox';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';

interface StudentsBottomNavProps {
  currentClassName: string | null;
  currentView: 'grid' | 'seating';
  onViewChange: (view: 'grid' | 'seating') => void;
  onTimerClick: () => void;
  onRandomClick: () => void;
  sortingDisabled?: boolean;
  buttonsDisabled?: boolean;
  classId?: string | null;
  onEditClass?: () => void;
  sortBy: SortOption;
  onSortChange: (next: SortOption) => void;
  onLogout: () => void;
  onToggleMultiSelect: () => void;
}

export default function StudentsBottomNav({
  currentClassName,
  currentView,
  onViewChange,
  onTimerClick,
  onRandomClick,
  sortingDisabled = false,
  buttonsDisabled = false,
  classId = null,
  onEditClass,
  sortBy,
  onSortChange,
  onLogout,
  onToggleMultiSelect,
}: StudentsBottomNavProps) {
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const sortButtonRef = useRef<HTMLDivElement>(null);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const viewButtonRef = useRef<HTMLDivElement>(null);

  const navEnabled = !buttonsDisabled;

  useEffect(() => {
    if (!buttonsDisabled) return;
    setIsSortPopupOpen(false);
    setIsSettingsPopupOpen(false);
    setIsViewPopupOpen(false);
  }, [buttonsDisabled]);

  useEffect(() => {
    if (!isSortPopupOpen && !isSettingsPopupOpen && !isViewPopupOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (isSortPopupOpen && sortButtonRef.current && !sortButtonRef.current.contains(target)) {
        setIsSortPopupOpen(false);
      }
      if (isSettingsPopupOpen && settingsButtonRef.current && !settingsButtonRef.current.contains(target)) {
        setIsSettingsPopupOpen(false);
      }
      if (isViewPopupOpen && viewButtonRef.current && !viewButtonRef.current.contains(target)) {
        setIsViewPopupOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isSortPopupOpen, isSettingsPopupOpen, isViewPopupOpen]);

  return (
    <BaseBottomNav className="overflow-visible">
      <div className="flex w-full min-w-0 items-center gap-4 overflow-visible">
        {currentClassName && (
          <div className="relative flex-shrink-0" ref={viewButtonRef}>
            <BotNavGrayButton
              icon={<IconViewDots />}
              label="View"
              active={isViewPopupOpen}
              onClick={(e) => {
                e.stopPropagation();
                if (!navEnabled) return;
                setIsViewPopupOpen(!isViewPopupOpen);
              }}
              stopPropagation={true}
              enabled={navEnabled}
            />
            <StudentsViewMenu
              isOpen={isViewPopupOpen}
              onClose={() => setIsViewPopupOpen(false)}
              currentView={currentView}
              onViewChange={(view) => {
                onViewChange(view);
                setIsViewPopupOpen(false);
              }}
            />
          </div>
        )}

        {currentClassName && (
          <div className="relative flex-shrink-0" ref={sortButtonRef}>
            <BotNavGrayButton
              icon={<IconSortingArrows />}
              label="Sorting"
              active={isSortPopupOpen}
              onClick={(e) => {
                e.stopPropagation();
                if (!navEnabled || sortingDisabled) return;
                setIsSortPopupOpen(!isSortPopupOpen);
              }}
              stopPropagation={true}
              enabled={navEnabled && !sortingDisabled}
            />
            <StudentsSortingMenu
              isOpen={isSortPopupOpen}
              sortBy={sortBy}
              onPick={(next) => {
                onSortChange(next);
                setIsSortPopupOpen(false);
              }}
            />
          </div>
        )}

        <BotNavGrayButton
          icon={<IconCheckBox />}
          label="Multiple Select"
          onClick={() => {
            if (!navEnabled) return;
            onToggleMultiSelect();
          }}
          enabled={navEnabled}
        />

        <BotNavGrayButton
          icon={<IconRandomArrows />}
          label="Random"
          onClick={() => {
            if (!navEnabled) return;
            onRandomClick();
          }}
          enabled={navEnabled}
        />
        <BotNavGrayButton
          icon={<IconTimerClock />}
          label="Timer"
          onClick={() => {
            if (!navEnabled) return;
            onTimerClick();
          }}
          enabled={navEnabled}
        />

        <div className="relative flex-shrink-0" ref={settingsButtonRef}>
          <BotNavGrayButton
            icon={<IconSettingsWheel />}
            label="Settings"
            active={isSettingsPopupOpen}
            onClick={(e) => {
              e.stopPropagation();
              if (!navEnabled) return;
              setIsSettingsPopupOpen(!isSettingsPopupOpen);
            }}
            stopPropagation={true}
            enabled={navEnabled}
          />

          <StudentsSettingsMenu
            isOpen={isSettingsPopupOpen}
            classId={classId}
            onEditClass={onEditClass}
            onCloseMenu={() => setIsSettingsPopupOpen(false)}
            onLogout={onLogout}
          />
        </div>
      </div>
    </BaseBottomNav>
  );
}
