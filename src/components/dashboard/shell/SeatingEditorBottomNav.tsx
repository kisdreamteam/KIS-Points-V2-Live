'use client';

import { useState, useEffect, useRef } from 'react';
import type { SeatingEditBottomNavViewProps } from '@/hooks/useSeatingEditBottomNav';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import IconAutoAssign from '@/components/ui/icons/iconAutoAssign';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';
import DashboardBottomNavGrid from '@/components/dashboard/shell/DashboardBottomNavGrid';
import BottomNavRandomTimerCenter from '@/components/dashboard/shell/BottomNavRandomTimerCenter';

interface SeatingEditorBottomNavProps extends SeatingEditBottomNavViewProps {
  currentClassName: string | null;
  classId?: string | null;
  onEditClass?: () => void;
}

const toggleTrackOn = 'bg-brand-purple';
const toggleTrackOff = 'bg-gray-300';

export default function SeatingEditorBottomNav({
  currentClassName,
  classId = null,
  onEditClass,
  showGrid,
  showFurniture,
  teachersDeskLeft,
  colorByGender,
  onToggleShowGrid,
  onToggleShowFurniture,
  onToggleTeachersDeskLeft,
  onToggleColorByGender,
  onRandomize,
  onClearAllGroups,
  onDeleteAllGroups,
  onAddGroups,
  onAutoAssignSeats,
}: SeatingEditorBottomNavProps) {
  const [isViewSettingsMenuOpen, setIsViewSettingsMenuOpen] = useState(false);
  const viewSettingsButtonRef = useRef<HTMLDivElement>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const [isAddGroupsMenuOpen, setIsAddGroupsMenuOpen] = useState(false);
  const addGroupsButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isViewSettingsMenuOpen && !isSettingsMenuOpen && !isAddGroupsMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        isViewSettingsMenuOpen &&
        viewSettingsButtonRef.current &&
        !viewSettingsButtonRef.current.contains(target)
      ) {
        setIsViewSettingsMenuOpen(false);
      }

      if (isSettingsMenuOpen && settingsButtonRef.current && !settingsButtonRef.current.contains(target)) {
        setIsSettingsMenuOpen(false);
      }

      if (
        isAddGroupsMenuOpen &&
        addGroupsButtonRef.current &&
        !addGroupsButtonRef.current.contains(target)
      ) {
        setIsAddGroupsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isViewSettingsMenuOpen, isSettingsMenuOpen, isAddGroupsMenuOpen]);

  const handleClearAllGroups = () => {
    onClearAllGroups();
    setIsSettingsMenuOpen(false);
  };

  const handleDeleteAllGroups = () => {
    onDeleteAllGroups();
    setIsSettingsMenuOpen(false);
  };

  const handleAddGroups = (numGroups: number) => {
    onAddGroups(numGroups);
    setIsAddGroupsMenuOpen(false);
  };

  return (
    <BaseBottomNav className="overflow-visible">
      <DashboardBottomNavGrid
        zone5={
          <>
            {currentClassName && (
              <div className="relative flex-shrink-0" ref={viewSettingsButtonRef}>
                <BotNavGrayButton
                  icon={<IconSettingsWheel />}
                  label="View Settings"
                  active={isViewSettingsMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewSettingsMenuOpen(!isViewSettingsMenuOpen);
                  }}
                  stopPropagation={true}
                />

                {isViewSettingsMenuOpen && (
                  <div
                    data-view-settings-menu
                    className="absolute bottom-full left-0 z-[100] mb-2 min-w-[220px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Show Grid</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onToggleShowGrid(!showGrid);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showGrid ? toggleTrackOn : toggleTrackOff
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showGrid ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Show Furniture</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onToggleShowFurniture(!showFurniture);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showFurniture ? toggleTrackOn : toggleTrackOff
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showFurniture ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Teacher&apos;s Desk Left</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onToggleTeachersDeskLeft(!teachersDeskLeft);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          teachersDeskLeft ? toggleTrackOn : toggleTrackOff
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            teachersDeskLeft ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Color by Gender</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleColorByGender();
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          colorByGender ? toggleTrackOn : toggleTrackOff
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            colorByGender ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 opacity-50 hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Color by Level</span>
                      <button
                        type="button"
                        disabled
                        className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-gray-300 transition-colors"
                      >
                        <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentClassName && (
              <div className="relative flex-shrink-0" ref={addGroupsButtonRef}>
                <BotNavGrayButton
                  icon={<IconAddPlus />}
                  label="Add Groups"
                  active={isAddGroupsMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddGroupsMenuOpen(!isAddGroupsMenuOpen);
                  }}
                  stopPropagation={true}
                />

                {isAddGroupsMenuOpen && (
                  <div
                    data-add-groups-menu
                    className="absolute bottom-full left-0 z-[100] mb-2 min-w-[160px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddGroups(num);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100"
                      >
                        {num} Groups
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentClassName && (
              <BotNavGrayButton icon={<IconAutoAssign />} label="Auto Assign Seats" onClick={onAutoAssignSeats} />
            )}

            <BotNavGrayButton icon={<IconRandomArrows />} label="Randomize Seats" onClick={onRandomize} />

            {currentClassName && (
              <div className="relative flex-shrink-0" ref={settingsButtonRef}>
                <BotNavGrayButton
                  icon={<IconSettingsWheel />}
                  label="Settings"
                  active={isSettingsMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSettingsMenuOpen(!isSettingsMenuOpen);
                  }}
                  stopPropagation={true}
                />

                {isSettingsMenuOpen && (
                  <div
                    data-settings-menu
                    className="absolute bottom-full left-0 z-[100] mb-2 min-w-[220px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {classId && onEditClass && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClass();
                          setIsSettingsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors first:rounded-t-lg hover:bg-gray-50"
                      >
                        Edit Class
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAllGroups();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors first:rounded-t-lg hover:bg-gray-50"
                    >
                      Clear All Groups
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAllGroups();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors last:rounded-b-lg hover:bg-red-50"
                    >
                      Delete All Groups
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        }
        zone6={
          <BottomNavRandomTimerCenter interactive={false} onRandomClick={() => {}} onTimerClick={() => {}} />
        }
        zone7={
          <BotNavGrayButton
            variant="danger"
            icon={<IconAddPlus />}
            label="Add group"
            onClick={() => handleAddGroups(1)}
          />
        }
      />
    </BaseBottomNav>
  );
}
