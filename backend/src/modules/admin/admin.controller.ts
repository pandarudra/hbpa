import type { Request, Response, NextFunction } from 'express';
import { firestore } from '../../config/firebase';
import { Errors } from '../../utils/errors';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const roleSchema = z.enum(['USER', 'ADMIN']);

/** GET /api/admin/users */
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    let query = firestore.collection('users').orderBy('createdAt', 'desc');
    if (req.query.role) query = query.where('role', '==', req.query.role);
    if (req.query.status) query = query.where('status', '==', req.query.status);

    const snap = await query.limit(limit).offset((page - 1) * limit).get();
    const users = snap.docs.map((d) => d.data());

    res.json({ success: true, users, pagination: { page, limit, total: snap.size } });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/users/:id/role */
export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Prevent self-modification
    if (req.user!.uid === id) throw Errors.selfRoleChange();

    const parsed = roleSchema.safeParse((req.body as { role?: string }).role);
    if (!parsed.success) throw Errors.invalidRole();

    const ref = firestore.collection('users').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw Errors.userNotFound();

    await ref.update({ role: parsed.data, updatedAt: FieldValue.serverTimestamp() });
    res.json({ success: true, user: { uid: id, role: parsed.data } });
  } catch (err) {
    next(err);
  }
}
