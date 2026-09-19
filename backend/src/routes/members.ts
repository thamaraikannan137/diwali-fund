import { Router } from 'express';
import { z } from 'zod';
import { Member } from '../models/Member';
import { HttpError } from '../middleware/error';

const router = Router();

const memberSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().min(10).max(15),
});

router.get('/', async (_req, res, next) => {
  try {
    const members = await Member.findAll({ order: [['name', 'ASC']] });
    res.json(members);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) throw new HttpError(404, 'Member not found');
    res.json(member);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = memberSchema.parse(req.body);
    const phone = body.phone.replace(/\D/g, '');
    const existing = await Member.findOne({ where: { phone } });
    if (existing) throw new HttpError(409, 'Phone already exists');

    const member = await Member.create({
      id: 'm' + Date.now(),
      name: body.name.trim(),
      phone,
    });
    res.status(201).json(member);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = memberSchema.parse(req.body);
    const member = await Member.findByPk(req.params.id);
    if (!member) throw new HttpError(404, 'Member not found');

    const phone = body.phone.replace(/\D/g, '');
    const clash = await Member.findOne({ where: { phone } });
    if (clash && clash.id !== member.id) throw new HttpError(409, 'Phone already exists');

    await member.update({ name: body.name.trim(), phone });
    res.json(member);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) throw new HttpError(404, 'Member not found');
    await member.destroy();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
