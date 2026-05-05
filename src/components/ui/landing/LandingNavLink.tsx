import Link from "next/link";
import type { ReactNode } from "react";

type LandingNavLinkProps = {
  href: string;
  children: ReactNode;
};

export default function LandingNavLink({ href, children }: LandingNavLinkProps) {
  return (
    <Link
      href={href}
      className="text-white font-semibold text-5xl hover:opacity-80 transition font-spartan"
    >
      {children}
    </Link>
  );
}
