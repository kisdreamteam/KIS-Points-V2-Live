'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/modals/Modal';
import EditStudentForm from '@/features/students/components/forms/EditStudentForm';
import { Student } from '@/lib/types';
import { normalizeAvatarPath } from '@/lib/iconUtils';

export type EditStudentModalSubmitValues = {
  studentId: string;
  first_name: string;
  last_name: string | null;
  student_number: number | null;
  gender: string | null;
  avatar: string;
};

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmit: (values: EditStudentModalSubmitValues) => Promise<void>;
}

export default function EditStudentModal({ isOpen, onClose, student, onSubmit }: EditStudentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [gender, setGender] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/images/dashboard/student-avatars/avatar-01.png');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen && student) {
      setFirstName(student.first_name || '');
      setLastName(student.last_name || '');
      setStudentNumber(student.student_number?.toString() || '');
      setSelectedAvatar(normalizeAvatarPath(student.avatar));
      setGender(student.gender || '');
      setIsLoadingData(false);
    } else if (!isOpen) {
      setFirstName('');
      setLastName('');
      setStudentNumber('');
      setGender('');
      setSelectedAvatar('/images/dashboard/student-avatars/avatar-01.png');
      setIsLoadingData(true);
    }
  }, [isOpen, student]);

  const handleSave = async () => {
    if (!student) return;
    if (!firstName.trim()) {
      alert('Please enter a first name.');
      return;
    }
    const studentNumberValue = studentNumber.trim() ? parseInt(studentNumber.trim(), 10) : null;
    if (studentNumber.trim() && studentNumberValue !== null && isNaN(studentNumberValue)) {
      alert('Please enter a valid student number.');
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({
        studentId: student.id,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        student_number: studentNumberValue,
        gender: gender.trim() || null,
        avatar: selectedAvatar,
      });
    } catch (err) {
      console.error('Unexpected error updating student:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="bg-[#F5F5F5] rounded-[28px] p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-brand-purple mb-2">Edit Student</h2>
        </div>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4" />
              <p className="text-gray-600">Loading student data...</p>
            </div>
          </div>
        ) : (
          <EditStudentForm
            firstName={firstName}
            lastName={lastName}
            studentNumber={studentNumber}
            gender={gender}
            selectedAvatar={selectedAvatar}
            isLoading={isLoading}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onStudentNumberChange={setStudentNumber}
            onGenderChange={setGender}
            onAvatarChange={setSelectedAvatar}
            onCancel={onClose}
            onSave={() => void handleSave()}
          />
        )}
      </div>
    </Modal>
  );
}
