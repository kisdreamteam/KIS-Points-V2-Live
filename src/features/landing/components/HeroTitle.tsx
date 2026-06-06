import type { FC, ReactNode } from "react";

type HeroTitleProps = {
  children: ReactNode;
};

const HeroTitle: FC<HeroTitleProps> = ({ children }) => {
  return (
    <div className="flex w-full h-auto justify-center md:justify-start items-start">
      <h1 className="text-brand-purple font-spartan font-bold text-[clamp(4rem,10dvw,10rem)] leading-[0.9]">
        {children}
      </h1>
    </div>
  );
};

export default HeroTitle;
