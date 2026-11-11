import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { listUsers } from './admin.controller';

const router = Router();

// Administrative API: Requires trusted session authentication and verified ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.get('/users', listUsers);

export default router;
