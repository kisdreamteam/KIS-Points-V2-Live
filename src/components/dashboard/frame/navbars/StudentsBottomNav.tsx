'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { SortOption } from '@/stores/usePreferenceStore';
import { AttendanceMenuBody } from '@/components/dashboard/menus/AttendanceMenuBody';
import StudentsViewMenu from '@/components/dashboard/menus/StudentsViewMenu';
import StudentsSortingMenu from '@/components/dashboard/menus/StudentsSortingMenu';
import StudentsSettingsMenu from '@/components/dashboard/menus/StudentsSettingsMenu';
import { useAttendanceActions } from '@/hooks/useAttendanceActions';
import { useSortedStudents } from '@/hooks/useSortedStudents';
import { useDashboardStore } from '@/stores/useDashboardStore';
import IconViewDots from '@/components/ui/icons/iconViewDots';
import IconSortingArrows from '@/components/ui/icons/iconSortingArrows';
import IconCheckBox from '@/components/ui/icons/iconCheckBox';
import IconAttendanceCheck from '@/components/ui/icons/iconAttendanceCheck';
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
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const attendanceButtonRef = useRef<HTMLDivElement>(null);

  const students = useDashboardStore((s) => s.students);
  const absentStudentIds = useDashboardStore((s) => s.absentStudentIds);
  const { sortedStudents } = useSortedStudents(students, sortBy);
  const { toggleAttendance } = useAttendanceActions();

  const navEnabled = !buttonsDisabled;

  useEffect(() => {
    if (!buttonsDisabled) return;
    setIsSortPopupOpen(false);
    setIsSettingsPopupOpen(false);
    setIsViewPopupOpen(false);
    setIsAttendanceOpen(false);
  }, [buttonsDisabled]);

  useEffect(() => {
    if (!isSortPopupOpen && !isSettingsPopupOpen && !isViewPopupOpen && !isAttendanceOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const attendanceMenu = document.querySelector('[data-attendance-menu]');

      if (isSortPopupOpen && sortButtonRef.current && !sortButtonRef.current.contains(target)) {
        setIsSortPopupOpen(false);
      }
      if (isSettingsPopupOpen && settingsButtonRef.current && !settingsButtonRef.current.contains(target)) {
        setIsSettingsPopupOpen(false);
      }
      if (isViewPopupOpen && viewButtonRef.current && !viewButtonRef.current.contains(target)) {
        setIsViewPopupOpen(false);
      }
      if (isAttendanceOpen && !attendanceButtonRef.current?.contains(target)) {
        if (!attendanceMenu || !attendanceMenu.contains(target)) {
          setIsAttendanceOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isSortPopupOpen, isSettingsPopupOpen, isViewPopupOpen, isAttendanceOpen]);

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

        <div className="relative flex-shrink-0" ref={attendanceButtonRef}>
          <BotNavGrayButton
            icon={<IconAttendanceCheck />}
            label="Attendance"
            active={isAttendanceOpen}
            onClick={(e) => {
              e.stopPropagation();
              if (!navEnabled || !currentClassName) return;
              setIsAttendanceOpen((open) => !open);
            }}
            stopPropagation={true}
            enabled={navEnabled && !!currentClassName}
          />
        </div>

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

      {isAttendanceOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[105]"
              aria-hidden
              onClick={() => setIsAttendanceOpen(false)}
            />
            <div
              data-attendance-menu
              className="fixed bottom-[5.5rem] left-3 right-3 z-[110] mx-auto max-w-lg transition-transform duration-300 ease-out translate-y-0"
              onClick={(e) => e.stopPropagation()}
            >
              <AttendanceMenuBody
                students={sortedStudents}
                absentStudentIds={absentStudentIds}
                onToggleAbsence={toggleAttendance}
              />
            </div>
          </>,
          document.body
        )}
    </BaseBottomNav>
  );
}
