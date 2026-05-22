'use client';

import { useState } from 'react';

export type AddStudentsFormSubmitValues =
  | {
      mode: 'single';
      studentName: string;
      gender: string | null;
    }
  | {
      mode: 'bulk';
      studentList: string;
      importType: 'word' | 'excel';
    };

interface AddStudentsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AddStudentsFormSubmitValues) => void | Promise<void>;
  isLoading: boolean;
  error?: string | null;
  nextStudentNumber?: number | null;
  onStudentAdded: () => void;
}

export default function AddStudentsForm({
  onClose,
  onSubmit,
  isLoading,
  error,
  nextStudentNumber,
  onStudentAdded,
}: AddStudentsFormProps) {
  const [view, setView] = useState<'single' | 'bulk'>('single');
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [studentList, setStudentList] = useState('');
  const [importType, setImportType] = useState<'word' | 'excel'>('word');

  const handleClose = () => {
    setView('single');
    setStudentName('');
    setGender('');
    setStudentList('');
    setImportType('word');
    onClose();
  };

  const handleSaveStudent = async () => {
    const name = studentName.trim();
    if (!name) return;
    await onSubmit({ mode: 'single', studentName: name, gender: gender.trim() || null });
    onStudentAdded();
    handleClose();
  };

  const handleImportList = async () => {
    const text = studentList.trim();
    if (!text) return;
    await onSubmit({ mode: 'bulk', studentList: text, importType });
    onStudentAdded();
    handleClose();
  };

  return (
    <div className="relative">
      {view === 'single' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Add students</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Student Number</label>
              <input
                type="text"
                value={nextStudentNumber !== null ? nextStudentNumber : 'Calculating...'}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">add students by full name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="First and last name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="">Select gender</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <button onClick={() => setView('bulk')} className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
              Or, copy and paste your student list
            </button>
            <button onClick={handleSaveStudent} disabled={!studentName.trim() || isLoading} className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Save
            </button>
          </div>
        </div>
      )}

      {view === 'bulk' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Copy/Paste Student List</h2>
          <div className="flex gap-2">
            <button onClick={() => setImportType('word')} className={`flex-1 px-4 py-2 rounded-full font-medium transition-colors ${importType === 'word' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border-2 border-purple-300'}`}>Import from Word</button>
            <button onClick={() => setImportType('excel')} className={`flex-1 px-4 py-2 rounded-full font-medium transition-colors ${importType === 'excel' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border-2 border-purple-300'}`}>Import from Excel</button>
          </div>
          <textarea
            value={studentList}
            onChange={(e) => setStudentList(e.target.value)}
            placeholder={`Copy/Paste your students names here. Put each name on a new line.\n\nExamples:\nFirst name Last Name\nFirst name Last Name\nFirst name Last Name\n\n— or —\n\nLast name, First name\nLast name, First name\nLast name, First name`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[200px] text-sm text-gray-500 placeholder-gray-400"
            rows={12}
          />
          <div className="flex justify-end pt-2">
            <button onClick={handleImportList} disabled={!studentList.trim() || isLoading} className="px-6 py-2 bg-purple-400 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Import list
            </button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
