import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/userModel';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    fullName: string;
  };
}

/**
 * Middleware: Verify Bearer JWT Token for protected admin routes
 */
export function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header with Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = userModel.verifyToken(token);

  if (!payload || !payload.id) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired session token. Please log in again.',
    });
    return;
  }

  req.user = payload;
  next();
}
