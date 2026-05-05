import LandingView from '@/modules/landing/LandingView';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main>
        <LandingView />
      </main>
    </div>
  );
}
