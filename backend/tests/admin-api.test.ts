/**
 * Admin API Unit & Integration Tests
 */

process.env.NODE_ENV = 'test';
process.env.ALLOWED_EMAIL_DOMAINS = 'hbplus.fit,acme.com';
process.env.SESSION_SECRET = 'test-secret-must-be-at-least-32-chars-long';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.GOOGLE_WEB_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/dev/null';

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { requireRole } from '../src/middleware/requireRole';
import { listUsers } from '../src/modules/admin/admin.controller';
import { firestore } from '../src/config/firebase';
import adminRouter from '../src/modules/admin/admin.router';
import app from '../src/app';

// Mock firestore
jest.mock('../src/config/firebase', () => {
  const mockCollection = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: () => ({ count: 2 }),
      }),
    }),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: 'user_1',
          data: () => ({
            name: 'Admin User',
            email: 'admin@hbplus.fit',
            avatarUrl: 'https://example.com/avatar1.png',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            lastLoginAt: new Date('2026-01-15T00:00:00.000Z'),
          }),
        },
        {
          id: 'user_2',
          data: () => ({
            name: 'Regular Member',
            email: 'member@hbplus.fit',
            avatarUrl: null,
            role: 'USER',
            status: 'ACTIVE',
            createdAt: new Date('2026-01-05T00:00:00.000Z'),
            lastLoginAt: null,
          }),
        },
      ],
    }),
  };

  return {
    firestore: {
      collection: jest.fn().mockReturnValue(mockCollection),
    },
    firebaseAuth: {},
    firebaseApp: {},
  };
});

describe('Admin Authorization Middleware (requireRole)', () => {
  let testApp: express.Express;

  beforeAll(() => {
    testApp = express();
    testApp.use(express.json());

    // Inject simulated authenticated user
    testApp.use((req: Request, _res: Response, next: NextFunction) => {
      const roleHeader = req.headers['x-simulated-role'] as 'USER' | 'ADMIN' | undefined;
      if (roleHeader) {
        req.user = { uid: 'test-uid', role: roleHeader };
      }
      next();
    });

    testApp.get('/admin-only', requireRole('ADMIN'), (_req, res) => {
      res.json({ success: true, message: 'Welcome admin' });
    });

    // Error handler
    testApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.statusCode || 500).json({
        success: false,
        code: err.code || 'INTERNAL_ERROR',
        message: err.message,
      });
    });
  });

  it('rejects unauthenticated or non-admin users with 403 Forbidden', async () => {
    const res = await request(testApp)
      .get('/admin-only')
      .set('x-simulated-role', 'USER');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows authenticated users with ADMIN role with 200 OK', async () => {
    const res = await request(testApp)
      .get('/admin-only')
      .set('x-simulated-role', 'ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Welcome admin');
  });
});

describe('Admin User Directory Controller (listUsers)', () => {
  let testApp: express.Express;

  beforeAll(() => {
    testApp = express();
    testApp.use(express.json());
    testApp.get('/api/admin/users', listUsers);

    testApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.statusCode || 500).json({
        success: false,
        code: err.code || 'INTERNAL_ERROR',
        message: err.message,
      });
    });
  });

  it('validates query parameters and rejects invalid page number', async () => {
    const res = await request(testApp).get('/api/admin/users?page=0');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_QUERY_PARAMS');
  });

  it('validates query parameters and rejects invalid limit', async () => {
    const res = await request(testApp).get('/api/admin/users?limit=500');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_QUERY_PARAMS');
  });

  it('validates query parameters and rejects unknown role', async () => {
    const res = await request(testApp).get('/api/admin/users?role=SUPERADMIN');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_QUERY_PARAMS');
  });

  it('validates query parameters and rejects unknown status', async () => {
    const res = await request(testApp).get('/api/admin/users?status=BANNED');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_QUERY_PARAMS');
  });

  it('returns paginated users list with valid pagination contract', async () => {
    const res = await request(testApp).get('/api/admin/users?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toBeInstanceOf(Array);
    expect(res.body.data.users.length).toBe(2);

    const firstUser = res.body.data.users[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name', 'Regular Member');
    expect(firstUser).toHaveProperty('email', 'member@hbplus.fit');
    expect(firstUser).toHaveProperty('role', 'USER');
    expect(firstUser).toHaveProperty('status', 'ACTIVE');
    expect(firstUser).toHaveProperty('createdAt');

    const secondUser = res.body.data.users[1];
    expect(secondUser).toHaveProperty('name', 'Admin User');
    expect(secondUser).toHaveProperty('email', 'admin@hbplus.fit');
    expect(secondUser).toHaveProperty('role', 'ADMIN');

    expect(res.body.data.pagination).toEqual({
      currentPage: 1,
      pageSize: 10,
      totalUsers: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it('performs keyword search filtering correctly', async () => {
    const res = await request(testApp).get('/api/admin/users?search=member');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.length).toBe(1);
    expect(res.body.data.users[0].name).toBe('Regular Member');
    expect(res.body.data.pagination.totalUsers).toBe(1);
  });
});

describe('GET /api/admin/users End-to-End Route Guard', () => {
  it('blocks unauthenticated requests with 401 UNAUTHENTICATED', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });
});
