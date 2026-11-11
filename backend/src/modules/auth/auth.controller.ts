import type { Request, Response, NextFunction } from 'express';
import { verifyAndLogin, getUserById } from './auth.service';
import { getIronSession } from 'iron-session';
import { env } from '../../config/env';
import type { SessionData } from '../../middleware/authenticate';

const sessionOptions = {
  cookieName: 'hbp_session',
  password: env.SESSION_SECRET,
  cookieOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: env.SESSION_MAX_AGE,
  },
};

/** POST /api/auth/google */
export async function googleSignIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      res.status(400).json({ success: false, code: 'MISSING_TOKEN', message: 'idToken is required' });
      return;
    }

    const user = await verifyAndLogin(idToken);

    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.uid = user.uid;
    session.role = user.role;
    await session.save();

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.destroy();
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserById(req.user!.uid);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}
