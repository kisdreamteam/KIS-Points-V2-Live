import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import DashboardViewSwitch from '../../../../modules/dashboard/DashboardViewSwitch';

type ClassRosterPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function ClassRosterPage({ params }: ClassRosterPageProps) {
  const { classId } = await params;

  return (
    <DashboardLayout>
      <DashboardViewSwitch key={classId} />
    </DashboardLayout>
  );
}
