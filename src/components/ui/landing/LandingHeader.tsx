import type { ReactNode } from "react";
import LandingLogo from "@/components/ui/landing/LandingLogo";

type LandingHeaderProps = {
  children: ReactNode;
};

export default function LandingHeader({ children }: LandingHeaderProps) {
  return (
    <header className="absolute w-full h-20 md:h-38 bg-brand-purple">
      <div className="absolute flex items-center bottom-3 right-2 gap-4 md:gap-9 md:mr-90 mr-45">
        {children}
      </div>
      <LandingLogo />
    </header>
  );
}
