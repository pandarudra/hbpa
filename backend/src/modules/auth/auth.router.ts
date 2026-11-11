import { Router } from 'express';
import { googleSignIn, logout, me } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/google', googleSignIn);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
