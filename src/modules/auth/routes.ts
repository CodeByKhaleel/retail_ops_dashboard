import { Router } from 'express';
import { getDemoConfig, createSession, clearSession } from './auth.controller';

const router = Router();

/**
 * GET /api/auth/config
 * Returns demo auth configuration
 */
router.get('/config', getDemoConfig);

/**
 * POST /api/auth/session
 * Creates a session cookie
 */
router.post('/session', createSession);

/**
 * POST /api/auth/logout
 * Clears the session cookie
 */
router.post('/logout', clearSession);

export default router;
