'use client';

import { useState, useEffect, useRef } from 'react';
import type { SeatingEditBottomNavViewProps } from '@/hooks/useSeatingEditBottomNav';
import SeatingViewSettingsMenu from '@/components/dashboard/menus/SeatingViewSettingsMenu';
import SeatingSettingsMenu from '@/components/dashboard/menus/SeatingSettingsMenu';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import IconAutoAssign from '@/components/ui/icons/iconAutoAssign';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';
import BaseBottomNav from '@/components/ui/BaseBottomNav';

interface SeatingEditorBottomNavProps extends SeatingEditBottomNavViewProps {
  currentClassName: string | null;
  classId?: string | null;
  onEditClass?: () => void;
}

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
      <div className="flex w-full min-w-0 items-center gap-4 overflow-visible">
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

            <SeatingViewSettingsMenu
              isOpen={isViewSettingsMenuOpen}
              showGrid={showGrid}
              showFurniture={showFurniture}
              teachersDeskLeft={teachersDeskLeft}
              colorByGender={colorByGender}
              onToggleShowGrid={onToggleShowGrid}
              onToggleShowFurniture={onToggleShowFurniture}
              onToggleTeachersDeskLeft={onToggleTeachersDeskLeft}
              onToggleColorByGender={onToggleColorByGender}
            />
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

            <SeatingSettingsMenu
              isOpen={isSettingsMenuOpen}
              classId={classId}
              onEditClass={onEditClass}
              onCloseMenu={() => setIsSettingsMenuOpen(false)}
              onClearAllGroups={handleClearAllGroups}
              onDeleteAllGroups={handleDeleteAllGroups}
            />
          </div>
        )}

        <BotNavGrayButton
          variant="danger"
          icon={<IconAddPlus />}
          label="Add group"
          onClick={() => handleAddGroups(1)}
        />
      </div>
    </BaseBottomNav>
  );
}
