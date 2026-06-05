import FeatureList from '@/features/landing/components/FeatureList'
import HeroTitle from '@/features/landing/components/HeroTitle'
import LandingHeader from '@/features/landing/components/LandingHeader'
import LandingMascot from '@/features/landing/components/LandingMascot'


export default function LandingView() {
  return (
    <div className="flex flex-col gap-[clamp(2.5rem,4.7vw,5rem)] bg-white">
      <header className="relative flex h-[clamp(5rem,10vw,8.75rem)] min-w-[200px] overflow-visible bg-brand-purple">
        <LandingHeader />
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-10 md:gap-[clamp(1.25rem,4vw,5rem)]">
        <div className="flex justify-center md:justify-end items-center lg:items-start">
          <LandingMascot />
        </div>

        <div className="flex flex-col gap-5 sm:gap-5 md:gap-[clamp(0.5rem,1vw,5rem)]">
          <HeroTitle>
            Let&apos;s get
            <br />
            started.
          </HeroTitle>
          <FeatureList
            items={[
              'Classroom Management',
              'AI Teacher Assistance',
              'Teacher Resources',
            ]}
          />
        </div>
      </main>
    </div>
  )
}
