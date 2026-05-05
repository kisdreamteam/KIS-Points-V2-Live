import type { FC } from "react";

interface FeatureListProps {
  items: string[];
}

const FeatureList: FC<FeatureListProps> = ({ items }) => {
  return (
    <ul className="text-4xl leading-15.25 font-futura space-y-4 text-brand-pink">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

export default FeatureList;
