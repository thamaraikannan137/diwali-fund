import { Router } from 'express';
import { Member } from '../models/Member';
import { Scheme } from '../models/Scheme';
import { Membership } from '../models/Membership';
import { Payment } from '../models/Payment';
import { logger } from '../utils/logger';

const router = Router();

/** Full snapshot for the mobile app to hydrate once after login. */
router.get('/', async (_req, res, next) => {
  try {
    const [members, schemes, ms, payments] = await Promise.all([
      Member.findAll({ order: [['name', 'ASC']] }),
      Scheme.findAll({ order: [['createdAt', 'ASC']] }),
      Membership.findAll({ order: [['createdAt', 'ASC']] }),
      Payment.findAll({ order: [['date', 'DESC']] }),
    ]);
    logger.info('Bootstrap snapshot', {
      members: members.length,
      schemes: schemes.length,
      memberships: ms.length,
      payments: payments.length,
    });
    res.json({ members, schemes, ms, payments });
  } catch (e) {
    next(e);
  }
});

export default router;
