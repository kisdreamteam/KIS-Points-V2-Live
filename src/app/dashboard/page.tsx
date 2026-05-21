import DashboardView from '@/components/dashboard/frame/DashboardView';
import DashboardViewSwitch from '@/modules/dashboard/DashboardViewSwitch';

export default function DashboardPage() {
  return (
    <DashboardView>
      <DashboardViewSwitch />
    </DashboardView>
  );
}
