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
    <div className="py-16 text-center">
      <div className="mb-8 text-gray-400">
        <svg className="mx-auto h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h2 className="mb-4 text-2xl font-bold text-gray-400">{title}</h2>
      <p className="mx-auto mb-8 max-w-md text-gray-400">{message}</p>

      {actionButton &&
        (showStudentMascots ? (
          <div className="mx-auto flex max-w-4xl items-center justify-center gap-4 px-4">
            <div className="flex min-w-0 flex-1 items-center justify-end">
              <Image
                src={STUDENT_MASCOT_LEFT}
                alt=""
                width={200}
                height={200}
                className={mascotImageClassName}
              />
            </div>
            {actionButton}
            <div className="flex min-w-0 flex-1 items-center justify-start">
              <Image
                src={STUDENT_MASCOT_RIGHT}
                alt=""
                width={200}
                height={200}
                className={mascotImageClassName}
              />
            </div>
          </div>
        ) : (
          <div className="inline-block">{actionButton}</div>
        ))}
    </div>
  );
}
