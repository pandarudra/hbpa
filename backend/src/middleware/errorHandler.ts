import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/** Global Express error handler — must be registered last. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Unexpected errors — don't leak stack traces in production
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred.',
  });
}
