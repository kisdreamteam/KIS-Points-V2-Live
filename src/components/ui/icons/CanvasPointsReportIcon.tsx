/**
 * Table/report icon for workspace toolbar.
 */

interface CanvasPointsReportIconProps {
  className?: string;
}

export default function CanvasPointsReportIcon({
  className = 'w-6 h-6 text-black',
}: CanvasPointsReportIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 4v16" stroke="currentColor" strokeWidth="1.75" />
      <path d="M13 13h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M13 16h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
