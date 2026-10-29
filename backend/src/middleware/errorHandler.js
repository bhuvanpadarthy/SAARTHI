import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  // Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      rule: e.code,
    }));

    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or parameters',
        details: formattedErrors,
      },
    });
  }

  // Custom application error with statusCode
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 409 ? 'CONFLICT' : 'INTERNAL_ERROR');

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('[SERVER_ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected server error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
