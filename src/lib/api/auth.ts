import { createClient } from '@/lib/client';
import { ApiError, throwApiError } from '@/lib/api/errors';

export async function getOptionalSessionUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throwApiError(error, 'auth.getSession');
  }

  return session?.user?.id ?? null;
}

export async function getRequiredSessionUserId(): Promise<string> {
  const userId = await getOptionalSessionUserId();
  if (!userId) {
    throw new ApiError('Authentication required.', {
      code: 'AUTH_REQUIRED',
      operation: 'auth.getSession',
    });
  }
  return userId;
}
