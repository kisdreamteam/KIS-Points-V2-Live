'use client';

import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import BotNavGrayButton from '@/components/ui/BotNavGrayButton';

type Props = {
  /** When false, renders invisible twins so Zone 6 width matches the students bar. */
  interactive: boolean;
  onRandomClick: () => void;
  onTimerClick: () => void;
};

export default function BottomNavRandomTimerCenter({ interactive, onRandomClick, onTimerClick }: Props) {
  return (
    <>
      <BotNavGrayButton
        icon={<IconRandomArrows />}
        label="Random"
        onClick={() => onRandomClick()}
        visuallyHidden={!interactive}
        enabled={interactive}
      />
      <BotNavGrayButton
        icon={<IconTimerClock />}
        label="Timer"
        onClick={() => onTimerClick()}
        visuallyHidden={!interactive}
        enabled={interactive}
      />
    </>
  );
}
