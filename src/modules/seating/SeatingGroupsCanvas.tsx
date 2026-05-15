'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Student } from '@/lib/types';
import type { GroupAssignment, SeatingGroupRecord } from '@/lib/api/seating';
import { getNextIndex, getSlotIndex } from '@/lib/seatingLogic';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { useModalStore } from '@/stores/useModalStore';

type SeatingGroupsCanvasProps = {
  isTeacherView: boolean;
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  onSelectStudent?: (studentId: string) => void;
};

export default function SeatingGroupsCanvas({
  isTeacherView,
  isMultiSelectMode,
  selectedStudentIds,
  onSelectStudent,
}: SeatingGroupsCanvasProps) {
  const { groups, groupAssignmentsById, groupPositionsById, isLoadingGroups } = useSeatingStore(
    useShallow((s) => ({
      groups: s.groups,
      groupAssignmentsById: s.groupAssignmentsById,
      groupPositionsById: s.groupPositionsById,
      isLoadingGroups: s.isLoadingGroups,
    }))
  );

  const studentAtSlot = useCallback(
    (groupId: string, seatIndex: number): Student | null => {
      const list: GroupAssignment[] = groupAssignmentsById[groupId] ?? [];
      const found = list.find((a) => a.seat_index === seatIndex);
      return found ? found.student : null;
    },
    [groupAssignmentsById]
  );

  const handleGroupClick = (groupId: string) => {
    const studentsInGroup = (groupAssignmentsById[groupId] ?? []).map((a) => a.student);
    if (studentsInGroup.length === 0) {
      alert('This group has no students to award points to.');
      return;
    }
    const studentIds = studentsInGroup.map((student) => student.id);
    useModalStore.getState().openModal('award_points_multi', { studentIds });
  };

  const handleStudentClick = (student: Student) => {
    useModalStore.getState().openModal('award_points_multi', { studentIds: [student.id] });
  };

  if (isLoadingGroups) {
    return (
      <div className="flex items-center justify-center p-8 relative" style={{ zIndex: 1 }}>
        <p
          className="text-white/80"
          style={isTeacherView ? { display: 'inline-block', transform: 'rotate(-180deg)' } : undefined}
        >
          Loading groups...
        </p>
      </div>
    );
  }

  if (groups.length === 0) return null;

  return (
    <div
      className="relative"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      {groups.map((group: SeatingGroupRecord, index: number) => {
        const assignmentsInGroup: GroupAssignment[] = groupAssignmentsById[group.id] ?? [];
        const validColumns = Math.max(1, Math.min(3, group.group_columns || 2));
        const position = groupPositionsById[group.id] || { x: 20 + index * 20, y: 20 + index * 100 };
        const groupX = position.x;
        const groupY = position.y;
        const maxIndex =
          assignmentsInGroup.length === 0
            ? 0
            : getNextIndex(assignmentsInGroup.map((a) => a.seat_index)) - 1;
        const numRows = Math.max(1, Math.ceil(maxIndex / validColumns));
        const headerHeight = 50;
        const studentRowHeight = 50;
        const padding = 8;
        const gap = 8;
        const baseWidthFor2Columns = 400;
        const cardMinWidth = 180;
        const cardWidthFor2Columns = Math.max(
          cardMinWidth,
          (baseWidthFor2Columns - padding * 2 - gap * (2 - 1)) / 2
        );
        const twoColumnGroupWidth = Math.max(
          300,
          cardWidthFor2Columns * 2 + gap * (2 - 1) + padding * 2
        );
        let groupWidth: number;
        if (validColumns === 1) {
          groupWidth = twoColumnGroupWidth * 0.5;
        } else if (validColumns === 2) {
          groupWidth = twoColumnGroupWidth;
        } else {
          const cardWidth = Math.max(
            cardMinWidth,
            (baseWidthFor2Columns - padding * 2 - gap * (validColumns - 1)) / validColumns
          );
          groupWidth = Math.max(
            300,
            cardWidth * validColumns + gap * (validColumns - 1) + padding * 2
          );
        }
        const groupHeight = headerHeight + numRows * studentRowHeight + padding * 2;

        const studentCardHeight = 32;
        const studentPointsWidth = 36;

        const renderStudentCard = (student: Student) => {
          const isSelected = isMultiSelectMode && selectedStudentIds.includes(student.id);
          let bgColor: string;
          if (isSelected) {
            bgColor = 'bg-yellow-200 border-yellow-400';
          } else if (student.gender === null || student.gender === undefined || student.gender === '') {
            bgColor = 'bg-white border-gray-200';
          } else if (student.gender === 'Boy') {
            bgColor = 'bg-blue-200 border-blue-300';
          } else if (student.gender === 'Girl') {
            bgColor = 'bg-pink-200 border-pink-300';
          } else {
            bgColor = 'bg-white border-gray-200';
          }

          return (
            <div
              key={student.id}
              onClick={(e) => {
                e.stopPropagation();
                if (isMultiSelectMode && onSelectStudent) {
                  onSelectStudent(student.id);
                } else {
                  handleStudentClick(student);
                }
              }}
              className={`flex items-center gap-1 p-1.5 rounded border cursor-pointer hover:opacity-90 transition-opacity min-w-0 overflow-hidden ${bgColor}`}
              style={{
                width: '100%',
                height: `${studentCardHeight}px`,
              }}
            >
              <div
                className="flex-1 min-w-0 flex items-center gap-2 pr-1"
                style={
                  isTeacherView
                    ? { display: 'inline-flex', width: '100%', transform: 'rotate(-180deg)' }
                    : undefined
                }
              >
                <p
                  className="font-medium text-gray-800 overflow-hidden whitespace-nowrap flex-1 min-w-0 pr-1"
                  style={{
                    fontSize: 'clamp(0.8rem, 110%, 1.25rem)',
                    lineHeight: '1.2',
                  }}
                >
                  {student.first_name}
                </p>
                <span
                  className="text-red-600 font-semibold flex-shrink-0 text-right tabular-nums"
                  style={{
                    width: `${studentPointsWidth}px`,
                    fontSize: 'clamp(0.875rem, 120%, 1.5rem)',
                    lineHeight: '1.2',
                  }}
                >
                  {student.points || 0}
                </span>
              </div>
            </div>
          );
        };

        return (
          <div
            key={group.id}
            className="bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col transition-shadow"
            style={{
              position: 'absolute',
              left: `${groupX}px`,
              top: `${groupY}px`,
              width: `${groupWidth}px`,
              height: `${groupHeight}px`,
              zIndex: 1,
              boxSizing: 'border-box',
              gap: 0,
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!isMultiSelectMode) {
                  handleGroupClick(group.id);
                }
              }}
              className={`border-b border-gray-200 bg-purple-50 rounded-t-lg transition-colors ${!isMultiSelectMode ? 'cursor-pointer hover:bg-purple-100' : ''}`}
              style={{
                height: '50px',
                minHeight: '50px',
                maxHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.5rem',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="flex-1"
                style={isTeacherView ? { display: 'inline-block', transform: 'rotate(-180deg)' } : undefined}
              >
                <h4 className="font-semibold text-gray-800">{group.name}</h4>
              </div>
            </div>

            {Array.from({ length: numRows }, (_, rowIndex) => (
              <div
                key={`${group.id}-row-${rowIndex}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${validColumns}, 1fr)`,
                  gap: '0.5rem',
                  padding: '0 0.5rem',
                  backgroundColor: '#f9fafb',
                  height: '50px',
                  minHeight: '50px',
                  maxHeight: '50px',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  alignItems: 'center',
                }}
              >
                {Array.from({ length: validColumns }, (_, colIndex) => {
                  const slotIndex = getSlotIndex(rowIndex, colIndex, validColumns);
                  const student = studentAtSlot(group.id, slotIndex);
                  if (student) {
                    return (
                      <div key={slotIndex} className="w-full min-w-0">
                        {renderStudentCard(student)}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={slotIndex}
                      className="rounded border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs bg-gray-50/50"
                      style={{ height: `${studentCardHeight}px` }}
                    >
                      <span
                        style={
                          isTeacherView ? { display: 'inline-block', transform: 'rotate(-180deg)' } : undefined
                        }
                      >
                        Empty
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
