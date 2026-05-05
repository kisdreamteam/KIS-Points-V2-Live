import FeatureList from "@/components/ui/landing/FeatureList";
import HeroTitle from "@/components/ui/landing/HeroTitle";
import LandingHeader from "@/components/ui/landing/LandingHeader";
import LandingMascot from "@/components/ui/landing/LandingMascot";
import LandingNavLink from "@/components/ui/landing/LandingNavLink";

export default function LandingView() {
  return (
    <>
      <LandingHeader>
        <LandingNavLink href="/login">Login</LandingNavLink>
        <LandingNavLink href="/signup">Signup</LandingNavLink>
      </LandingHeader>

      <section className="pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-0">
          <LandingMascot />

          <div>
            <HeroTitle>
              Let&apos;s get
              <br />
              started.
            </HeroTitle>
            <FeatureList
              items={[
                "Classroom Management",
                "AI Teacher Assistance",
                "Teacher Resources",
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
