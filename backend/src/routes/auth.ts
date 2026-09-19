import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { requireAuth, signToken } from '../middleware/auth';
import { HttpError } from '../middleware/error';

const router = Router();

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(4),
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const phone = body.phone.replace(/\D/g, '');
    const user = await User.findOne({ where: { phone } });
    if (!user) throw new HttpError(401, 'Invalid phone or password');

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid phone or password');

    const token = signToken({ id: user.id, phone: user.phone, name: user.name });
    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
