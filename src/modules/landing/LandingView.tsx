import FeatureList from '@/components/ui/landing/FeatureList'
import HeroTitle from '@/components/ui/landing/HeroTitle'
import LandingHeader from '@/components/ui/landing/LandingHeader'
import LandingMascot from '@/components/ui/landing/LandingMascot'
import LandingNavLink from '@/components/ui/landing/LandingNavLink'

export default function LandingView() {
  return (
    <div className="flex-col-1 md:flex-col-2">
      <LandingHeader>
        <LandingNavLink href="/login">Login</LandingNavLink>
        <LandingNavLink href="/signup">Signup</LandingNavLink>
      </LandingHeader>

      <section>
        <div className="
          grid grid-cols-1 md:grid-cols-2 
          md:pt-60 pt-40 
          md:gap-20 gap-10">
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
