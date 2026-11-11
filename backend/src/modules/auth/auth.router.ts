import { Router } from 'express';
import { googleSignIn, logout, me } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { env } from '../../config/env';

const router = Router();

router.post('/google', googleSignIn);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.get('/domains', (_req, res) => {
  res.json({ success: true, domains: env.ALLOWED_EMAIL_DOMAINS });
});

export default router;
