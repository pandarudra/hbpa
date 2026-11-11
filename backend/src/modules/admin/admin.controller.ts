import type { Request, Response, NextFunction } from 'express';
import { firestore } from '../../config/firebase';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
});

function formatTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

interface RawUserDoc {
  id?: string;
  uid?: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  role?: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'DISABLED';
  createdAt?: unknown;
  lastLoginAt?: unknown;
}

/**
 * GET /api/admin/users
 * Protected administrative user directory with server-side pagination, search & filters.
 */
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = querySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        code: 'INVALID_QUERY_PARAMS',
        message: 'Invalid pagination or filter parameters.',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { page, limit, search, role, status } = parseResult.data;

    let baseQuery: FirebaseFirestore.Query = firestore.collection('users');

    if (role) {
      baseQuery = baseQuery.where('role', '==', role);
    }
    if (status) {
      baseQuery = baseQuery.where('status', '==', status);
    }

    // Fetch matching documents.
    // By sorting in memory, we ensure queries never fail due to missing Firestore composite
    // indexes when combining where('role') / where('status') with orderBy('createdAt').
    const snap = await baseQuery.get();

    let allUsers = snap.docs.map((d) => {
      const data = d.data() as RawUserDoc;
      return {
        id: d.id,
        name: data.name ?? '',
        email: data.email ?? '',
        avatarUrl: data.avatarUrl ?? null,
        role: data.role ?? 'USER',
        status: data.status ?? 'ACTIVE',
        createdAt: formatTimestamp(data.createdAt),
        lastLoginAt: formatTimestamp(data.lastLoginAt),
      };
    });

    if (search && search.length > 0) {
      const term = search.toLowerCase();
      allUsers = allUsers.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
      );
    }

    // Sort by createdAt descending (newest first)
    allUsers.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const totalUsers = allUsers.length;
    const startIndex = (page - 1) * limit;
    const users = allUsers.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalUsers / limit) || 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalUsers,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
