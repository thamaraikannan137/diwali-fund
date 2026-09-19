import { Router } from 'express';
import { z } from 'zod';
import { Membership } from '../models/Membership';
import { Member } from '../models/Member';
import { Scheme } from '../models/Scheme';
import { Payment } from '../models/Payment';
import { HttpError } from '../middleware/error';

const router = Router();

const createSchema = z.object({
  memberId: z.string().min(1),
  schemeId: z.string().min(1),
  units: z.number().int().positive().default(1),
});

const bulkSchema = z.object({
  schemeId: z.string().min(1),
  items: z
    .array(
      z.object({
        memberId: z.string().min(1),
        units: z.number().int().positive(),
      }),
    )
    .min(1),
});

const unitsSchema = z.object({
  units: z.number().int().positive(),
});

router.get('/', async (req, res, next) => {
  try {
    const where: Record<string, string> = {};
    if (typeof req.query.schemeId === 'string') where.schemeId = req.query.schemeId;
    if (typeof req.query.memberId === 'string') where.memberId = req.query.memberId;

    const rows = await Membership.findAll({
      where,
      include: [
        { model: Member, as: 'member' },
        { model: Scheme, as: 'scheme' },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await Membership.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: Scheme, as: 'scheme' },
        { model: Payment, as: 'payments' },
      ],
    });
    if (!row) throw new HttpError(404, 'Membership not found');
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse({
      ...req.body,
      units: Number(req.body.units ?? 1),
    });

    const member = await Member.findByPk(body.memberId);
    if (!member) throw new HttpError(404, 'Member not found');
    const scheme = await Scheme.findByPk(body.schemeId);
    if (!scheme) throw new HttpError(404, 'Scheme not found');

    const existing = await Membership.findOne({
      where: { memberId: body.memberId, schemeId: body.schemeId },
    });
    if (existing) throw new HttpError(409, 'Member already in scheme');

    const row = await Membership.create({
      id: 'ms' + Date.now(),
      memberId: body.memberId,
      schemeId: body.schemeId,
      units: body.units,
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

router.post('/bulk', async (req, res, next) => {
  try {
    const body = bulkSchema.parse({
      ...req.body,
      items: (req.body.items || []).map((i: { memberId: string; units: number }) => ({
        ...i,
        units: Number(i.units),
      })),
    });

    const scheme = await Scheme.findByPk(body.schemeId);
    if (!scheme) throw new HttpError(404, 'Scheme not found');

    const created = [];
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      const existing = await Membership.findOne({
        where: { memberId: item.memberId, schemeId: body.schemeId },
      });
      if (existing) continue;
      created.push(
        await Membership.create({
          id: 'ms' + Date.now() + i,
          memberId: item.memberId,
          schemeId: body.schemeId,
          units: item.units,
        }),
      );
    }
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/units', async (req, res, next) => {
  try {
    const body = unitsSchema.parse({ units: Number(req.body.units) });
    const row = await Membership.findByPk(req.params.id);
    if (!row) throw new HttpError(404, 'Membership not found');
    await row.update({ units: body.units });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const row = await Membership.findByPk(req.params.id);
    if (!row) throw new HttpError(404, 'Membership not found');
    await Payment.destroy({ where: { msId: row.id } });
    await row.destroy();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
