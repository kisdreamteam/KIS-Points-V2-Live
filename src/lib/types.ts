export interface PointCategory {
  id: string;
  name: string;
  points?: number; // Optional, database may use default_points
  default_points?: number; // Database field name
  type?: 'positive' | 'negative'; // Optional, can be derived from points
  class_id: string;
  teacher_id?: string; // Optional, may not always be needed
  icon?: string; // Icon path from database
  is_archived?: boolean; // Soft-delete flag
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
