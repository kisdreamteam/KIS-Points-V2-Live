import CardsGrid from '@/components/ui/CardsGrid';
import ScaledGridFrame from '@/components/ui/ScaledGridFrame';
import ClassCard from '@/features/classes/components/cards/ClassCard';
import AddClassCard from '@/features/classes/components/cards/AddClassCard';

interface Class {
  id: string;
  name: string;
  icon?: string;
  is_owner?: boolean;
}

interface ClassCardsGridProps {
  classes: Class[];
  studentCounts: Record<string, number>;
  openDropdownId: string | null;
  onToggleDropdown: (classId: string, event: React.MouseEvent) => void;
  onEdit: (classId: string) => void;
  onArchive: (classId: string, className: string) => void;
  onAddClass: () => void;
  archiveButtonText?: string;
  showAddCard?: boolean;
  onDelete?: (classId: string, className: string) => void;
  showDelete?: boolean;
}

export default function ClassCardsGrid({
  classes,
  studentCounts,
  openDropdownId,
  onToggleDropdown,
  onEdit,
  onArchive,
  onAddClass,
  archiveButtonText,
  showAddCard = true,
  onDelete,
  showDelete = false,
}: ClassCardsGridProps) {
  return (
    <ScaledGridFrame
      responsiveScale={{ base: 0.67, md: 1 }}
      remeasureKey={`${classes.length}-${showAddCard ? 1 : 0}-${showDelete ? 1 : 0}`}
    >
      <CardsGrid className="ml-2">
        {classes.map((cls) => (
          <ClassCard
            key={cls.id}
            classItem={cls}
            studentCount={studentCounts[cls.id] || 0}
            openDropdownId={openDropdownId}
            onToggleDropdown={onToggleDropdown}
            onEdit={onEdit}
            onArchive={onArchive}
            archiveButtonText={archiveButtonText}
            onDelete={onDelete}
            showDelete={showDelete}
          />
        ))}
        {showAddCard && <AddClassCard onClick={onAddClass} />}
      </CardsGrid>
    </ScaledGridFrame>
  );
}
