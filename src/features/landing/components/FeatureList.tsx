import type { FC } from "react";

interface FeatureListProps {
  items: string[];
}

const FeatureList: FC<FeatureListProps> = ({ items }) => {
  return (
    <div className="flex flex-col 
    w-full h-auto justify-center md:justify-start items-center md:items-start text-brand-pink">
      <ul className="text-[clamp(1.25rem,3vw,2.25rem)] font-bold leading-tight font-futura text-brand-pink">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};


export default FeatureList;
