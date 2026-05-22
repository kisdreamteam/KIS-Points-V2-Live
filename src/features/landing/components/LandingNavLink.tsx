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
      className="text-white font-semibold text-2xl md:text-5xl font-spartan hover:opacity-80 transition"
    >
      {children}
    </Link>
  );
}
