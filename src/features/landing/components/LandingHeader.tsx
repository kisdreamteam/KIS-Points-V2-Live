import type { ReactNode } from "react";
import LandingLogo from "@/features/landing/components/LandingLogo";
import LandingNavLink from '@/features/landing/components/LandingNavLink'

export default function LandingHeader() {
  return (
    <header className="flex flex-row w-full justify-end items-end
                       pr-10 sm:pr-15 md:pr-20 lg:pr-25    
                       gap-10 sm:gap-15 md:gap-20 lg:gap-25">
      <div className="flex flex-row 
                      text-[clamp(1rem,3.0vw,2.75rem)]
                      gap-4 sm:gap-6 md:gap-8 lg:gap-10
                      text-lg text-white font-spartan font-bold">
        <LandingNavLink href="/login">Login</LandingNavLink>
        <LandingNavLink href="/signup">Signup</LandingNavLink>
      </div>
      <LandingLogo />
    </header>
  );
}


