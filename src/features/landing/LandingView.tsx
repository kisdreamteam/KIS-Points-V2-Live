import FeatureList from '@/features/landing/components/FeatureList'
import HeroTitle from '@/features/landing/components/HeroTitle'
import LandingHeader from '@/features/landing/components/LandingHeader'
import LandingMascot from '@/features/landing/components/LandingMascot'
import LandingNavLink from '@/features/landing/components/LandingNavLink'

export default function LandingView() {
  return (
    <div className="flex flex-col">
      <LandingHeader>
        <LandingNavLink href="/login">Login</LandingNavLink>
        <LandingNavLink href="/signup">Signup</LandingNavLink>
      </LandingHeader>

      <main>
        <div className="
          grid grid-cols-1 md:grid-cols-2 
          md:pt-20 pt-20 
          md:gap-40 gap-10">
          <LandingMascot />
          <div className="flex flex-col md:items-start items-center">
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
        </div>
      </main>
    </div>
  )
}
