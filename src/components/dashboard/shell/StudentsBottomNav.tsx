'use client';

import { useState, useEffect, useRef } from 'react';
import type { SortOption } from '@/stores/usePreferenceStore';
import ViewModeModal from '@/components/dashboard/modals/ViewModeModal';
import IconViewDots from '@/components/ui/icons/iconViewDots';
import IconSortingArrows from '@/components/ui/icons/iconSortingArrows';
import IconCheckBox from '@/components/ui/icons/iconCheckBox';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';
import DashboardBottomNavGrid from '@/components/dashboard/shell/DashboardBottomNavGrid';
import BottomNavRandomTimerCenter from '@/components/dashboard/shell/BottomNavRandomTimerCenter';

interface StudentsBottomNavProps {
  currentClassName: string | null;
  currentView: 'grid' | 'seating';
  onViewChange: (view: 'grid' | 'seating') => void;
  onTimerClick: () => void;
  onRandomClick: () => void;
  sortingDisabled?: boolean;
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
      <DashboardBottomNavGrid
        zone5={
          <>
            {currentClassName && (
              <div className="relative flex-shrink-0" ref={viewButtonRef}>
                <BotNavGrayButton
                  icon={<IconViewDots />}
                  label="View"
                  active={isViewPopupOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewPopupOpen(!isViewPopupOpen);
                  }}
                  stopPropagation={true}
                />
                <ViewModeModal
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
                    if (!sortingDisabled) setIsSortPopupOpen(!isSortPopupOpen);
                  }}
                  stopPropagation={true}
                  enabled={!sortingDisabled}
                />
                {isSortPopupOpen && (
                  <div className="absolute bottom-full left-0 z-[100] mb-2 min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg">
                    <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                      Sort by:
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange('number');
                        setIsSortPopupOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                        sortBy === 'number' ? 'bg-purple-50 font-medium text-brand-purple' : 'text-gray-700'
                      }`}
                    >
                      Student Number
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange('alphabetical');
                        setIsSortPopupOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                        sortBy === 'alphabetical' ? 'bg-purple-50 font-medium text-brand-purple' : 'text-gray-700'
                      }`}
                    >
                      Alphabetical
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange('points');
                        setIsSortPopupOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                        sortBy === 'points' ? 'bg-purple-50 font-medium text-brand-purple' : 'text-gray-700'
                      }`}
                    >
                      Points
                    </button>
                  </div>
                )}
              </div>
            )}

            <BotNavGrayButton icon={<IconCheckBox />} label="Multiple Select" onClick={onToggleMultiSelect} />
          </>
        }
        zone6={
          <BottomNavRandomTimerCenter
            interactive
            onRandomClick={onRandomClick}
            onTimerClick={onTimerClick}
          />
        }
        zone7={
          <div className="relative flex-shrink-0" ref={settingsButtonRef}>
            <BotNavGrayButton
              icon={<IconSettingsWheel />}
              label="Settings"
              active={isSettingsPopupOpen}
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsPopupOpen(!isSettingsPopupOpen);
              }}
              stopPropagation={true}
            />

            {isSettingsPopupOpen && (
              <div className="absolute bottom-full right-0 z-[100] mb-2 min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg">
                {classId && onEditClass && (
                  <button
                    type="button"
                    onClick={() => {
                      onEditClass();
                      setIsSettingsPopupOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Edit Class
                  </button>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        }
      />
    </BaseBottomNav>
  );
}
