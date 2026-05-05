import type { ReactNode } from "react";
import LandingLogo from "@/components/ui/landing/LandingLogo";

type LandingHeaderProps = {
  children: ReactNode;
};

export default function LandingHeader({ children }: LandingHeaderProps) {
  return (
    <header className="w-full bg-brand-purple h-[150px] relative">
      <div className="absolute flex items-center bottom-3 right-2 gap-9 mr-90 font-spartan">
        {children}
      </div>
      <LandingLogo />
    </header>
  );
}
