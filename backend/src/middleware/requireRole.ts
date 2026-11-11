import type { Request, Response, NextFunction } from 'express';
import { Errors } from '../utils/errors';
import type { UserRole } from '../modules/auth/auth.service';

/** RBAC guard — place after authenticate middleware. */
export function requireRole(role: UserRole) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (_req.user?.role !== role) return next(Errors.forbidden());
    next();
  };
}
