import CardsGrid from '@/components/ui/CardsGrid';
import ScaledGridFrame from '@/components/ui/ScaledGridFrame';
import WholeClassCard from '@/components/dashboard/cards/WholeClassCard';
import StudentCard from '@/components/dashboard/cards/StudentCard';
import AddStudentCard from '@/components/dashboard/cards/AddStudentCard';

interface StudentCardsGridProps {
  orderedStudentIds: string[];
  isMultiSelectMode: boolean;
  selectedStudentIds: string[];
  classIcon: string | null;
  totalClassPoints: number;
  openDropdownId: string | null;
  onWholeClassClick: () => void;
  onSelectStudent: (studentId: string) => void;
  onToggleDropdown: (studentId: string, event: React.MouseEvent) => void;
  onEditStudent: (studentId: string) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
  onStudentClick: (studentId: string) => void;
  onAddStudent: () => void;
}

export default function StudentCardsGrid({
  orderedStudentIds,
  isMultiSelectMode,
  selectedStudentIds,
  classIcon,
  totalClassPoints,
  openDropdownId,
  onWholeClassClick,
  onSelectStudent,
  onToggleDropdown,
  onEditStudent,
  onDeleteStudent,
  onStudentClick,
  onAddStudent,
}: StudentCardsGridProps) {
  return (
    <ScaledGridFrame remeasureKey={`${orderedStudentIds.length}-${isMultiSelectMode ? 1 : 0}`}>
      <CardsGrid>
        <WholeClassCard
          classIcon={classIcon}
          totalPoints={totalClassPoints}
          onClick={onWholeClassClick}
        />
        {orderedStudentIds.map((studentId) => (
          <StudentCard
            key={studentId}
            studentId={studentId}
            openDropdownId={openDropdownId}
            onToggleDropdown={onToggleDropdown}
            onEdit={onEditStudent}
            onDelete={onDeleteStudent}
            onStudentClick={onStudentClick}
            isSelected={selectedStudentIds.includes(studentId)}
            onSelectStudent={onSelectStudent}
          />
        ))}
        {!isMultiSelectMode && <AddStudentCard onClick={onAddStudent} />}
      </CardsGrid>
    </ScaledGridFrame>
  );
}
