import type { FC, ReactNode } from "react";

type HeroTitleProps = {
  children: ReactNode;
};

const HeroTitle: FC<HeroTitleProps> = ({ children }) => {
  return (
    <h1 className="text-9xl leading-27.25 font-spartan font-bold mb-20 text-brand-purple">
      {children}
    </h1>
  );
};

export default HeroTitle;
