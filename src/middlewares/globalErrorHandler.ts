import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: { path: string | number; message: string }[] = [
    { path: '', message: 'Something went wrong' },
  ];

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errorSources = err.issues.map((issue) => ({
      path: String(issue.path[issue.path.length - 1] ?? ''),
      message: issue.message,
    }));
  }
  // Custom AppError
  else if (err?.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  }
  // Generic Error
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === 'development' ? err.stack : null,
  });
};

export default globalErrorHandler;

