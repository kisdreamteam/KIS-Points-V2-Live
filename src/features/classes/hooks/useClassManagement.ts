'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUser } from '@/lib/api/auth.service';
import {
  addClassCollaborator,
  fetchClassById,
  fetchStudentsForClassEdit,
  getCurrentSessionUserId,
  listClassCollaborators,
  lookupTeacherByEmail,
  removeClassCollaborator,
  updateClassInfo,
} from '@/features/classes/lib/api/classes';
import {
  bulkUpdateStudents,
  deleteCustomPointEventsByStudentIds,
  fetchStudentIdsByClassIdForReset,
  getNextStartingStudentNumber,
  insertStudent,
  insertStudentsBulk,
  resetPointsByStudentIds,
} from '@/features/students/lib/api/students';
import type { Student } from '@/lib/types';
import type { AddStudentsFormSubmitValues } from '@/features/students/components/forms/AddStudentsForm';
import { refreshDashboardRosterIfActive } from '@/features/dashboard/hooks/sync/useDashboardStudentSync';

export interface CollaboratorTeacher {
  collaboratorRowId: string;
  collaboratorId: string;
  email: string;
  name?: string;
}

export interface StudentWithPhoto extends Student {
  photo?: string;
}

function isKshcmNetEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith('@kshcm.net');
}

export function useClassManagement({
  isOpen,
  classId,
  onRefresh,
  onClose,
}: {
  isOpen: boolean;
  classId: string;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('/images/dashboard/class-icons/icon-1.png');
  const [students, setStudents] = useState<StudentWithPhoto[]>([]);
  const [originalStudents, setOriginalStudents] = useState<StudentWithPhoto[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [teachers, setTeachers] = useState<CollaboratorTeacher[]>([]);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [pendingCollaborator, setPendingCollaborator] = useState<{ id: string; name: string | null; email: string } | null>(null);
  const [showConfirmAddCollaborator, setShowConfirmAddCollaborator] = useState(false);
  const [showNotFoundCollaborator, setShowNotFoundCollaborator] = useState(false);
  const [showCollaboratorSuccess, setShowCollaboratorSuccess] = useState(false);
  const [collaboratorSuccessName, setCollaboratorSuccessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [studentsWithoutFirstName, setStudentsWithoutFirstName] = useState<StudentWithPhoto[]>([]);
  const [showResetPointsPopup, setShowResetPointsPopup] = useState(false);
  const [isResettingPoints, setIsResettingPoints] = useState(false);
  const [isClassOwner, setIsClassOwner] = useState(true);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [addStudentsError, setAddStudentsError] = useState<string | null>(null);
  const [nextStudentNumber, setNextStudentNumber] = useState<number | null>(null);

  const fetchClassData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const userId = await getCurrentSessionUserId();
      const data = await fetchClassById(classId);
      if (!data) return;
      setClassName(data.name || '');
      setGrade(data.grade || '');
      setSelectedIcon(data.icon || '/images/dashboard/class-icons/icon-1.png');
      setIsClassOwner(userId === data.teacher_id);
    } finally {
      setIsLoadingData(false);
    }
  }, [classId]);

  const fetchStudents = useCallback(async () => {
    try {
      const studentsData = await fetchStudentsForClassEdit(classId);
      if (!studentsData) {
        setStudents([]);
        setOriginalStudents([]);
        setHasUnsavedChanges(false);
        return;
      }
      const typedStudents = [...studentsData].sort((a, b) => {
        if (a.student_number === null && b.student_number === null) {
          return (a.first_name || '').localeCompare(b.first_name || '');
        }
        if (a.student_number === null) return 1;
        if (b.student_number === null) return -1;
        if (a.student_number !== b.student_number) return a.student_number - b.student_number;
        return (a.first_name || '').localeCompare(b.first_name || '');
      }) as StudentWithPhoto[];
      setStudents(typedStudents);
      setOriginalStudents(JSON.parse(JSON.stringify(typedStudents)));
      setHasUnsavedChanges(false);
    } catch {
      setStudents([]);
      setOriginalStudents([]);
      setHasUnsavedChanges(false);
    }
  }, [classId]);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await listClassCollaborators(classId);
      if (!data || !Array.isArray(data)) {
        setTeachers([]);
        return;
      }
      setTeachers(
        data.map((row: { row_id: string; collaborator_id: string; name: string | null; email: string }) => ({
          collaboratorRowId: row.row_id,
          collaboratorId: row.collaborator_id,
          email: row.email,
          name: row.name ?? undefined,
        }))
      );
    } catch {
      setTeachers([]);
    }
  }, [classId]);

  useEffect(() => {
    if (isOpen && classId) {
      void fetchClassData();
      void fetchStudents();
      void fetchTeachers();
      void (async () => {
        try {
          setNextStudentNumber(await getNextStartingStudentNumber(classId));
        } catch {
          setNextStudentNumber(1);
        }
      })();
    }
  }, [isOpen, classId, fetchClassData, fetchStudents, fetchTeachers]);

  const submitAddStudents = useCallback(async (values: AddStudentsFormSubmitValues) => {
    setAddStudentsError(null);
    setIsAddingStudents(true);
    try {
      const getRandomAvatar = () => {
        const avatarNumber = Math.floor(Math.random() * 40) + 1;
        const avatarName = `avatar-${String(avatarNumber).padStart(2, '0')}.png`;
        return `/images/dashboard/student-avatars/${avatarName}`;
      };
      if (values.mode === 'single') {
        const parts = values.studentName.split(' ');
        await insertStudent({
          first_name: parts[0],
          last_name: parts.slice(1).join(' '),
          class_id: classId,
          avatar: getRandomAvatar(),
          gender: values.gender,
        });
      } else {
        const lines = values.studentList.split('\n').filter((line) => line.trim() !== '');
        const newStudents = lines.map((line) => {
          let first_name: string;
          let last_name: string;
          if (line.includes(',')) {
            const parts = line.split(',');
            last_name = parts[0].trim();
            first_name = parts[1].trim();
          } else {
            const parts = line.split(' ');
            first_name = parts[0].trim();
            last_name = parts.slice(1).join(' ').trim();
          }
          return { first_name, last_name, class_id: classId, avatar: getRandomAvatar() };
        });
        await insertStudentsBulk(newStudents);
      }
      await fetchStudents();
      await refreshDashboardRosterIfActive(classId);
      setHasUnsavedChanges(false);
      setNextStudentNumber(await getNextStartingStudentNumber(classId));
    } catch (err) {
      setAddStudentsError(err instanceof Error ? err.message : 'Failed to add students.');
    } finally {
      setIsAddingStudents(false);
    }
  }, [classId, fetchStudents]);

  const handleSaveInfo = useCallback(async () => {
    if (!isClassOwner) return alert('Only the primary class owner can edit class information.');
    if (!className.trim()) return alert('Please enter a class name.');
    setIsLoading(true);
    try {
      await updateClassInfo({ classId, name: className.trim(), grade: grade.trim(), icon: selectedIcon });
      onRefresh();
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [isClassOwner, className, classId, grade, selectedIcon, onRefresh, onClose]);

  const handleAddTeacher = useCallback(async () => {
    if (!isClassOwner) return alert('Only the primary class owner can manage collaborators.');
    if (!newTeacherEmail.trim()) return alert('Please enter an email address.');
    const email = newTeacherEmail.trim().toLowerCase();
    if (!isKshcmNetEmail(email)) return alert('Please enter a valid @kshcm.net email address.');

    setIsLoading(true);
    try {
      const sessionUser = await getSessionUser();
      const myEmail = sessionUser?.email?.trim().toLowerCase();
      if (myEmail && myEmail === email) return alert('You cannot add yourself as a collaborator.');
      const row = await lookupTeacherByEmail(email);
      if (!row || !row.id) return setShowNotFoundCollaborator(true);
      if (teachers.some((t) => t.collaboratorId === row.id)) return alert('That teacher is already a collaborator on this class.');
      setPendingCollaborator({ id: row.id, name: row.name, email: row.email });
      setShowConfirmAddCollaborator(true);
    } finally {
      setIsLoading(false);
    }
  }, [isClassOwner, newTeacherEmail, teachers]);

  const handleConfirmAddCollaborator = useCallback(async (pending: { id: string; name: string | null; email: string }) => {
    if (!isClassOwner) return alert('Only the primary class owner can manage collaborators.');
    setIsLoading(true);
    try {
      await addClassCollaborator(classId, pending.id);
      setCollaboratorSuccessName(pending.name?.trim() || pending.email);
      setNewTeacherEmail('');
      await fetchTeachers();
      setShowCollaboratorSuccess(true);
      onRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [isClassOwner, classId, fetchTeachers, onRefresh]);

  const handleRemoveTeacher = useCallback(async (collaboratorRowId: string, label: string) => {
    if (!isClassOwner) return alert('Only the primary class owner can manage collaborators.');
    if (!confirm(`Are you sure you want to remove ${label} from this class?`)) return;
    setIsLoading(true);
    try {
      await removeClassCollaborator(collaboratorRowId);
      await fetchTeachers();
      onRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [isClassOwner, fetchTeachers, onRefresh]);

  const handleSaveAllChanges = useCallback(async () => {
    setIsLoading(true);
    try {
      const invalidStudents = students.filter((student) => !student.first_name?.trim());
      if (invalidStudents.length > 0) {
        setStudentsWithoutFirstName(invalidStudents);
        setShowValidationWarning(true);
        return;
      }
      const updates = students.flatMap((student) => {
        const originalStudent = originalStudents.find((s) => s.id === student.id);
        if (!originalStudent) return [];
        const hasChanged =
          student.first_name !== originalStudent.first_name ||
          student.last_name !== originalStudent.last_name ||
          student.student_number !== originalStudent.student_number ||
          student.gender !== originalStudent.gender;
        if (!hasChanged) return [];
        return [{
          id: student.id,
          first_name: student.first_name.trim(),
          last_name: student.last_name?.trim() || null,
          student_number: student.student_number,
          gender: student.gender,
        }];
      });
      await bulkUpdateStudents(updates);
      await fetchStudents();
      await refreshDashboardRosterIfActive(classId);
      setHasUnsavedChanges(false);
      setShowSaveConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  }, [students, originalStudents, fetchStudents, classId]);

  const handleResetPoints = useCallback(async (deleteEvents: boolean) => {
    if (!isClassOwner) return alert('Only the primary class owner can reset points.');
    if (isResettingPoints) return;
    setIsResettingPoints(true);
    try {
      const studentIds = await fetchStudentIdsByClassIdForReset(classId);
      if (studentIds.length === 0) return alert('No students found in this class.');
      if (deleteEvents) await deleteCustomPointEventsByStudentIds(studentIds);
      await resetPointsByStudentIds(studentIds);
      await fetchStudents();
      await refreshDashboardRosterIfActive(classId);
      onRefresh();
      setShowResetPointsPopup(false);
    } finally {
      setIsResettingPoints(false);
    }
  }, [isClassOwner, isResettingPoints, classId, fetchStudents, onRefresh]);

  const handleReturnToDashboard = useCallback(() => {
    setShowSaveConfirmation(false);
    onClose();
    onRefresh();
    router.push('/dashboard');
  }, [onClose, onRefresh, router]);

  const handleCancelChanges = useCallback(() => {
    setStudents(JSON.parse(JSON.stringify(originalStudents)) as StudentWithPhoto[]);
    setHasUnsavedChanges(false);
  }, [originalStudents]);

  const handleSwitchFirstAndLastNames = useCallback(() => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        first_name: student.last_name || '',
        last_name: student.first_name,
      }))
    );
    setHasUnsavedChanges(true);
  }, []);

  const updateStudentField = useCallback(
    (studentId: string, field: keyof Pick<Student, 'first_name' | 'last_name' | 'student_number' | 'gender'>, value: string | number | null) => {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id !== studentId) return student;
          if (field === 'student_number') {
            const num = value === '' || value === null ? null : Number(value);
            return { ...student, student_number: Number.isNaN(num as number) ? null : num };
          }
          return { ...student, [field]: value };
        })
      );
      setHasUnsavedChanges(true);
    },
    []
  );

  const handleGenderToggle = useCallback((studentId: string, targetGender: 'Boy' | 'Girl') => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        const newGender = student.gender === targetGender ? null : targetGender;
        return { ...student, gender: newGender };
      })
    );
    setHasUnsavedChanges(true);
  }, []);

  return {
    className, setClassName,
    grade, setGrade,
    selectedIcon, setSelectedIcon,
    students, setStudents,
    originalStudents,
    hasUnsavedChanges, setHasUnsavedChanges,
    teachers,
    newTeacherEmail, setNewTeacherEmail,
    pendingCollaborator, setPendingCollaborator,
    showConfirmAddCollaborator, setShowConfirmAddCollaborator,
    showNotFoundCollaborator, setShowNotFoundCollaborator,
    showCollaboratorSuccess, setShowCollaboratorSuccess,
    collaboratorSuccessName,
    isLoading,
    isLoadingData,
    showSaveConfirmation, setShowSaveConfirmation,
    showValidationWarning, setShowValidationWarning,
    studentsWithoutFirstName,
    showResetPointsPopup, setShowResetPointsPopup,
    isResettingPoints,
    isClassOwner,
    isAddingStudents,
    addStudentsError,
    nextStudentNumber,
    fetchStudents,
    submitAddStudents,
    handleSaveInfo,
    handleAddTeacher,
    handleConfirmAddCollaborator,
    handleRemoveTeacher,
    handleSaveAllChanges,
    handleResetPoints,
    handleReturnToDashboard,
    handleCancelChanges,
    handleSwitchFirstAndLastNames,
    updateStudentField,
    handleGenderToggle,
  };
}
