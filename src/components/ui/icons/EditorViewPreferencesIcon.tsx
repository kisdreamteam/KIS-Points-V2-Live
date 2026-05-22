/**
 * Mirrors `src/assets/icons/WorkspaceToolbar/EditorViewPreferencesIcon.svg` (slider / view preference graphic).
 */

interface EditorViewPreferencesIconProps {
  className?: string;
}

const stroke = {
  stroke: 'currentColor' as const,
  strokeWidth: 32,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
};

export default function EditorViewPreferencesIcon({
  className = 'w-6 h-6 text-black',
}: EditorViewPreferencesIconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <line x1="368" y1="128" x2="448" y2="128" {...stroke} />
      <line x1="64" y1="128" x2="304" y2="128" {...stroke} />
      <line x1="368" y1="384" x2="448" y2="384" {...stroke} />
      <line x1="64" y1="384" x2="304" y2="384" {...stroke} />
      <line x1="208" y1="256" x2="448" y2="256" {...stroke} />
      <line x1="64" y1="256" x2="144" y2="256" {...stroke} />
      <circle cx="336" cy="128" r="32" {...stroke} />
      <circle cx="176" cy="256" r="32" {...stroke} />
      <circle cx="336" cy="384" r="32" {...stroke} />
    </svg>
  );
}
