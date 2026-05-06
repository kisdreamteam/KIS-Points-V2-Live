import FeatureList from '@/components/ui/landing/FeatureList'
import HeroTitle from '@/components/ui/landing/HeroTitle'
import LandingHeader from '@/components/ui/landing/LandingHeader'
import LandingMascot from '@/components/ui/landing/LandingMascot'
import LandingNavLink from '@/components/ui/landing/LandingNavLink'

export default function LandingView() {
  return (
    <div className="flex h-screen w-full flex-col rounded-lg">
      <LandingHeader>
        <LandingNavLink href="/login">Login</LandingNavLink>
        <LandingNavLink href="/signup">Signup</LandingNavLink>
      </LandingHeader>

      <section className="pt-20">
        <div className="grid grid-cols-2">
          <LandingMascot />
          <div>
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
      </section>
    </div>
  )
}
