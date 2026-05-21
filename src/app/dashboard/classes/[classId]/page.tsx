import DashboardView from '@/components/dashboard/frame/DashboardView';
import DashboardViewSwitch from '@/features/dashboard/DashboardViewSwitch';

type ClassRosterPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function ClassRosterPage({ params }: ClassRosterPageProps) {
  const { classId } = await params;

  return (
    <DashboardView>
      <DashboardViewSwitch key={classId} />
    </DashboardView>
  );
}
