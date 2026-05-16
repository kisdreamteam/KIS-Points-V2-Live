'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useSeatingStore } from '@/stores/useSeatingStore';
import { Student } from '@/lib/types';
import CreateLayoutModal from '@/components/dashboard/modals/CreateLayoutModal';
import EditGroupModal from '@/components/dashboard/modals/EditGroupModal';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal';
import SuccessNotificationModal from '@/components/ui/modals/SuccessNotificationModal';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import IconEditPencil from '@/components/ui/icons/iconEditPencil';
import SeatingCanvasDecor from '@/components/dashboard/seating/SeatingCanvasDecor';
import SeatingEditorGroupSettingsMenu from '@/components/dashboard/menus/SeatingEditorGroupSettingsMenu';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import { useSeatingChartEditor } from '@/hooks/useSeatingChart';

interface SeatingChartEditorWorkspaceProps {
  classId: string;
  students: Student[];
}

export default function SeatingChartEditorWorkspace({ classId, students }: SeatingChartEditorWorkspaceProps) {
  const { selectedStudentForGroup, setSelectedStudentForGroup, setUnseatedStudents, unseatedStudents } =
    useSeatingStore(
      useShallow((s) => ({
        unseatedStudents: s.unseatedStudents,
        setUnseatedStudents: s.setUnseatedStudents,
        selectedStudentForGroup: s.selectedStudentForGroup,
        setSelectedStudentForGroup: s.setSelectedStudentForGroup,
      }))
    );
  const selectedLayoutId = useSeatingStore((s) => s.selectedLayoutId);
  const setSelectedLayoutId = useSeatingStore((s) => s.setSelectedLayoutId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const seating = useSeatingChartEditor({
    classId,
    students,
    selectedLayoutId,
    setSelectedLayoutId,
    selectedStudentForGroup,
    setSelectedStudentForGroup,
    setUnseatedStudents,
    unseatedStudents,
    searchParams,
    router,
    pathname,
  });

  const {
    isLoading,
    error,
    fetchLayouts,
    layouts,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateLayout,
    showGrid,
    showObjects,
    layoutOrientation,
    isLoadingGroups,
    groups,
    canvasContainerRef,
    handleDragOver,
    handleDrop,
    getAssignmentsInGroup,
    targetGroupId,
    getGroupRenderLayout,
    groupPositions,
    getDefaultStaggerPosition,
    selectedStudentForSwap,
    studentsAboutToMove,
    studentsBeingPlaced,
    colorCodeBy,
    isRandomizing,
    handleStudentClick,
    removeStudentFromGroup,
    editingGroupNameId,
    draggedGroupId,
    handleDragStart,
    handleDragEnd,
    handleGroupClick,
    GROUP_EXPAND_ROW_HEIGHT,
    getSlotIndex,
    studentAtSlot,
    handleSlotClick,
    handleExpandInColumn,
    openSettingsMenuId,
    setOpenSettingsMenuId,
    handleDoubleClickGroupName,
    editingGroupNameValue,
    setEditingGroupNameValue,
    handleSaveGroupName,
    handleCancelEditGroupName,
    handleUpdateGroupColumns,
    handleEditTeam,
    handleClearTeam,
    handleDeleteTeam,
    isEditGroupModalOpen,
    editingGroup,
    setIsEditGroupModalOpen,
    setEditingGroup,
    handleUpdateGroup,
    isClearAllModalOpen,
    setIsClearAllModalOpen,
    handleClearAllConfirmed,
    isDeleteAllModalOpen,
    setIsDeleteAllModalOpen,
    handleDeleteAllConfirmed,
    isClearTeamModalOpen,
    teamToClear,
    setIsClearTeamModalOpen,
    setTeamToClear,
    handleClearTeamConfirmed,
    isDeleteTeamModalOpen,
    teamToDelete,
    setIsDeleteTeamModalOpen,
    setTeamToDelete,
    handleDeleteTeamConfirmed,
    isRandomizeModalOpen,
    setIsRandomizeModalOpen,
    handleRandomizeConfirmed,
    isAutoAssignModalOpen,
    setIsAutoAssignModalOpen,
    handleAutoAssignConfirmed,
    successNotification,
    setSuccessNotification,
  } = seating;

  const groupSettingsAnchorRef = useRef<HTMLButtonElement | null>(null);
  const groupSettingsMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    isMounted: isGroupSettingsMenuMounted,
    portalStyle: groupSettingsPortalStyle,
  } = useAnchoredDropdownPortal({
    isOpen: !!openSettingsMenuId,
    anchorRef: groupSettingsAnchorRef,
    placement: 'belowAnchorAlignEnd',
    widthPx: 220,
    gapPx: 4,
  });

  useEffect(() => {
    if (!openSettingsMenuId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (groupSettingsMenuRef.current?.contains(target)) return;
      if (groupSettingsAnchorRef.current?.contains(target)) return;
      setOpenSettingsMenuId(null);
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [openSettingsMenuId, setOpenSettingsMenuId]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <p className="text-white text-xl">Loading seating charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
        <p className="text-white text-xl">{error}</p>
        <button
          onClick={fetchLayouts}
          className="px-6 py-2 bg-purple-400 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (layouts.length === 0) {
    return (
      <div className="h-full min-h-0 p-6 sm:p-8 md:p-10">
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h2 className="text-white text-2xl font-semibold mb-2">No seating charts yet</h2>
            <p className="text-white/80 text-lg">
              Create your first seating chart layout to get started.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-3 bg-purple-400 text-white rounded-lg font-semibold text-lg hover:bg-purple-500 transition-colors shadow-lg"
          >
            Create New Layout
          </button>
        </div>
        <CreateLayoutModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateLayout={handleCreateLayout}
        />
      </div>
    );
  }

  return (
    <div className="font-spartan relative w-full h-full min-h-0 bg-brand-purple flex flex-col">
      <div className="w-full h-full min-h-0 bg-brand-purple relative overflow-hidden flex-1">
        <div className="h-full min-h-0 relative" style={{ zIndex: 1 }}>
          <div className="h-full min-h-0 flex flex-col relative">
            <div
              className="bg-brand-cream pt-2 h-full w-full min-h-0 relative flex-1 overflow-auto"
              style={{
                zIndex: 1
              }}
            >
              <SeatingCanvasDecor
                showGrid={showGrid}
                showObjects={showObjects}
                layoutOrientation={layoutOrientation}
                borderClassName="border-black"
              />
              {isLoadingGroups ? (
                <div className="flex items-center justify-center p-8 relative" style={{ zIndex: 1 }}>
                  <p className="text-white/80">Loading groups...</p>
                </div>
              ) : groups.length > 0 && (
                <div
                  ref={canvasContainerRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                  }}
                >
                  {groups.map((group, index) => {
                    const assignmentsInGroup = getAssignmentsInGroup(group.id);
                    const isTarget = selectedStudentForGroup && targetGroupId === group.id;
                    const { validColumns, numRows, groupWidth, groupHeight } = getGroupRenderLayout(
                      group.group_columns,
                      assignmentsInGroup
                    );
                    const position = groupPositions.get(group.id) || getDefaultStaggerPosition(index);
                    const groupX = position.x;
                    const groupY = position.y;

                    const studentCardHeight = 32;
                    const studentPointsWidth = 34;

                    const renderStudentCard = (student: Student) => {
                      const isSelected = selectedStudentForSwap?.studentId === student.id && selectedStudentForSwap?.groupId === group.id;
                      const isAboutToMove = studentsAboutToMove.has(student.id);
                      const isBeingPlaced = studentsBeingPlaced.has(student.id);

                      let bgColor = 'bg-white border-gray-200 hover:bg-gray-50';
                      if (isAboutToMove) {
                        bgColor = 'bg-yellow-300 border-yellow-500 hover:bg-yellow-400';
                      } else if (isBeingPlaced) {
                        bgColor = 'bg-blue-300 border-blue-500 hover:bg-blue-400';
                      } else if (isSelected) {
                        bgColor = 'bg-yellow-300 border-yellow-500 hover:bg-yellow-400';
                      } else {
                        if (colorCodeBy === 'Gender') {
                          if (student.gender === null || student.gender === undefined || student.gender === '') {
                            bgColor = 'bg-white border-gray-200 hover:bg-gray-50';
                          } else if (student.gender === 'Boy') {
                            bgColor = 'bg-blue-200 border-blue-300 hover:bg-blue-300';
                          } else if (student.gender === 'Girl') {
                            bgColor = 'bg-pink-200 border-pink-300 hover:bg-pink-300';
                          }
                        } else {
                          bgColor = 'bg-white border-gray-200 hover:bg-gray-50';
                        }
                      }

                      return (
                        <div
                          key={student.id}
                          onClick={(e) => handleStudentClick(e, student.id, group.id)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1 p-1.5 rounded border transition-colors min-w-0 overflow-hidden ${isRandomizing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                            } ${bgColor}`}
                          style={{
                            width: '100%',
                            height: `${studentCardHeight}px`
                          }}
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-2 pr-1">
                            <p
                              className="font-medium text-gray-800 overflow-hidden whitespace-nowrap flex-1 min-w-0 pr-1"
                              style={{
                                fontSize: 'clamp(0.8rem, 110%, 1.25rem)',
                                lineHeight: '1.2'
                              }}
                            >
                              {student.first_name}
                            </p>
                            <span className="text-red-600 font-semibold flex-shrink-0 text-right tabular-nums" style={{
                              width: `${studentPointsWidth}px`,
                              fontSize: 'clamp(0.875rem, 120%, 1.5rem)',
                              lineHeight: '1.2'
                            }}>
                              {student.points || 0}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isRandomizing) {
                                removeStudentFromGroup(student.id, group.id);
                              }
                            }}
                            className={`p-0.5 flex-shrink-0 ${isRandomizing
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-500 hover:text-red-700'
                              }`}
                            style={{ width: '16px', height: '16px' }}
                            title={isRandomizing ? 'Cannot remove during animation' : 'Remove from group'}
                            disabled={isRandomizing}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    };

                    const isEditingName = editingGroupNameId === group.id;
                    const isTargetForMove = selectedStudentForSwap && selectedStudentForSwap.groupId !== group.id;

                    return (
                      <div
                        key={group.id}
                        draggable={!isEditingName}
                        onDragStart={(e) => handleDragStart(e, group.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleGroupClick(group.id)}
                        className={`bg-white rounded-lg border-2 shadow-lg flex flex-col ${draggedGroupId === group.id ? 'shadow-2xl border-purple-600 opacity-50' :
                          isTarget ? 'border-purple-500 ring-4 ring-purple-300' :
                            isTargetForMove ? 'border-green-400 hover:border-green-500 cursor-pointer ring-2 ring-green-200' :
                              selectedStudentForGroup ? 'border-purple-400 hover:border-purple-500 cursor-pointer' :
                                'border-gray-300'
                          }`}
                        style={{
                          position: 'absolute',
                          left: `${groupX}px`,
                          top: `${groupY}px`,
                          width: `${groupWidth}px`,
                          height: `${groupHeight}px`,
                          zIndex: draggedGroupId === group.id ? 9999 : 1,
                          boxSizing: 'border-box',
                          gap: 0,
                          overflow: 'hidden',
                          transition: 'none',
                          pointerEvents: 'auto'
                        }}
                      >
                        <div
                          className={`border-b border-gray-200 bg-purple-50 rounded-t-lg relative ${isEditingName ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                            }`}
                          style={{
                            height: '50px',
                            minHeight: '50px',
                            maxHeight: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 0.5rem',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div
                            className="flex-1 relative group"
                            onDoubleClick={(e) => handleDoubleClickGroupName(group.id, group.name, e)}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {editingGroupNameId === group.id ? (
                              <input
                                type="text"
                                value={editingGroupNameValue}
                                onChange={(e) => setEditingGroupNameValue(e.target.value)}
                                onBlur={() => handleSaveGroupName(group.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveGroupName(group.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditGroupName(group.id);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="font-semibold text-gray-800 bg-white border border-purple-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800">{group.name}</h4>
                                <IconEditPencil className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mr-8" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                            {[1, 2, 3].map((cols) => (
                              <label
                                key={cols}
                                className="flex items-center gap-1 cursor-pointer"
                                title={`${cols} column${cols > 1 ? 's' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`group-columns-${group.id}`}
                                  value={cols}
                                  checked={validColumns === cols}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGroupColumns(group.id, cols);
                                  }}
                                  className="w-3 h-3 text-purple-600 bg-white border-gray-300 focus:ring-purple-500 focus:ring-1 cursor-pointer"
                                />
                                <span className="text-xs text-gray-600 font-medium">{cols}</span>
                              </label>
                            ))}
                          </div>

                          <button
                            data-settings-button={group.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenSettingsMenuId(openSettingsMenuId === group.id ? null : group.id);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              groupSettingsAnchorRef.current = e.currentTarget;
                            }}
                            className="absolute top-2 right-2 p-1 hover:bg-purple-100 rounded transition-colors"
                            title="Settings"
                          >
                            <IconSettingsWheel className="w-5 h-5 text-gray-600" />
                          </button>
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
                              alignItems: 'center'
                            }}
                          >
                            {Array.from({ length: validColumns }, (_, colIndex) => {
                              const slotIndex = getSlotIndex(rowIndex, colIndex, validColumns);
                              const student = studentAtSlot(group.id, slotIndex);
                              if (student) {
                                return (
                                  <div key={slotIndex} className="w-full min-w-0" onMouseDown={(e) => e.stopPropagation()}>
                                    {renderStudentCard(student)}
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={slotIndex}
                                  onClick={handleSlotClick(group.id, slotIndex)}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className={`rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs ${selectedStudentForGroup || isTargetForMove ? 'cursor-pointer hover:border-purple-400 hover:bg-purple-50' : 'cursor-default'
                                    }`}
                                  style={{ height: `${studentCardHeight}px` }}
                                >
                                  {selectedStudentForGroup || isTargetForMove ? 'Drop here' : 'Empty'}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${validColumns}, 1fr)`,
                            gap: '0.5rem',
                            padding: '0 0.5rem',
                            backgroundColor: '#f3f4f6',
                            height: `${GROUP_EXPAND_ROW_HEIGHT}px`,
                            minHeight: `${GROUP_EXPAND_ROW_HEIGHT}px`,
                            boxSizing: 'border-box',
                            alignItems: 'center'
                          }}
                        >
                          {Array.from({ length: validColumns }, (_, colIndex) => (
                            <div
                              key={`expand-${colIndex}`}
                              onClick={handleExpandInColumn(group.id, colIndex, validColumns)}
                              onMouseDown={(e) => e.stopPropagation()}
                              className={`flex items-center justify-center text-gray-500 text-xs rounded border border-dashed border-gray-300 min-h-[28px] ${selectedStudentForGroup || isTargetForMove ? 'cursor-pointer hover:border-purple-400 hover:bg-purple-50' : 'cursor-default'
                                }`}
                            >
                              + Add
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openSettingsMenuId &&
        isGroupSettingsMenuMounted &&
        groupSettingsPortalStyle &&
        createPortal(
          <div ref={groupSettingsMenuRef}>
            <SeatingEditorGroupSettingsMenu
              isOpen
              style={groupSettingsPortalStyle}
              onCloseMenu={() => setOpenSettingsMenuId(null)}
              onEditTeam={() => handleEditTeam(openSettingsMenuId)}
              onClearTeam={() => handleClearTeam(openSettingsMenuId)}
              onDeleteTeam={() => handleDeleteTeam(openSettingsMenuId)}
            />
          </div>,
          document.body
        )}

      <CreateLayoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateLayout={handleCreateLayout}
      />

      <EditGroupModal
        isOpen={isEditGroupModalOpen && editingGroup !== null}
        onClose={() => {
          setIsEditGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onUpdateGroup={handleUpdateGroup}
        initialName={editingGroup?.name || ''}
        initialColumns={editingGroup?.group_columns || 2}
      />

      <ConfirmationModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleClearAllConfirmed}
        title="Clear All Students"
        message="Are you sure you want to clear all students from all groups? This will remove all student assignments but keep the groups. Students will be moved back to the unseated list."
        confirmText="Clear All"
        cancelText="Cancel"
        confirmButtonColor="orange"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        }
      />

      <ConfirmationModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllConfirmed}
        title="Delete All Groups"
        message="Are you sure you want to delete ALL groups? This action cannot be undone and will permanently remove all groups and their student assignments. Students will be moved back to the unseated list."
        confirmText="Delete All"
        cancelText="Cancel"
        confirmButtonColor="red"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        }
      />

      <ConfirmationModal
        isOpen={isClearTeamModalOpen}
        onClose={() => {
          setIsClearTeamModalOpen(false);
          setTeamToClear(null);
        }}
        onConfirm={handleClearTeamConfirmed}
        title="Clear Team"
        message={teamToClear ? `Are you sure you want to clear all students from "${teamToClear.name}"? This will remove all student assignments from this team but keep the team. Students will be moved back to the unseated list.` : ''}
        confirmText="Clear Team"
        cancelText="Cancel"
        confirmButtonColor="orange"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        }
      />

      <ConfirmationModal
        isOpen={isDeleteTeamModalOpen}
        onClose={() => {
          setIsDeleteTeamModalOpen(false);
          setTeamToDelete(null);
        }}
        onConfirm={handleDeleteTeamConfirmed}
        title="Delete Team"
        message={teamToDelete ? `Are you sure you want to delete "${teamToDelete.name}"? This action cannot be undone and will permanently remove this team and all student assignments. Students will be moved back to the unseated list.` : ''}
        confirmText="Delete Team"
        cancelText="Cancel"
        confirmButtonColor="red"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        }
      />

      <ConfirmationModal
        isOpen={isRandomizeModalOpen}
        onClose={() => setIsRandomizeModalOpen(false)}
        onConfirm={() => {
          if (!isRandomizing) void handleRandomizeConfirmed();
        }}
        title="Randomize Seats"
        message="Are you sure you want to randomize seats?"
        confirmText="Randomize"
        cancelText="Cancel"
        confirmButtonColor="purple"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        }
      />

      <ConfirmationModal
        isOpen={isAutoAssignModalOpen}
        onClose={() => setIsAutoAssignModalOpen(false)}
        onConfirm={() => void handleAutoAssignConfirmed()}
        title="Auto Assign Seats"
        message="Are you sure you want to auto assign seats?"
        confirmText="Assign"
        cancelText="Cancel"
        confirmButtonColor="purple"
        icon={
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        }
      />

      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ isOpen: false, title: '', message: '' })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.title.includes('Error') || successNotification.title.includes('No') ? 'error' : 'success'}
        icon={
          successNotification.title.includes('Error') || successNotification.title.includes('No') ? (
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )
        }
        autoCloseDelay={successNotification.title.includes('Error') || successNotification.title.includes('No') ? 3000 : 2000}
      />
    </div>
  );
}
