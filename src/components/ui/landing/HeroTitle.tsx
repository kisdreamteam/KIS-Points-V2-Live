import type { FC, ReactNode } from "react";

type HeroTitleProps = {
  children: ReactNode;
};

const HeroTitle: FC<HeroTitleProps> = ({ children }) => {
  return (
    <h1 className="
          md:text-9xl text-4xl  
          md:leading-27.25 leading-10 
          md:mb-20 mb-0 
          md:ml-0 ml-15
          font-spartan font-semibold text-brand-purple">
      {children}
    </h1>
  );
};

export default HeroTitle;
