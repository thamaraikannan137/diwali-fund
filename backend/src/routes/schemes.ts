import { Router } from 'express';
import { z } from 'zod';
import { Scheme } from '../models/Scheme';
import { HttpError } from '../middleware/error';

const router = Router();

const schemeSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(['WEEKLY', 'MONTHLY']),
  unit: z.number().positive(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  color: z.string().optional(),
});

const COLORS = ['#E9A23B', '#1D4ED8', '#7C3AED', '#059669', '#DB2777', '#0891B2'];

router.get('/', async (_req, res, next) => {
  try {
    const schemes = await Scheme.findAll({ order: [['createdAt', 'ASC']] });
    res.json(schemes);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const scheme = await Scheme.findByPk(req.params.id);
    if (!scheme) throw new HttpError(404, 'Scheme not found');
    res.json(scheme);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = schemeSchema.parse({
      ...req.body,
      unit: Number(req.body.unit),
    });
    if (body.end < body.start) throw new HttpError(400, 'End date must be after start');

    const count = await Scheme.count();
    const scheme = await Scheme.create({
      id: 's' + Date.now(),
      name: body.name.trim(),
      type: body.type,
      unit: body.unit,
      start: body.start,
      end: body.end,
      color: body.color || COLORS[count % COLORS.length],
    });
    res.status(201).json(scheme);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = schemeSchema.parse({
      ...req.body,
      unit: Number(req.body.unit),
    });
    const scheme = await Scheme.findByPk(req.params.id);
    if (!scheme) throw new HttpError(404, 'Scheme not found');
    if (body.end < body.start) throw new HttpError(400, 'End date must be after start');

    await scheme.update({
      name: body.name.trim(),
      type: body.type,
      unit: body.unit,
      start: body.start,
      end: body.end,
      color: body.color || scheme.color,
    });
    res.json(scheme);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const scheme = await Scheme.findByPk(req.params.id);
    if (!scheme) throw new HttpError(404, 'Scheme not found');
    await scheme.destroy();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
