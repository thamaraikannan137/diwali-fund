import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import authRoutes from './auth';
import membersRoutes from './members';
import schemesRoutes from './schemes';
import membershipsRoutes from './memberships';
import paymentsRoutes from './payments';
import bootstrapRoutes from './bootstrap';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'diwali-fund-api' });
});

router.use('/auth', authRoutes);
router.use('/bootstrap', requireAuth, bootstrapRoutes);
router.use('/members', requireAuth, membersRoutes);
router.use('/schemes', requireAuth, schemesRoutes);
router.use('/memberships', requireAuth, membershipsRoutes);
router.use('/payments', requireAuth, paymentsRoutes);

export default router;
