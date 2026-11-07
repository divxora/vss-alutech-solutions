import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  console.error('[ServerError]', req.method, req.originalUrl, err);

  // Multer-specific error handling
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'Uploaded file exceeds the maximum allowed limit of 25 MB.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
    return;
  }

  // Multer file filter rejection
  if (err && err.message && err.message.includes('Unsupported file type')) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // JSON syntax parsing error
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body.',
    });
    return;
  }

  // Default internal server error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred. Please try again.',
  });
}
