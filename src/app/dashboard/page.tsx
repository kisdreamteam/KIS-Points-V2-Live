import DashboardView from '@/features/dashboard/components/frame/DashboardView';
import DashboardViewSwitch from '@/features/dashboard/DashboardViewSwitch';

export default function DashboardPage() {
  return (
    <DashboardView>
      <DashboardViewSwitch />
    </DashboardView>
  );
}
