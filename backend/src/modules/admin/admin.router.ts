import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { listUsers, updateRole } from './admin.controller';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/users', listUsers);
router.patch('/users/:id/role', updateRole);

export default router;
