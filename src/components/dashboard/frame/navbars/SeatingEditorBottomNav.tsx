'use client';

import { useState, useEffect, useRef } from 'react';
import type { SeatingEditBottomNavViewProps } from '@/hooks/useSeatingEditBottomNav';
import SeatingEditorAddGroupsMenu from '@/components/dashboard/menus/SeatingEditorAddGroupsMenu';
import SeatingSettingsMenu from '@/components/dashboard/menus/SeatingSettingsMenu';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
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
  onClearAllGroups,
  onDeleteAllGroups,
  onAddGroups,
}: SeatingEditorBottomNavProps) {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const [isAddGroupsMenuOpen, setIsAddGroupsMenuOpen] = useState(false);
  const addGroupsButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSettingsMenuOpen && !isAddGroupsMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

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
  }, [isSettingsMenuOpen, isAddGroupsMenuOpen]);

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

            <SeatingEditorAddGroupsMenu
              isOpen={isAddGroupsMenuOpen}
              onAddGroups={handleAddGroups}
            />
          </div>
        )}

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

      </div>
    </BaseBottomNav>
  );
}
