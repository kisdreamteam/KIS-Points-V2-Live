import DashboardView from '@/components/dashboard/frame/DashboardView';
import DashboardViewSwitch from '@/features/dashboard/DashboardViewSwitch';

export default function DashboardPage() {
  return (
    <DashboardView>
      <DashboardViewSwitch />
    </DashboardView>
  );
}
