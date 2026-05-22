/**
 * Mirrors `src/assets/icons/WorkspaceToolbar/EditorAddMultipleIcon.svg` (multiple plus glyphs).
 */

interface EditorAddMultipleIconProps {
  className?: string;
}

export default function EditorAddMultipleIcon({
  className = 'w-6 h-6 text-black',
}: EditorAddMultipleIconProps) {
  return (
    <svg className={className} viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="currentColor"
        d="M39,46L46,46L46,39L51,39L51,46L58,46L58,51L51,51L51,58L46,58L46,51L39,51L39,46ZM31,25L38,25L38,18L43,18L43,25L50,25L50,30L43,30L43,37L38,37L38,30L31,30L31,25ZM18,39L25,39L25,32L30,32L30,39L37,39L37,44L30,44L30,51L25,51L25,44L18,44L18,39Z"
      />
    </svg>
  );
}
