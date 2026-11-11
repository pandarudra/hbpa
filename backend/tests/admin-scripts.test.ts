/**
 * Terminal Admin Provisioning Scripts Tests
 */

process.env.NODE_ENV = 'test';
process.env.ALLOWED_EMAIL_DOMAINS = 'hbplus.fit,acme.com';
process.env.SESSION_SECRET = 'test-secret-must-be-at-least-32-chars-long';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.GOOGLE_WEB_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/dev/null';

import { createAdmin } from '../scripts/create-admin';
import { removeAdmin } from '../scripts/remove-admin';
import { listAdmins } from '../scripts/list-admins';
import { firestore, firebaseAuth } from '../src/config/firebase';

// Mock Firebase Config
jest.mock('../src/config/firebase', () => {
  return {
    firestore: {
      collection: jest.fn(),
    },
    firebaseAuth: {
      getUserByEmail: jest.fn(),
    },
    firebaseApp: {},
  };
});

describe('Terminal Admin Provisioning Scripts', () => {
  let mockExit: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: any) => {
      throw new Error(`process.exit called with ${code}`);
    });
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('createAdmin', () => {
    it('rejects email belonging to unauthorized domain', async () => {
      await expect(createAdmin('attacker@gmail.com')).rejects.toThrow(
        'process.exit called with 1',
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('is not in the ALLOWED_EMAIL_DOMAINS allowlist'),
      );
    });

    it('rejects non-existent user with guidance to authenticate first', async () => {
      (firestore.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true }),
      });
      (firebaseAuth.getUserByEmail as jest.Mock).mockRejectedValue(
        new Error('auth/user-not-found'),
      );

      await expect(createAdmin('newuser@hbplus.fit')).rejects.toThrow(
        'process.exit called with 1',
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('has not signed in to the application yet'),
      );
    });

    it('promotes an existing regular USER in database to ADMIN', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      (firestore.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: 'user_123',
              ref: { update: mockUpdate },
              data: () => ({
                name: 'Alice Cooper',
                email: 'alice@hbplus.fit',
                role: 'USER',
                status: 'ACTIVE',
              }),
            },
          ],
        }),
      });

      await createAdmin('alice@hbplus.fit');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'ADMIN',
          status: 'ACTIVE',
        }),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successfully promoted "alice@hbplus.fit" to ADMIN'),
      );
    });

    it('handles idempotent call when user is already active ADMIN', async () => {
      const mockUpdate = jest.fn();
      (firestore.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: 'admin_123',
              ref: { update: mockUpdate },
              data: () => ({
                name: 'Existing Admin',
                email: 'admin@hbplus.fit',
                role: 'ADMIN',
                status: 'ACTIVE',
              }),
            },
          ],
        }),
      });

      await createAdmin('admin@hbplus.fit');

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('is already an active ADMIN'),
      );
    });
  });

  describe('removeAdmin', () => {
    it('exits with error if target user does not exist in database', async () => {
      (firestore.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true }),
      });

      await expect(removeAdmin('nonexistent@hbplus.fit')).rejects.toThrow(
        'process.exit called with 1',
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('not found in database'),
      );
    });

    it('does nothing if target user is not an administrator', async () => {
      const mockUpdate = jest.fn();
      (firestore.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: 'user_456',
              ref: { update: mockUpdate },
              data: () => ({
                name: 'Regular Bob',
                email: 'bob@hbplus.fit',
                role: 'USER',
                status: 'ACTIVE',
              }),
            },
          ],
        }),
      });

      await removeAdmin('bob@hbplus.fit');

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('is not an administrator'),
      );
    });

    it('CRITICAL SAFETY CHECK: Blocks removal if target is the ONLY active admin', async () => {
      const mockUpdate = jest.fn();
      (firestore.collection as jest.Mock).mockImplementation((colName: string) => {
        return {
          where: jest.fn().mockImplementation((field: string, _op: string, val: string) => {
            if (field === 'email') {
              return {
                get: jest.fn().mockResolvedValue({
                  empty: false,
                  docs: [
                    {
                      id: 'last_admin',
                      ref: { update: mockUpdate },
                      data: () => ({
                        name: 'Solo Admin',
                        email: 'solo@hbplus.fit',
                        role: 'ADMIN',
                        status: 'ACTIVE',
                      }),
                    },
                  ],
                }),
              };
            }
            // activeAdminsQuery
            return {
              where: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                size: 1, // Only 1 active admin!
              }),
            };
          }),
        };
      });

      await expect(removeAdmin('solo@hbplus.fit')).rejects.toThrow(
        'process.exit called with 1',
      );
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('SAFETY CHECK FAILED: Cannot remove administrator'),
      );
    });

    it('successfully revokes admin privileges when other active admins exist', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      (firestore.collection as jest.Mock).mockImplementation((colName: string) => {
        return {
          where: jest.fn().mockImplementation((field: string) => {
            if (field === 'email') {
              return {
                get: jest.fn().mockResolvedValue({
                  empty: false,
                  docs: [
                    {
                      id: 'admin_to_remove',
                      ref: { update: mockUpdate },
                      data: () => ({
                        name: 'Admin Two',
                        email: 'two@hbplus.fit',
                        role: 'ADMIN',
                        status: 'ACTIVE',
                      }),
                    },
                  ],
                }),
              };
            }
            // activeAdminsQuery
            return {
              where: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                size: 2, // 2 active admins exist
              }),
            };
          }),
        };
      });

      await removeAdmin('two@hbplus.fit');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'USER',
        }),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successfully revoked administrative privileges'),
      );
    });
  });

  describe('listAdmins', () => {
    it('prints formatted administrator list without credentials', async () => {
      (firestore.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          size: 1,
          docs: [
            {
              id: 'admin_id_1',
              data: () => ({
                name: 'Lead Admin',
                email: 'lead@hbplus.fit',
                role: 'ADMIN',
                status: 'ACTIVE',
                createdAt: new Date('2026-01-01T00:00:00Z'),
              }),
            },
          ],
        }),
      });

      await listAdmins();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Total: 1 administrator(s) registered'),
      );
    });
  });
});
