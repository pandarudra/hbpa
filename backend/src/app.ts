import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRouter from './modules/auth/auth.router';
import adminRouter from './modules/admin/admin.router';
import { authenticate } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandler';
import { getUserById } from './modules/auth/auth.service';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// GET /api/dashboard
app.get('/api/dashboard', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user!.uid);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
