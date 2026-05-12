import DashboardView from '@/modules/dashboard/DashboardView';
import DashboardViewSwitch from '../../../../modules/dashboard/DashboardViewSwitch';

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
