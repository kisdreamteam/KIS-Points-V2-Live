export type RepairSeatAssignment = {
  studentId: string;
  groupId: string;
  seatIndex: number;
};

export type SeatingRepairDiff = {
  desiredCount: number;
  dbCount: number;
  toInsert: RepairSeatAssignment[];
  toUpdate: RepairSeatAssignment[];
  toDeleteStudentIds: string[];
};

/**
 * Diff desired (canvas) seats vs DB seats for one layout.
 * Keyed by studentId (UNIQUE per seating_chart_id).
 */
export function computeSeatingRepairDiff(
  desired: RepairSeatAssignment[],
  db: RepairSeatAssignment[]
): SeatingRepairDiff {
  const desiredByStudent = new Map<string, RepairSeatAssignment>();
  for (const seat of desired) {
    desiredByStudent.set(seat.studentId, seat);
  }

  const dbByStudent = new Map<string, RepairSeatAssignment>();
  for (const seat of db) {
    dbByStudent.set(seat.studentId, seat);
  }

  const toInsert: RepairSeatAssignment[] = [];
  const toUpdate: RepairSeatAssignment[] = [];
  const toDeleteStudentIds: string[] = [];

  for (const [studentId, want] of desiredByStudent) {
    const current = dbByStudent.get(studentId);
    if (!current) {
      toInsert.push(want);
      continue;
    }
    if (current.groupId !== want.groupId || current.seatIndex !== want.seatIndex) {
      toUpdate.push(want);
    }
  }

  for (const studentId of dbByStudent.keys()) {
    if (!desiredByStudent.has(studentId)) {
      toDeleteStudentIds.push(studentId);
    }
  }

  return {
    desiredCount: desiredByStudent.size,
    dbCount: dbByStudent.size,
    toInsert,
    toUpdate,
    toDeleteStudentIds,
  };
}
