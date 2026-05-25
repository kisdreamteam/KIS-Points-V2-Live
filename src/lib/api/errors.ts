export class ApiError extends Error {
  code?: string;
  hint?: string;
  details?: string;
  operation?: string;
  cause?: unknown;

  constructor(message: string, opts?: {
    code?: string;
    hint?: string;
    details?: string;
    operation?: string;
    cause?: unknown;
  }) {
    super(message);
    this.name = 'ApiError';
    this.code = opts?.code;
    this.hint = opts?.hint;
    this.details = opts?.details;
    this.operation = opts?.operation;
    this.cause = opts?.cause;
  }
}

type SupabaseLikeError = {
  message?: string;
  code?: string;
  hint?: string;
  details?: string;
};

export function mapSupabaseError(error: unknown, operation?: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const e = (error ?? {}) as SupabaseLikeError;
  return new ApiError(e.message || 'API request failed.', {
    code: e.code,
    hint: e.hint,
    details: e.details,
    operation,
    cause: error,
  });
}

export function throwApiError(error: unknown, operation?: string): never {
  throw mapSupabaseError(error, operation);
}
