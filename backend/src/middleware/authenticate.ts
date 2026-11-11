import type { Request, Response, NextFunction } from 'express';
import { getIronSession } from 'iron-session';
import { env } from '../config/env';
import { Errors } from '../utils/errors';
import { getUserById } from '../modules/auth/auth.service';
import type { UserRole } from '../modules/auth/auth.service';

export interface SessionData {
  uid: string;
  role: UserRole;
}

// Extend Express Request so req.user is available in handlers
declare global {
  namespace Express {
    interface Request {
      user?: { uid: string; role: UserRole };
    }
  }
}

const sessionOptions = {
  cookieName: 'hbp_session',
  password: env.SESSION_SECRET,
  cookieOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: env.SESSION_MAX_AGE,
  },
};

/**
 * Verify the session cookie and attach req.user.
 * Also checks that the account is still ACTIVE in Firestore.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.uid) throw Errors.unauthenticated();

    // Re-fetch from Firestore to pick up the latest role and status
    const user = await getUserById(session.uid);
    req.user = { uid: user.uid, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}
