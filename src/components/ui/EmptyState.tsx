import Image from 'next/image';

const STUDENT_MASCOT_LEFT = '/images/dashboard/EmptyStates/No-student-Left-Mascot.png';
const STUDENT_MASCOT_RIGHT = '/images/dashboard/EmptyStates/No-student-Right-Mascot.png';

const mascotImageClassName = 'h-auto w-full max-w-[200px] object-contain';

const buttonClassName =
  'flex shrink-0 transform cursor-pointer rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText?: string;
  onAddClick?: () => void;
  showStudentMascots?: boolean;
}

export default function EmptyState({
  title,
  message,
  buttonText,
  onAddClick,
  showStudentMascots = false,
}: EmptyStateProps) {
  const actionButton =
    buttonText && onAddClick ? (
      <div className={buttonClassName} onClick={onAddClick}>
        <div className="flex items-center space-x-3">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>{buttonText}</span>
        </div>
      </div>
    ) : null;

  return (
    <div className="flex flex-row items-center h-full text-center">


      {/* <h2 className="mb-4 text-2xl font-bold text-gray-400">{title}</h2>
      <p className="mx-auto mb-8 max-w-md text-gray-400">{message}</p> */}

      {actionButton &&
        (showStudentMascots ? (
          <div className="mx-auto flex md:max-h-150 max-w-8xl items-center justify-center gap-1 px-1">
            <div className="hidden md:flex min-w-0 flex-1 items-center justify-end">
              <Image
                src="/images/dashboard/Emptystates/no-student-left-mascot.png"
                alt="left mascot"
                width={200}
                height={200}
                className="{mascotImageClassName} md:w-200 md:h-auto"
              />
            </div>
            <div className="flex flex-col min-w-0 w-100 flex-1 items-center justify-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-400">{title}</h2>
              <p className="mx-auto mb-8 max-w-md text-gray-400">{message}</p>
              {actionButton}
            </div>
            <div className="hidden md:flex min-w-0 w-100 flex-1 items-center justify-start bg-brand-cream rounded-2xl">
              <Image
                src="/images/dashboard/Emptystates/no-student-right-mascot.png"
                alt="right mascot"
                width={200}
                height={200}
                className="{mascotImageClassName} md:w-200 md:h-auto"
              />
            </div>
          </div>
        ) : (
          <div className="inline-block">{actionButton}</div>
        ))}
    </div>
  );
}
