interface IconHappyMeterProps {
  className?: string;
}

export default function IconHappyMeter({
  className = 'w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-gray-400',
}: IconHappyMeterProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.5 18.5a7.5 7.5 0 0115 0"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18.5V9.5l3 2"
      />
      <circle cx="12" cy="18.5" r="1.25" fill="currentColor" stroke="none" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 18.5h10"
      />
    </svg>
  );
}
