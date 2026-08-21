import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-lms-jwt-secret-key-12345';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      user_id?: string;
      sub?: string;
      email?: string;
      role: string;
    };

    req.user = {
      id: decoded.id || decoded.user_id || '',
      email: decoded.email || decoded.sub || '',
      role: decoded.role,
    };

    if (!req.user.id) {
      return res.status(403).json({ message: 'Invalid token: missing user identity.' });
    }

    return next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export const roleGuard = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden. Requires ${requiredRole} role.` });
    }

    return next();
  };
};
