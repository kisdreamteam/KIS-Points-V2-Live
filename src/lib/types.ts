export interface PointCategory {
  id: string;
  name: string;
  /** Sign marker (±1) for DB compatibility; not the award amount. Use `type` for bucketing. */
  points?: number;
  default_points?: number; // Legacy database field name
  type?: 'positive' | 'negative';
  class_id: string;
  teacher_id?: string; // Optional, may not always be needed
  icon?: string; // Icon path from database
  is_archived?: boolean; // Soft-delete flag
  sort_order?: number; // Display order within class+type (0 = default slot, General)
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  points: number;
  has_been_picked?: boolean;
  avatar?: string; // Optional, may have a default
  student_number: number | null; // Integer type in database
  gender: string | null; // Optional, nullable
  class_id: string;
  is_archived?: boolean;
}

export interface AttendanceEvent {
  id: string;
  student_id: string;
  class_id: string;
  teacher_id: string;
  date: string; // ISO date (YYYY-MM-DD) from Postgres `date`
  created_at: string; // ISO timestamptz
}
