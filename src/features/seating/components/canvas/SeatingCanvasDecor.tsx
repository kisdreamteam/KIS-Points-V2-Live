import type { CSSProperties } from 'react';

interface SeatingCanvasDecorProps {
  showGrid: boolean;
  showObjects: boolean;
  layoutOrientation: string;
  isTeacherView?: boolean;
  borderClassName?: string;
  showSaveHint?: boolean;
}

export default function SeatingCanvasDecor({
  showGrid,
  showObjects,
  layoutOrientation,
  isTeacherView = false,
  borderClassName = 'border-gray-800',
  showSaveHint = false,
}: SeatingCanvasDecorProps) {
  const teacherViewLabelStyle: CSSProperties | undefined = isTeacherView
    ? { display: 'inline-block', transform: 'rotate(-180deg)' }
    : undefined;

  return (
    <>
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(209 213 219) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(209 213 219) 1px, transparent 1px)
            `,
            backgroundSize: '38px 38px',
            zIndex: 0,
          }}
        />
      )}

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className={`sticky top-0 left-1/2 -translate-x-1/2 bg-gray-700 border-2 ${borderClassName} rounded-lg flex items-center justify-center`}
          style={{
            width: '800px',
            height: '30px',
            zIndex: 0,
          }}
        >
          <span className="text-white font-semibold text-lg" style={teacherViewLabelStyle}>
            Whiteboard and TV
          </span>
        </div>

        {showSaveHint && (
          <div
            className={`sticky left-1/2 -translate-x-1/2 bg-red-600 border-2 border-red-800 rounded-lg flex items-center justify-center gap-2 px-4`}
            style={{
              top: '40px',
              width: 'fit-content',
              maxWidth: '90%',
              height: '36px',
              zIndex: 1,
            }}
          >
            <span className="text-white font-semibold whitespace-nowrap" style={teacherViewLabelStyle}>
              You must click on the &quot;X&quot; to save this seating chart
            </span>
            <svg
              className="w-5 h-5 text-white flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={teacherViewLabelStyle}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        )}

        {showObjects && (
          <div
            className={`absolute bg-gray-700 border-2 ${borderClassName} rounded-lg flex items-center justify-center`}
            style={{
              top: '55px',
              ...(layoutOrientation === 'Left' ? { left: '75px' } : { right: '75px' }),
              width: '200px',
              height: '75px',
              zIndex: 0,
            }}
          >
            <span className="text-white font-semibold" style={teacherViewLabelStyle}>
              Teacher's Desk
            </span>
          </div>
        )}
      </div>
    </>
  );
}
