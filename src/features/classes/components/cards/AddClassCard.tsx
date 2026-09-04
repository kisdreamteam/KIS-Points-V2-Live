import BaseCard from "@/components/ui/BaseCard";
import PlusIcon from "@/components/ui/icons/PlusIcon";

interface AddClassCardProps {
  onClick: () => void;
}

export default function AddClassCard({ onClick }: AddClassCardProps) {
  return (
    <BaseCard
      variant="action"
      title="Add New Class"
      subtitle="Create another class"
      onClick={onClick}
      icon={
        <div className="mb-1">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
            <PlusIcon className="h-10 w-10 text-white" />
          </div>
        </div>
      }
    />
  );
}
