import type { FC } from "react";

interface FeatureListProps {
  items: string[];
}

const FeatureList: FC<FeatureListProps> = ({ items }) => {
  return (
    <ul className="
          md:text-4xl text-2xl  
          md:leading-15.25 leading-5 
          md:mt-0 mt-5
          md:ml-0 ml-15
          font-futura space-y-4 text-brand-pink">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

export default FeatureList;
