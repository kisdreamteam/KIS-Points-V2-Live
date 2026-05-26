export const STUDENT_EVENTS = {
  TOGGLE_MULTI_SELECT: 'toggleMultiSelect',
  TOGGLE_GROUP_MULTI_SELECT: 'toggleGroupMultiSelect',
  SELECT_ALL: 'selectAll',
  SELECT_NONE: 'selectNone',
  RECENTLY_SELECT: 'recentlySelect',
  AWARD_POINTS: 'awardPoints',
  INVERSE_SELECT: 'inverseSelect',
  SELECTION_COUNT_CHANGED: 'selectionCountChanged',
  GROUP_SELECT_ENABLED_CHANGED: 'groupSelectEnabledChanged',
  MULTI_SELECT_STATE_CHANGED: 'multiSelectStateChanged',
  RECENTLY_SELECTED_CLEARED: 'recentlySelectedCleared',
  RECENTLY_SELECTED_UPDATED: 'recentlySelectedUpdated',
  STAGE_TOGGLE_POINT_LOG: 'stageToolbarTogglePointLog',
  STAGE_CLOSE_EDITOR: 'stageToolbarCloseEditor',
  STAGE_CREATE_LAYOUT: 'stageToolbarCreateLayout',
  STAGE_OPEN_SEATING_EDITOR: 'stageToolbarOpenSeatingEditor',
  STAGE_TOGGLE_LAYOUT_MANAGER: 'stageToolbarToggleLayoutManager',
  STAGE_TOGGLE_TEACHER_VIEW: 'stageToolbarToggleTeacherView',
  SEATING_EDIT_MODE: 'seatingChartEditMode',
  SEATING_VIEW_SETTINGS_CHANGED: 'seatingChartViewSettingsChanged',
  SEATING_LAYOUT_SELECTED: 'seatingChartLayoutSelected',
  SEATING_RANDOMIZE: 'seatingChartRandomize',
  SEATING_CLEAR_ALL_GROUPS: 'seatingChartClearAllGroups',
  SEATING_DELETE_ALL_GROUPS: 'seatingChartDeleteAllGroups',
  SEATING_SAVE: 'seatingChartSave',
  SEATING_ADD_MULTIPLE_GROUPS: 'seatingChartAddMultipleGroups',
  SEATING_AUTO_ASSIGN_SEATS: 'seatingChartAutoAssignSeats',
  SEATING_COLOR_CODE_BY: 'seatingChartColorCodeBy',
  /** Layout-hosted award modal: patch seating `groupAssignments` only (roster already updated in the dashboard store). */
  SEATING_STUDENT_POINTS_DELTA: 'seatingStudentPointsDelta',
  /** After multi-student award completes: clear grid multi-select selection (listeners in useStudentsSelection). */
  MULTI_STUDENT_AWARD_COMPLETE: 'multiStudentAwardComplete',
} as const;

export type SelectionCountChangedDetail = {
  studentCount: number;
  groupCount: number;
  awardableStudentCount: number;
};

export type GroupSelectEnabledChangedDetail = { enabled: boolean };
export type MultiSelectStateChangedDetail = { isMultiSelect: boolean };
export type SeatingEditModeDetail = { isEditMode: boolean };
export type SeatingLayoutSelectedDetail = { layoutId: string; classId: string };
export type SeatingViewSettingsChangedDetail = {
  layoutId: string;
  show_grid?: boolean;
  show_objects?: boolean;
  layout_orientation?: 'Left' | 'Right';
  color_by_gender?: boolean;
};
export type SeatingSaveDetail = { onSaveComplete?: () => void };
export type SeatingAddMultipleGroupsDetail = { numGroups: number };
export type SeatingColorCodeByDetail = { colorCodeBy: 'Gender' | 'Level' };

export function emitSelectionCountChanged(detail: SelectionCountChangedDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SELECTION_COUNT_CHANGED, { detail }));
}

export function emitMultiSelectStateChanged(detail: MultiSelectStateChangedDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.MULTI_SELECT_STATE_CHANGED, { detail }));
}

export function emitGroupSelectEnabledChanged(detail: GroupSelectEnabledChangedDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.GROUP_SELECT_ENABLED_CHANGED, { detail }));
}

export function emitRecentlySelectedCleared() {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.RECENTLY_SELECTED_CLEARED));
}

export function emitRecentlySelectedUpdated() {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.RECENTLY_SELECTED_UPDATED));
}

export function emitSeatingEditMode(detail: SeatingEditModeDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_EDIT_MODE, { detail }));
}

export function emitSeatingLayoutSelected(detail: SeatingLayoutSelectedDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_LAYOUT_SELECTED, { detail }));
}

export function emitSeatingViewSettingsChanged(detail: SeatingViewSettingsChangedDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED, { detail }));
}

export function emitSeatingRandomize() {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_RANDOMIZE));
}

export function emitSeatingClearAllGroups() {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_CLEAR_ALL_GROUPS));
}

export function emitSeatingDeleteAllGroups() {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_DELETE_ALL_GROUPS));
}

export function emitSeatingSave(detail: SeatingSaveDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_SAVE, { detail }));
}

export function emitSeatingAddMultipleGroups(detail: SeatingAddMultipleGroupsDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_ADD_MULTIPLE_GROUPS, { detail }));
}

export function emitSeatingAutoAssignSeats() {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_AUTO_ASSIGN_SEATS));
}

export function emitSeatingColorCodeBy(detail: SeatingColorCodeByDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_COLOR_CODE_BY, { detail }));
}

export type SeatingStudentPointsDeltaDetail = { classId: string; studentIds: string[]; delta: number };

export function emitSeatingStudentPointsDelta(detail: SeatingStudentPointsDeltaDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.SEATING_STUDENT_POINTS_DELTA, { detail }));
}

export type MultiStudentAwardCompleteDetail = { studentIds: string[] };

export function emitMultiStudentAwardComplete(detail: MultiStudentAwardCompleteDetail) {
  window.dispatchEvent(new CustomEvent(STUDENT_EVENTS.MULTI_STUDENT_AWARD_COMPLETE, { detail }));
}
