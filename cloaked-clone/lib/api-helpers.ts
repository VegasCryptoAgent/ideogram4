import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { ZodError } from 'zod';

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function errorResponse(error: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, { status });
}

export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, 201);
}

export async function getAuthenticatedUser(req?: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user as { id: string; email: string; name?: string | null };
}

export function handleZodError(error: ZodError): NextResponse {
  const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  return errorResponse(`Validation error: ${messages}`, 400);
}

export function getPaginationParams(req: NextRequest): { page: number; limit: number; skip: number } {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function withAuth<T extends unknown[]>(
  handler: (userId: string, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    try {
      return await handler(user.id, ...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return handleZodError(err);
      }
      console.error('[API Error]', err);
      const message = err instanceof Error ? err.message : 'Internal server error';
      return errorResponse(message, 500);
    }
  };
}
